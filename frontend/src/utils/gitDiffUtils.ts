export type LineChangeType = 'added' | 'modified' | 'deleted'

export interface LineChange {
  startLineNumber: number
  endLineNumber: number
  type: LineChangeType
}

/**
 * Computes line-level diffs between original (HEAD) and modified (current buffer) text.
 * Returns an array of LineChange objects suitable for Monaco gutter decorations.
 */
export function computeLineDiff(
  originalText: string,
  modifiedText: string
): LineChange[] {
  if (originalText === modifiedText) {
    return []
  }

  const origLines = originalText.split(/\r?\n/)
  const modLines = modifiedText.split(/\r?\n/)

  if (originalText === '' || origLines.length === 0) {
    return [
      {
        startLineNumber: 1,
        endLineNumber: Math.max(1, modLines.length),
        type: 'added'
      }
    ]
  }

  if (modifiedText === '' || modLines.length === 0) {
    return [
      {
        startLineNumber: 1,
        endLineNumber: 1,
        type: 'deleted'
      }
    ]
  }

  const M = origLines.length
  const N = modLines.length

  // Build LCS table (capped at reasonable size for performance)
  if (M * N > 2_500_000) {
    // For very large files, fallback to simple prefix/suffix match
    return computeSimpleDiff(origLines, modLines)
  }

  // Standard LCS computation
  const dp: Int32Array[] = Array.from({ length: M + 1 }, () => new Int32Array(N + 1))

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff operations
  interface DiffOp {
    type: 'same' | 'added' | 'deleted'
    origIndex?: number
    modIndex?: number
  }

  const ops: DiffOp[] = []
  let i = M
  let j = N

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      ops.push({ type: 'same', origIndex: i - 1, modIndex: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'added', modIndex: j - 1 })
      j--
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      ops.push({ type: 'deleted', origIndex: i - 1 })
      i--
    }
  }

  ops.reverse()

  // Convert operations to LineChange ranges for Monaco
  const changes: LineChange[] = []
  let k = 0

  while (k < ops.length) {
    const op = ops[k]
    if (op.type === 'same') {
      k++
      continue
    }

    // Collect contiguous block of changes
    let deletedCount = 0
    let addedStartModIndex = -1
    let addedEndModIndex = -1

    while (k < ops.length && ops[k].type !== 'same') {
      const cur = ops[k]
      if (cur.type === 'deleted') {
        deletedCount++
      } else if (cur.type === 'added') {
        if (addedStartModIndex === -1 && cur.modIndex !== undefined) {
          addedStartModIndex = cur.modIndex
        }
        if (cur.modIndex !== undefined) {
          addedEndModIndex = cur.modIndex
        }
      }
      k++
    }

    if (deletedCount > 0 && addedStartModIndex !== -1) {
      // Modified chunk (both deletions and additions)
      changes.push({
        startLineNumber: addedStartModIndex + 1,
        endLineNumber: addedEndModIndex + 1,
        type: 'modified'
      })
    } else if (addedStartModIndex !== -1) {
      // Pure addition
      changes.push({
        startLineNumber: addedStartModIndex + 1,
        endLineNumber: addedEndModIndex + 1,
        type: 'added'
      })
    } else if (deletedCount > 0) {
      // Pure deletion (mark nearest line)
      let lineNum = 1
      if (k < ops.length && ops[k].modIndex !== undefined) {
        lineNum = ops[k].modIndex! + 1
      } else if (changes.length > 0) {
        lineNum = changes[changes.length - 1].endLineNumber
      }
      changes.push({
        startLineNumber: Math.max(1, lineNum),
        endLineNumber: Math.max(1, lineNum),
        type: 'deleted'
      })
    }
  }

  return changes
}

function computeSimpleDiff(origLines: string[], modLines: string[]): LineChange[] {
  let start = 0
  while (
    start < origLines.length &&
    start < modLines.length &&
    origLines[start] === modLines[start]
  ) {
    start++
  }

  let origEnd = origLines.length - 1
  let modEnd = modLines.length - 1

  while (
    origEnd >= start &&
    modEnd >= start &&
    origLines[origEnd] === modLines[modEnd]
  ) {
    origEnd--
    modEnd--
  }

  if (start <= modEnd) {
    return [
      {
        startLineNumber: start + 1,
        endLineNumber: modEnd + 1,
        type: start <= origEnd ? 'modified' : 'added'
      }
    ]
  }

  return []
}
