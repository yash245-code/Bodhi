import * as fs from 'fs/promises'
import * as path from 'path'
import {
  SearchOptions,
  SearchResultGroup,
  SearchMatch,
  ReplaceResult
} from '../../shared/types'

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  '.next',
  '.turbo',
  '.vscode',
  '.idea',
  'coverage',
  '.DS_Store'
])

const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'ico',
  'webp',
  'svgz',
  'mp4',
  'mp3',
  'wav',
  'ogg',
  'zip',
  'tar',
  'gz',
  '7z',
  'rar',
  'exe',
  'dll',
  'so',
  'dylib',
  'bin',
  'pdf',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'node'
])

export class SearchService {
  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).slice(1).toLowerCase()
    return BINARY_EXTENSIONS.has(ext)
  }

  private matchesGlob(filePath: string, pattern: string): boolean {
    if (!pattern.trim()) return true
    const normalized = filePath.replace(/\\/g, '/')
    const patterns = pattern.split(',').map((p) => p.trim())

    for (const p of patterns) {
      if (!p) continue
      const isNegated = p.startsWith('!')
      const rawPattern = isNegated ? p.slice(1).trim() : p

      // Simple glob converter: *.ts -> \.ts$, * -> .*
      const regexPattern = rawPattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/(?<!\.)\*/g, '[^/]*')

      const regex = new RegExp(regexPattern, 'i')
      const matched = regex.test(normalized)

      if (isNegated && matched) return false
      if (!isNegated && !matched) return false
    }

    return true
  }

  private createSearchRegex(query: string, options?: SearchOptions): RegExp | null {
    if (!query) return null

    let pattern = query
    if (!options?.isRegex) {
      // Escape regex special chars
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    if (options?.matchWholeWord) {
      pattern = `\\b${pattern}\\b`
    }

    const flags = options?.matchCase ? 'g' : 'gi'

    try {
      return new RegExp(pattern, flags)
    } catch {
      return null
    }
  }

  private async scanFiles(dirPath: string, filesList: string[] = []): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue

        const fullPath = path.join(dirPath, entry.name)
        if (entry.isDirectory()) {
          await this.scanFiles(fullPath, filesList)
        } else if (entry.isFile()) {
          if (!this.isBinaryFile(fullPath)) {
            filesList.push(fullPath)
          }
        }
      }
    } catch {
      // Ignore unreadable dirs
    }
    return filesList
  }

  public async searchWorkspace(
    workspacePath: string,
    query: string,
    options?: SearchOptions
  ): Promise<SearchResultGroup[]> {
    if (!query || !workspacePath) return []

    const regex = this.createSearchRegex(query, options)
    if (!regex) return []

    const allFiles = await this.scanFiles(workspacePath)
    const results: SearchResultGroup[] = []
    const maxResults = options?.maxResults || 2000
    let totalMatchesFound = 0

    for (const filePath of allFiles) {
      if (totalMatchesFound >= maxResults) break

      const relPath = path.relative(workspacePath, filePath).replace(/\\/g, '/')
      if (options?.includePattern && !this.matchesGlob(relPath, options.includePattern)) {
        continue
      }
      if (options?.excludePattern && this.matchesGlob(relPath, options.excludePattern)) {
        continue
      }

      try {
        const content = await fs.readFile(filePath, 'utf-8')
        // Skip files that contain null bytes
        if (content.includes('\0')) continue

        const lines = content.split(/\r?\n/)
        const fileMatches: SearchMatch[] = []

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          const lineContent = lines[lineIdx]
          regex.lastIndex = 0

          let match: RegExpExecArray | null
          while ((match = regex.exec(lineContent)) !== null) {
            fileMatches.push({
              filePath,
              relativePath: relPath,
              fileName: path.basename(filePath),
              line: lineIdx + 1,
              column: match.index + 1,
              lineContent,
              matchLength: match[0].length
            })

            totalMatchesFound++
            if (totalMatchesFound >= maxResults) break

            // Avoid infinite loop on zero-length matches
            if (match.index === regex.lastIndex) {
              regex.lastIndex++
            }
          }

          if (totalMatchesFound >= maxResults) break
        }

        if (fileMatches.length > 0) {
          results.push({
            filePath,
            relativePath: relPath,
            fileName: path.basename(filePath),
            matches: fileMatches
          })
        }
      } catch {
        // Skip unreadable files
      }
    }

    return results
  }

  public async replaceInFile(
    filePath: string,
    query: string,
    replaceText: string,
    options?: SearchOptions
  ): Promise<number> {
    const regex = this.createSearchRegex(query, options)
    if (!regex) return 0

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      let count = 0
      const newContent = content.replace(regex, () => {
        count++
        return replaceText
      })

      if (count > 0) {
        await fs.writeFile(filePath, newContent, 'utf-8')
      }
      return count
    } catch {
      return 0
    }
  }

  public async replaceAll(
    workspacePath: string,
    query: string,
    replaceText: string,
    options?: SearchOptions
  ): Promise<ReplaceResult> {
    const searchGroups = await this.searchWorkspace(workspacePath, query, options)
    let totalReplacements = 0
    let filesModified = 0

    for (const group of searchGroups) {
      const count = await this.replaceInFile(group.filePath, query, replaceText, options)
      if (count > 0) {
        totalReplacements += count
        filesModified++
      }
    }

    return { totalReplacements, filesModified }
  }
}
