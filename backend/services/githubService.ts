import { app, safeStorage } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import {
  GitHubUser,
  GitHubPublishOptions,
  GitHubPublishResult
} from '../../shared/types'
import { gitService } from './gitService'

export class GitHubService {
  private tokenFilePath: string

  constructor() {
    try {
      this.tokenFilePath = path.join(app.getPath('userData'), 'github_token.enc')
    } catch {
      this.tokenFilePath = path.join(process.cwd(), '.github_token.enc')
    }
  }

  public async getStoredToken(): Promise<string | null> {
    try {
      const buffer = await fs.readFile(this.tokenFilePath)
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(buffer)
      } else {
        return buffer.toString('utf8')
      }
    } catch {
      return null
    }
  }

  public async setStoredToken(token: string): Promise<boolean> {
    if (!token || !token.trim()) return false
    try {
      let data: Buffer
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        data = safeStorage.encryptString(token.trim())
      } else {
        data = Buffer.from(token.trim(), 'utf8')
      }
      await fs.writeFile(this.tokenFilePath, data)
      return true
    } catch (err) {
      console.error('Failed to store GitHub token:', err)
      return false
    }
  }

  public async clearStoredToken(): Promise<boolean> {
    try {
      await fs.unlink(this.tokenFilePath)
      return true
    } catch {
      return true
    }
  }

  public async validateToken(token: string): Promise<GitHubUser | null> {
    if (!token || !token.trim()) return null
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Bodhi-Editor'
        }
      })

      if (!res.ok) {
        console.error('GitHub validate token failed:', res.status, res.statusText)
        return null
      }

      const data = (await res.json()) as any
      return {
        login: data.login,
        name: data.name || data.login,
        avatarUrl: data.avatar_url,
        bio: data.bio || '',
        publicRepos: data.public_repos || 0,
        htmlUrl: data.html_url
      }
    } catch (err) {
      console.error('Failed to validate GitHub token:', err)
      return null
    }
  }

  public async getUserRepositories(
    token?: string
  ): Promise<
    Array<{
      id: number
      name: string
      fullName: string
      isPrivate: boolean
      htmlUrl: string
      cloneUrl: string
      description: string | null
    }>
  > {
    const activeToken = token || (await this.getStoredToken())
    if (!activeToken) return []

    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          Authorization: `Bearer ${activeToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Bodhi-Editor'
        }
      })

      if (!res.ok) return []
      const data = (await res.json()) as any[]
      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        isPrivate: !!repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        description: repo.description
      }))
    } catch (err) {
      console.error('Failed to fetch user repositories from GitHub:', err)
      return []
    }
  }

  public async publishRepository(
    workspacePath: string,
    options: GitHubPublishOptions,
    token?: string
  ): Promise<GitHubPublishResult> {
    const activeToken = token || (await this.getStoredToken())
    if (!activeToken) {
      return {
        success: false,
        error: 'Please connect your GitHub account or provide a GitHub Personal Access Token.'
      }
    }

    if (!workspacePath) {
      return { success: false, error: 'No active workspace open.' }
    }

    // 1. Ensure local folder is a Git repo
    const isRepo = await gitService.isGitRepo(workspacePath)
    if (!isRepo) {
      const initialized = await gitService.initRepo(workspacePath, 'main')
      if (!initialized) {
        return { success: false, error: 'Failed to initialize local Git repository.' }
      }
    }

    // 2. Call GitHub API to create repository
    const endpoint = options.org
      ? `https://api.github.com/orgs/${encodeURIComponent(options.org)}/repos`
      : 'https://api.github.com/user/repos'

    try {
      const createRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Bodhi-Editor'
        },
        body: JSON.stringify({
          name: options.repoName.trim(),
          description: options.description?.trim() || '',
          private: options.isPrivate,
          auto_init: false
        })
      })

      if (!createRes.ok) {
        const errorData = (await createRes.json().catch(() => ({}))) as any
        const msg = errorData.message || createRes.statusText
        const errors = errorData.errors ? errorData.errors.map((e: any) => e.message).join(', ') : ''
        return {
          success: false,
          error: `GitHub repository creation failed: ${msg}${errors ? ` (${errors})` : ''}`
        }
      }

      const repoData = (await createRes.json()) as any
      let cloneUrl = repoData.clone_url as string
      const htmlUrl = repoData.html_url as string

      // Embed token in clone URL for authenticated push if using HTTPS
      if (cloneUrl.startsWith('https://')) {
        const urlObj = new URL(cloneUrl)
        urlObj.username = 'x-access-token'
        urlObj.password = activeToken.trim()
        cloneUrl = urlObj.toString()
      }

      // 3. Configure local remote "origin"
      const remotes = await gitService.getRemotes(workspacePath)
      const originRemote = remotes.find((r) => r.name === 'origin')

      if (originRemote) {
        await gitService.setRemoteUrl(workspacePath, 'origin', cloneUrl)
      } else {
        await gitService.addRemote(workspacePath, 'origin', cloneUrl)
      }

      // 4. Initial commit if repo has unstaged/untracked files and no commit yet
      const status = await gitService.getStatus(workspacePath)
      const commitLog = await gitService.getCommitLog(workspacePath, 1)
      if (commitLog.length === 0) {
        // First commit
        await gitService.stageAll(workspacePath)
        await gitService.commit(workspacePath, 'Initial commit from Bodhi Editor')
      } else if (status.staged.length > 0 || status.unstaged.length > 0 || status.untracked.length > 0) {
        await gitService.stageAll(workspacePath)
        await gitService.commit(workspacePath, 'Update project changes before publishing')
      }

      // 5. Push to GitHub with --set-upstream
      const currentBranch = (await gitService.getBranch(workspacePath)) || 'main'
      const pushRes = await gitService.push(workspacePath, 'origin', currentBranch, true)

      // Replace authenticated URL with clean public URL in git config so credentials aren't saved in plain .git/config
      await gitService.setRemoteUrl(workspacePath, 'origin', repoData.clone_url)

      if (!pushRes.success) {
        return {
          success: true,
          cloneUrl: repoData.clone_url,
          htmlUrl,
          error: `Repository was created on GitHub (${htmlUrl}), but initial push failed: ${pushRes.message}. You can push manually using Source Control.`
        }
      }

      return {
        success: true,
        cloneUrl: repoData.clone_url,
        htmlUrl
      }
    } catch (err: any) {
      console.error('Failed in publishRepository:', err)
      return { success: false, error: err.message || 'Unknown network error occurred.' }
    }
  }
}

export const githubService = new GitHubService()
