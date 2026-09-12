import { execFile } from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'
import {
  GitStatusResult,
  GitFileStatus,
  GitFileStatusType,
  GitLineChurn,
  GitFileChurnResult,
  GitRemote,
  GitBranchInfo,
  GitSyncStatus,
  GitStashItem,
  GitCommitLogItem
} from '../../shared/types'

// Mutex queue per workspace to prevent .git/index.lock collisions during mutating operations
const workspaceQueues = new Map<string, Promise<any>>()

export function runGit(args: string[], cwd: string, isMutating = false): Promise<string> {
  const execute = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      execFile(
        'git',
        args,
        {
          cwd,
          maxBuffer: 15 * 1024 * 1024,
          windowsHide: true,
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0'
          }
        },
        async (error, stdout, stderr) => {
          if (error) {
            const errOutput = stderr || stdout || error.message
            // If index.lock collision, check if lockfile is stale (older than 6s) and purge it
            if (errOutput.includes('index.lock')) {
              try {
                const lockPath = path.join(cwd, '.git', 'index.lock')
                const stat = await fs.stat(lockPath).catch(() => null)
                if (stat && Date.now() - stat.mtimeMs > 6000) {
                  await fs.unlink(lockPath).catch(() => null)
                  console.warn('[GitService] Purged stale .git/index.lock')
                }
              } catch {
                // Ignore lock cleanup error
              }
            }
            reject(new Error(errOutput))
          } else {
            resolve(stdout)
          }
        }
      )
    })
  }

  if (isMutating && cwd) {
    const prevQueue = workspaceQueues.get(cwd) || Promise.resolve()
    const nextQueue = prevQueue
      .catch(() => {})
      .then(() => execute())
    workspaceQueues.set(cwd, nextQueue)
    return nextQueue
  }

  return execute()
}

export class GitService {
  public async isGitRepo(workspacePath: string): Promise<boolean> {
    if (!workspacePath) return false
    try {
      const out = await runGit(['rev-parse', '--is-inside-work-tree'], workspacePath)
      return out.trim() === 'true'
    } catch {
      return false
    }
  }

  public async getBranch(workspacePath: string): Promise<string | null> {
    if (!workspacePath) return null
    try {
      const branch = await runGit(['branch', '--show-current'], workspacePath)
      const trimmed = branch.trim()
      if (trimmed) return trimmed

      // Fallback for detached HEAD
      const shortHead = await runGit(['rev-parse', '--short', 'HEAD'], workspacePath)
      return shortHead.trim() ? `(${shortHead.trim()})` : null
    } catch {
      return null
    }
  }

  public async getStatus(workspacePath: string): Promise<GitStatusResult> {
    const emptyResult: GitStatusResult = {
      isRepo: false,
      branch: null,
      staged: [],
      unstaged: [],
      untracked: []
    }

    if (!workspacePath) return emptyResult

    const isRepo = await this.isGitRepo(workspacePath)
    if (!isRepo) return emptyResult

    const branch = await this.getBranch(workspacePath)

    try {
      // --porcelain=v1 -uall outputs every individual untracked file
      const output = await runGit(['status', '--porcelain=v1', '-uall'], workspacePath)
      const lines = output.split(/\r?\n/).filter((l) => l.length >= 3)

      const staged: GitFileStatus[] = []
      const unstaged: GitFileStatus[] = []
      const untracked: GitFileStatus[] = []

      for (const line of lines) {
        const x = line[0] // Staged status
        const y = line[1] // Unstaged status
        let rawPath = line.substring(3).trim()

        // Handle quoted paths (e.g. "path with spaces/file.ts")
        if (rawPath.startsWith('"') && rawPath.endsWith('"')) {
          rawPath = rawPath.slice(1, -1)
        }

        // Handle rename arrow: "old -> new"
        if (rawPath.includes(' -> ')) {
          const parts = rawPath.split(' -> ')
          rawPath = parts[1]
        }

        // Normalize path separators
        const relPath = rawPath.replace(/\\/g, '/')
        const fullPath = path.join(workspacePath, relPath).replace(/\\/g, '/')
        const fileName = path.basename(fullPath)

        // 1. Untracked file
        if (x === '?' && y === '?') {
          untracked.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: 'U',
            staged: false
          })
          continue
        }

        // 2. Staged changes (X)
        if (x !== ' ' && x !== '?') {
          staged.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: x as GitFileStatusType,
            staged: true
          })
        }

        // 3. Unstaged changes (Y)
        if (y !== ' ' && y !== '?') {
          unstaged.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: y as GitFileStatusType,
            staged: false
          })
        }
      }

      return {
        isRepo: true,
        branch,
        staged,
        unstaged,
        untracked
      }
    } catch (err) {
      console.error('Failed to get git status:', err)
      return {
        isRepo: true,
        branch,
        staged: [],
        unstaged: [],
        untracked: []
      }
    }
  }

  public async stageFile(workspacePath: string, relativePath: string): Promise<boolean> {
    try {
      await runGit(['add', '--', relativePath], workspacePath)
      return true
    } catch (err) {
      console.error(`Failed to stage file ${relativePath}:`, err)
      return false
    }
  }

  public async unstageFile(workspacePath: string, relativePath: string): Promise<boolean> {
    try {
      // Try git restore --staged first, fallback to git reset HEAD
      try {
        await runGit(['restore', '--staged', '--', relativePath], workspacePath)
      } catch {
        await runGit(['reset', 'HEAD', '--', relativePath], workspacePath)
      }
      return true
    } catch (err) {
      console.error(`Failed to unstage file ${relativePath}:`, err)
      return false
    }
  }

  public async stageAll(workspacePath: string): Promise<boolean> {
    try {
      await runGit(['add', '-A'], workspacePath)
      return true
    } catch (err) {
      console.error('Failed to stage all files:', err)
      return false
    }
  }

  public async unstageAll(workspacePath: string): Promise<boolean> {
    try {
      await runGit(['reset'], workspacePath)
      return true
    } catch (err) {
      console.error('Failed to unstage all files:', err)
      return false
    }
  }

  public async discardFile(
    workspacePath: string,
    relativePath: string,
    isUntracked = false
  ): Promise<boolean> {
    try {
      if (isUntracked) {
        const fullPath = path.join(workspacePath, relativePath)
        await fs.rm(fullPath, { recursive: true, force: true })
      } else {
        try {
          await runGit(['restore', '--', relativePath], workspacePath)
        } catch {
          await runGit(['checkout', '--', relativePath], workspacePath)
        }
      }
      return true
    } catch (err) {
      console.error(`Failed to discard file ${relativePath}:`, err)
      return false
    }
  }

  public async getFileAtHead(
    workspacePath: string,
    relativePath: string
  ): Promise<string | null> {
    if (!workspacePath || !relativePath) return null
    try {
      const gitRelPath = relativePath.replace(/\\/g, '/')
      const content = await runGit(['show', `HEAD:${gitRelPath}`], workspacePath)
      return content
    } catch {
      // File might be untracked or newly added in index
      return ''
    }
  }

  public async getDiff(
    workspacePath: string,
    relativePath: string,
    staged = false
  ): Promise<string> {
    if (!workspacePath || !relativePath) return ''
    try {
      const gitRelPath = relativePath.replace(/\\/g, '/')
      if (staged) {
        return await runGit(['diff', '--staged', '--', gitRelPath], workspacePath)
      }
      try {
        return await runGit(['diff', 'HEAD', '--', gitRelPath], workspacePath)
      } catch {
        return await runGit(['diff', '--', gitRelPath], workspacePath)
      }
    } catch {
      return ''
    }
  }

  public async commit(workspacePath: string, message: string): Promise<boolean> {
    if (!message || !message.trim()) return false
    try {
      await runGit(['commit', '-m', message.trim()], workspacePath)
      return true
    } catch (err) {
      console.error('Failed to commit:', err)
      return false
    }
  }

  public async getFileChurn(
    workspacePath: string,
    relativePath: string
  ): Promise<GitFileChurnResult | null> {
    if (!workspacePath || !relativePath) return null

    try {
      const isRepo = await this.isGitRepo(workspacePath)
      if (!isRepo) return null

      const gitRelPath = relativePath.replace(/\\/g, '/')
      let stdout: string
      try {
        stdout = await runGit(['blame', '--line-porcelain', '--', gitRelPath], workspacePath)
      } catch {
        return null
      }

      if (!stdout || stdout.trim().length === 0) return null

      interface CommitInfo {
        author: string
        authorMail: string
        authorTime: number
        summary: string
      }

      const commitCache = new Map<string, CommitInfo>()
      const rawLines: Array<{
        lineNumber: number
        commitHash: string
        shortHash: string
        author: string
        authorEmail: string
        authorTime: number
        summary: string
      }> = []

      const lines = stdout.split(/\r?\n/)
      let currentHash = ''
      let currentFinalLine = 0
      let currentAuthor = 'Unknown'
      let currentMail = ''
      let currentAuthorTime = 0
      let currentSummary = ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Header start: 40 hex characters followed by original & final line numbers
        const headerMatch = line.match(/^([0-9a-fA-F]{40})\s+\d+\s+(\d+)/)
        if (headerMatch) {
          currentHash = headerMatch[1]
          currentFinalLine = parseInt(headerMatch[2], 10)

          if (commitCache.has(currentHash)) {
            const cached = commitCache.get(currentHash)!
            currentAuthor = cached.author
            currentMail = cached.authorMail
            currentAuthorTime = cached.authorTime
            currentSummary = cached.summary
          } else {
            currentAuthor = 'Unknown'
            currentMail = ''
            currentAuthorTime = 0
            currentSummary = ''
          }
          continue
        }

        if (line.startsWith('author ')) {
          currentAuthor = line.substring(7).trim()
        } else if (line.startsWith('author-mail ')) {
          currentMail = line.substring(12).trim().replace(/^<|>$/g, '')
        } else if (line.startsWith('author-time ')) {
          currentAuthorTime = parseInt(line.substring(12).trim(), 10) || 0
        } else if (line.startsWith('summary ')) {
          currentSummary = line.substring(8).trim()
        } else if (line.startsWith('\t')) {
          // Line content delimiter marks the completion of the line metadata
          if (currentHash && currentFinalLine > 0) {
            commitCache.set(currentHash, {
              author: currentAuthor,
              authorMail: currentMail,
              authorTime: currentAuthorTime,
              summary: currentSummary
            })

            rawLines.push({
              lineNumber: currentFinalLine,
              commitHash: currentHash,
              shortHash: currentHash.slice(0, 7),
              author: currentAuthor,
              authorEmail: currentMail,
              authorTime: currentAuthorTime,
              summary: currentSummary
            })
          }
        }
      }

      if (rawLines.length === 0) return null

      const now = Math.floor(Date.now() / 1000)
      const validTimes = rawLines
        .map((l) => l.authorTime)
        .filter((t) => t > 0 && !isNaN(t))

      const lastModified = validTimes.length > 0 ? Math.max(...validTimes) : now
      const oldestModified = validTimes.length > 0 ? Math.min(...validTimes) : now
      const uniqueAuthors = Array.from(
        new Set(
          rawLines
            .map((l) => l.author)
            .filter((a) => a && a !== 'Not Committed Yet' && a !== 'Unknown')
        )
      )
      const uniqueCommits = new Set(
        rawLines
          .map((l) => l.commitHash)
          .filter((h) => !h.startsWith('0000000'))
      )

      const ONE_DAY = 86400
      const ONE_WEEK = 7 * ONE_DAY
      const ONE_MONTH = 30 * ONE_DAY
      const THREE_MONTHS = 90 * ONE_DAY

      const processedLines: GitLineChurn[] = rawLines.map((l) => {
        const isUncommitted = l.commitHash.startsWith('0000000') || l.author === 'Not Committed Yet'
        let heatLevel: 1 | 2 | 3 | 4 | 5 = 1
        let heatScore = 0.2
        let relativeTime = ''

        if (isUncommitted) {
          heatLevel = 5
          heatScore = 1.0
          relativeTime = 'Uncommitted (Working Tree)'
        } else if (l.authorTime > 0) {
          const ageSeconds = Math.max(0, now - l.authorTime)

          // 1. Calculate base tier by absolute age
          if (ageSeconds <= 2 * ONE_DAY) {
            heatLevel = 5
            heatScore = 1.0
          } else if (ageSeconds <= ONE_WEEK) {
            heatLevel = 4
            heatScore = 0.8
          } else if (ageSeconds <= ONE_MONTH) {
            heatLevel = 3
            heatScore = 0.6
          } else if (ageSeconds <= THREE_MONTHS) {
            heatLevel = 2
            heatScore = 0.4
          } else {
            heatLevel = 1
            heatScore = 0.2
          }

          // 2. Relative boost if line was part of recent commit activity in this file
          if (lastModified > oldestModified) {
            const fileRecency = (l.authorTime - oldestModified) / (lastModified - oldestModified)
            if (fileRecency >= 0.85 && heatLevel < 4) {
              heatLevel = Math.min(5, heatLevel + 1) as 1 | 2 | 3 | 4 | 5
            }
          }

          // Format relative time
          if (ageSeconds < 60) {
            relativeTime = 'Just now'
          } else if (ageSeconds < 3600) {
            const mins = Math.floor(ageSeconds / 60)
            relativeTime = `${mins}m ago`
          } else if (ageSeconds < ONE_DAY) {
            const hrs = Math.floor(ageSeconds / 3600)
            relativeTime = `${hrs}h ago`
          } else if (ageSeconds < ONE_WEEK) {
            const days = Math.floor(ageSeconds / ONE_DAY)
            relativeTime = `${days}d ago`
          } else if (ageSeconds < ONE_MONTH) {
            const weeks = Math.floor(ageSeconds / ONE_WEEK)
            relativeTime = `${weeks}w ago`
          } else if (ageSeconds < 365 * ONE_DAY) {
            const months = Math.floor(ageSeconds / ONE_MONTH)
            relativeTime = `${months}mo ago`
          } else {
            const years = Math.floor(ageSeconds / (365 * ONE_DAY))
            relativeTime = `${years}y ago`
          }
        } else {
          relativeTime = 'Unknown'
        }

        const dateStr = l.authorTime > 0 ? new Date(l.authorTime * 1000).toLocaleDateString() : ''

        return {
          lineNumber: l.lineNumber,
          commitHash: l.commitHash,
          shortHash: l.shortHash,
          author: l.author,
          authorEmail: l.authorEmail,
          authorTime: l.authorTime,
          dateStr,
          relativeTime,
          summary: l.summary,
          heatLevel,
          heatScore
        }
      })

      return {
        filePath: gitRelPath,
        totalCommits: uniqueCommits.size,
        uniqueAuthors,
        lines: processedLines,
        lastModified,
        oldestModified
      }
    } catch (err) {
      console.error(`Failed to get file churn for ${relativePath}:`, err)
      return null
    }
  }

  public async initRepo(workspacePath: string, defaultBranch = 'main'): Promise<boolean> {
    if (!workspacePath) return false
    try {
      try {
        await runGit(['init', '-b', defaultBranch], workspacePath, true)
      } catch {
        await runGit(['init'], workspacePath, true)
        try {
          await runGit(['checkout', '-b', defaultBranch], workspacePath, true)
        } catch {
          // Ignore fallback checkout error
        }
      }
      return true
    } catch (err) {
      console.error('Failed to init repo:', err)
      return false
    }
  }

  public async createGitignore(workspacePath: string, templateType: string): Promise<boolean> {
    if (!workspacePath) return false
    const gitignorePath = path.join(workspacePath, '.gitignore')
    let content = ''
    switch (templateType.toLowerCase()) {
      case 'node':
        content = `# Dependencies\nnode_modules/\n.pnp\n.pnp.js\n\n# Production\ndist/\nout/\nbuild/\n\n# Environment\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n# Logs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# System\n.DS_Store\nThumbs.db\n`
        break
      case 'python':
        content = `# Byte-compiled / optimized / DLL files\n__pycache__/\n*.py[cod]\n*$py.class\n\n# Virtual Environments\n.env\n.venv\nenv/\nvenv/\nENV/\n\n# Distribution / packaging\ndist/\nbuild/\n*.egg-info/\n\n# System\n.DS_Store\nThumbs.db\n`
        break
      case 'rust':
        content = `# Output\n/target/\n**/*.rs.bk\nCargo.lock\n\n# Environment\n.env\n\n# System\n.DS_Store\nThumbs.db\n`
        break
      default:
        content = `# Dependencies & Builds\nnode_modules/\ndist/\nout/\nbuild/\ntarget/\n\n# Environment & Secrets\n.env\n.env.local\n*.pem\n*.key\n\n# Logs & OS\n*.log\n.DS_Store\nThumbs.db\n`
        break
    }

    try {
      let existing = ''
      try {
        existing = await fs.readFile(gitignorePath, 'utf8')
      } catch {
        // file does not exist yet
      }
      if (existing) {
        content = `${existing.trim()}\n\n# Added by Bodhi\n${content}`
      }
      await fs.writeFile(gitignorePath, content, 'utf8')
      return true
    } catch (err) {
      console.error('Failed to create .gitignore:', err)
      return false
    }
  }

  public async getRemotes(workspacePath: string): Promise<GitRemote[]> {
    if (!workspacePath) return []
    try {
      const output = await runGit(['remote', '-v'], workspacePath)
      const lines = output.split(/\r?\n/).filter((l) => l.trim())
      const remoteMap = new Map<string, { fetchUrl: string; pushUrl: string }>()

      for (const line of lines) {
        const parts = line.split(/\s+/)
        if (parts.length >= 3) {
          const name = parts[0]
          const url = parts[1]
          const type = parts[2]

          const curr = remoteMap.get(name) || { fetchUrl: '', pushUrl: '' }
          if (type.includes('(fetch)')) {
            curr.fetchUrl = url
          } else if (type.includes('(push)')) {
            curr.pushUrl = url
          }
          remoteMap.set(name, curr)
        }
      }

      const remotes: GitRemote[] = []
      for (const [name, urls] of remoteMap.entries()) {
        remotes.push({
          name,
          fetchUrl: urls.fetchUrl || urls.pushUrl,
          pushUrl: urls.pushUrl || urls.fetchUrl
        })
      }
      return remotes
    } catch {
      return []
    }
  }

  public async addRemote(workspacePath: string, name: string, url: string): Promise<boolean> {
    if (!workspacePath || !name || !url) return false
    try {
      await runGit(['remote', 'add', name.trim(), url.trim()], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to add remote ${name}:`, err)
      return false
    }
  }

  public async removeRemote(workspacePath: string, name: string): Promise<boolean> {
    if (!workspacePath || !name) return false
    try {
      await runGit(['remote', 'remove', name.trim()], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to remove remote ${name}:`, err)
      return false
    }
  }

  public async setRemoteUrl(workspacePath: string, name: string, url: string): Promise<boolean> {
    if (!workspacePath || !name || !url) return false
    try {
      await runGit(['remote', 'set-url', name.trim(), url.trim()], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to set remote url for ${name}:`, err)
      return false
    }
  }

  public async getBranches(workspacePath: string): Promise<GitBranchInfo[]> {
    if (!workspacePath) return []
    try {
      const output = await runGit(['branch', '-a', '--no-color'], workspacePath)
      const lines = output.split(/\r?\n/).filter((l) => l.trim())
      const branches: GitBranchInfo[] = []

      for (const line of lines) {
        const isCurrent = line.startsWith('*')
        let branchName = line.replace(/^[* ]\s*/, '').trim()

        // Handle detached HEAD
        if (branchName.startsWith('(HEAD detached')) {
          continue
        }

        const isRemote = branchName.startsWith('remotes/')
        if (isRemote) {
          // Ignore HEAD pointers like remotes/origin/HEAD -> origin/main
          if (branchName.includes(' -> ')) continue
          branchName = branchName.replace(/^remotes\//, '')
        }

        branches.push({
          name: branchName,
          current: isCurrent,
          remote: isRemote
        })
      }

      return branches
    } catch {
      return []
    }
  }

  public async checkoutBranch(
    workspacePath: string,
    branchName: string,
    createNew = false
  ): Promise<boolean> {
    if (!workspacePath || !branchName) return false
    try {
      if (createNew) {
        await runGit(['checkout', '-b', branchName.trim()], workspacePath, true)
      } else {
        await runGit(['checkout', branchName.trim()], workspacePath, true)
      }
      return true
    } catch (err) {
      console.error(`Failed to checkout branch ${branchName}:`, err)
      return false
    }
  }

  public async createBranch(workspacePath: string, branchName: string): Promise<boolean> {
    if (!workspacePath || !branchName) return false
    try {
      await runGit(['branch', branchName.trim()], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to create branch ${branchName}:`, err)
      return false
    }
  }

  public async deleteBranch(
    workspacePath: string,
    branchName: string,
    force = false
  ): Promise<boolean> {
    if (!workspacePath || !branchName) return false
    try {
      await runGit(['branch', force ? '-D' : '-d', branchName.trim()], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to delete branch ${branchName}:`, err)
      return false
    }
  }

  public async mergeBranch(
    workspacePath: string,
    branchName: string
  ): Promise<{ success: boolean; message: string }> {
    if (!workspacePath || !branchName) {
      return { success: false, message: 'Invalid arguments' }
    }
    try {
      const stdout = await runGit(['merge', branchName.trim()], workspacePath, true)
      return { success: true, message: stdout.trim() || 'Merge successful' }
    } catch (err: any) {
      return { success: false, message: err.message || 'Merge conflict or failed' }
    }
  }

  public async fetch(workspacePath: string, remote?: string): Promise<boolean> {
    if (!workspacePath) return false
    try {
      await runGit(['fetch', remote || '--all'], workspacePath, true)
      return true
    } catch (err) {
      console.error('Failed to fetch:', err)
      return false
    }
  }

  public async pull(
    workspacePath: string,
    remote?: string,
    branch?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!workspacePath) return { success: false, message: 'No workspace' }
    try {
      const args = ['pull']
      if (remote) args.push(remote)
      if (branch) args.push(branch)
      const res = await runGit(args, workspacePath, true)
      return { success: true, message: res.trim() || 'Pull successful' }
    } catch (err: any) {
      console.error('Failed to pull:', err)
      return { success: false, message: err.message || 'Pull failed' }
    }
  }

  public async push(
    workspacePath: string,
    remote = 'origin',
    branch?: string,
    setUpstream = false
  ): Promise<{ success: boolean; message: string }> {
    if (!workspacePath) return { success: false, message: 'No workspace' }
    try {
      const currentBranch = branch || (await this.getBranch(workspacePath)) || 'main'
      const args = ['push']
      if (setUpstream) {
        args.push('-u', remote, currentBranch)
      } else {
        args.push(remote, currentBranch)
      }
      const res = await runGit(args, workspacePath, true)
      return { success: true, message: res.trim() || 'Push successful' }
    } catch (err: any) {
      console.error('Failed to push:', err)
      return { success: false, message: err.message || 'Push failed' }
    }
  }

  public async getSyncStatus(workspacePath: string): Promise<GitSyncStatus> {
    const defaultStatus: GitSyncStatus = {
      ahead: 0,
      behind: 0,
      hasRemote: false,
      upstream: null
    }
    if (!workspacePath) return defaultStatus

    try {
      const remotes = await this.getRemotes(workspacePath)
      const hasRemote = remotes.length > 0
      if (!hasRemote) {
        return defaultStatus
      }

      let upstream: string | null = null
      try {
        const out = await runGit(
          ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'],
          workspacePath
        )
        upstream = out.trim() || null
      } catch {
        upstream = null
      }

      if (!upstream) {
        return {
          ahead: 0,
          behind: 0,
          hasRemote: true,
          upstream: null
        }
      }

      let ahead = 0
      let behind = 0

      try {
        const aheadOut = await runGit(['rev-list', '--count', '@{u}..HEAD'], workspacePath)
        ahead = parseInt(aheadOut.trim(), 10) || 0
      } catch {
        ahead = 0
      }

      try {
        const behindOut = await runGit(['rev-list', '--count', 'HEAD..@{u}'], workspacePath)
        behind = parseInt(behindOut.trim(), 10) || 0
      } catch {
        behind = 0
      }

      return {
        ahead,
        behind,
        hasRemote: true,
        upstream
      }
    } catch {
      return defaultStatus
    }
  }

  public async stashSave(workspacePath: string, message?: string): Promise<boolean> {
    if (!workspacePath) return false
    try {
      const args = ['stash', 'push']
      if (message && message.trim()) {
        args.push('-m', message.trim())
      }
      await runGit(args, workspacePath, true)
      return true
    } catch (err) {
      console.error('Failed to stash:', err)
      return false
    }
  }

  public async stashPop(workspacePath: string, index = 0): Promise<boolean> {
    if (!workspacePath) return false
    try {
      await runGit(['stash', 'pop', `stash@{${index}}`], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to pop stash index ${index}:`, err)
      return false
    }
  }

  public async stashList(workspacePath: string): Promise<GitStashItem[]> {
    if (!workspacePath) return []
    try {
      const out = await runGit(['stash', 'list', '--pretty=format:%gd|%h|%s|%cr'], workspacePath)
      const lines = out.split(/\r?\n/).filter((l) => l.trim())
      const stashes: GitStashItem[] = []

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split('|')
        if (parts.length >= 4) {
          const indexMatch = parts[0].match(/stash@\{(\d+)\}/)
          const index = indexMatch ? parseInt(indexMatch[1], 10) : i
          stashes.push({
            index,
            hash: parts[1],
            message: parts[2],
            date: parts[3]
          })
        }
      }
      return stashes
    } catch {
      return []
    }
  }

  public async stashDrop(workspacePath: string, index = 0): Promise<boolean> {
    if (!workspacePath) return false
    try {
      await runGit(['stash', 'drop', `stash@{${index}}`], workspacePath, true)
      return true
    } catch (err) {
      console.error(`Failed to drop stash index ${index}:`, err)
      return false
    }
  }

  public async getCommitLog(workspacePath: string, maxCount = 50): Promise<GitCommitLogItem[]> {
    if (!workspacePath) return []
    try {
      const out = await runGit(
        ['log', `-n${maxCount}`, '--pretty=format:%H|%h|%an|%ae|%aI|%ar|%s'],
        workspacePath
      )
      const lines = out.split(/\r?\n/).filter((l) => l.trim())
      const commits: GitCommitLogItem[] = []

      for (const line of lines) {
        const parts = line.split('|')
        if (parts.length >= 7) {
          commits.push({
            hash: parts[0],
            shortHash: parts[1],
            author: parts[2],
            email: parts[3],
            date: parts[4],
            relativeTime: parts[5],
            message: parts.slice(6).join('|')
          })
        }
      }
      return commits
    } catch {
      return []
    }
  }

  public async undoLastCommit(workspacePath: string): Promise<boolean> {
    if (!workspacePath) return false
    try {
      await runGit(['reset', '--soft', 'HEAD~1'], workspacePath, true)
      return true
    } catch (err) {
      console.error('Failed to undo last commit:', err)
      return false
    }
  }
}

export const gitService = new GitService()
