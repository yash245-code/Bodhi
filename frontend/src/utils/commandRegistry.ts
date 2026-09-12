import { FileNode } from '@shared/types'

export interface FlatFileItem {
  id: string
  name: string
  path: string
  relativePath: string
  extension: string
}

export interface EditorCommand {
  id: string
  title: string
  category: string
  shortcut?: string
  action: () => void | Promise<void>
}

export interface MatchResult {
  score: number
  matchedIndices: number[]
}

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'out',
  'dist',
  '.next',
  '.cache',
  'build',
  '.vscode',
  '.idea'
])

/**
 * Recursively flattens a FileNode tree into a searchable list of file items.
 */
export function flattenFileTree(
  node: FileNode | null,
  rootPath: string | null
): FlatFileItem[] {
  if (!node) return []

  const results: FlatFileItem[] = []

  function traverse(currentNode: FileNode): void {
    if (currentNode.type === 'directory') {
      if (IGNORED_DIRECTORIES.has(currentNode.name)) {
        return
      }
      if (currentNode.children) {
        for (const child of currentNode.children) {
          traverse(child)
        }
      }
    } else {
      let relativePath = currentNode.path
      if (rootPath && currentNode.path.startsWith(rootPath)) {
        relativePath = currentNode.path.slice(rootPath.length).replace(/^[/\\]/, '')
      }
      const extension = currentNode.name.split('.').pop() || ''

      results.push({
        id: currentNode.path,
        name: currentNode.name,
        path: currentNode.path,
        relativePath,
        extension
      })
    }
  }

  traverse(node)
  return results
}

/**
 * Fuzzy matches query against text and returns score and highlight indices.
 */
export function fuzzyMatch(text: string, query: string): MatchResult | null {
  if (!query) {
    return { score: 1, matchedIndices: [] }
  }

  const cleanQuery = query.toLowerCase().trim()
  const cleanText = text.toLowerCase()

  // Exact substring match gives high priority
  const substringIndex = cleanText.indexOf(cleanQuery)
  if (substringIndex !== -1) {
    const matchedIndices: number[] = []
    for (let i = 0; i < cleanQuery.length; i++) {
      matchedIndices.push(substringIndex + i)
    }
    // Boost if match is at the start
    const score = 1000 + (substringIndex === 0 ? 500 : 0) + cleanQuery.length * 10
    return { score, matchedIndices }
  }

  // Fuzzy sequential character matching
  let queryIdx = 0
  let score = 0
  const matchedIndices: number[] = []
  let consecutiveMatches = 0

  for (let i = 0; i < text.length && queryIdx < cleanQuery.length; i++) {
    const char = cleanText[i]
    const targetChar = cleanQuery[queryIdx]

    if (char === targetChar) {
      matchedIndices.push(i)
      queryIdx++

      // Bonus for consecutive matches
      consecutiveMatches++
      score += 10 + consecutiveMatches * 5

      // Bonus for matching start of words or camelCase
      if (
        i === 0 ||
        text[i - 1] === '/' ||
        text[i - 1] === '\\' ||
        text[i - 1] === '.' ||
        text[i - 1] === '-' ||
        text[i - 1] === '_' ||
        (text[i] >= 'A' && text[i] <= 'Z')
      ) {
        score += 25
      }
    } else {
      consecutiveMatches = 0
    }
  }

  if (queryIdx === cleanQuery.length) {
    return { score, matchedIndices }
  }

  return null
}
