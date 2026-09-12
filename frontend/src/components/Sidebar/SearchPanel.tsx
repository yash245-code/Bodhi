import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  Replace,
  ChevronRight,
  ChevronDown,
  FileCode,
  CaseSensitive,
  WholeWord,
  Regex,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useEditorStore } from '../../store/useEditorStore'
import { SearchResultGroup, SearchOptions } from '@shared/types'

export const SearchPanel: React.FC = () => {
  const { rootPath, openFolder } = useWorkspaceStore()
  const { openFileAtLocation } = useEditorStore()

  const [query, setQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [isReplaceOpen, setIsReplaceOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [includePattern, setIncludePattern] = useState('')
  const [excludePattern, setExcludePattern] = useState('')

  // Search Modifiers
  const [matchCase, setMatchCase] = useState(false)
  const [matchWholeWord, setMatchWholeWord] = useState(false)
  const [isRegex, setIsRegex] = useState(false)

  // Results state
  const [results, setResults] = useState<SearchResultGroup[]>([])
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0)

  const handleSearch = useCallback(async (): Promise<void> => {
    if (!rootPath || !query.trim()) {
      setResults([])
      setStatusMessage(null)
      return
    }

    setIsSearching(true)
    setStatusMessage('Searching...')

    try {
      const options: SearchOptions = {
        matchCase,
        matchWholeWord,
        isRegex,
        includePattern: includePattern.trim() || undefined,
        excludePattern: excludePattern.trim() || undefined,
        maxResults: 2000
      }

      const searchResults = await window.bodhiAPI.searchWorkspace(
        rootPath,
        query,
        options
      )

      setResults(searchResults)
      setCollapsedFiles(new Set()) // Expand all by default

      const matchesCount = searchResults.reduce((acc, r) => acc + r.matches.length, 0)
      setStatusMessage(
        matchesCount === 0
          ? 'No results found.'
          : `${matchesCount} result${matchesCount > 1 ? 's' : ''} in ${searchResults.length} file${
              searchResults.length > 1 ? 's' : ''
            }`
      )
    } catch (err) {
      console.error('Search failed:', err)
      setStatusMessage('Search error occurred.')
    } finally {
      setIsSearching(false)
    }
  }, [rootPath, query, matchCase, matchWholeWord, isRegex, includePattern, excludePattern])

  // Debounced search on query/modifier changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch()
      } else {
        setResults([])
        setStatusMessage(null)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, matchCase, matchWholeWord, isRegex, includePattern, excludePattern, handleSearch])

  // Replace All handler
  const handleReplaceAll = async (): Promise<void> => {
    if (!rootPath || !query.trim()) return

    const confirmed = window.confirm(
      `Replace ${totalMatches} occurrences of "${query}" with "${replaceText}" across workspace?`
    )
    if (!confirmed) return

    setIsSearching(true)
    try {
      const res = await window.bodhiAPI.replaceAll(rootPath, query, replaceText, {
        matchCase,
        matchWholeWord,
        isRegex,
        includePattern: includePattern.trim() || undefined,
        excludePattern: excludePattern.trim() || undefined
      })

      setStatusMessage(`Replaced ${res.totalReplacements} matches in ${res.filesModified} files.`)
      // Refresh search results
      await handleSearch()
    } catch (err) {
      console.error('Replace all failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleFileCollapse = (filePath: string): void => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(filePath)) {
        next.delete(filePath)
      } else {
        next.add(filePath)
      }
      return next
    })
  }

  if (!rootPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none text-bodhi-muted">
        <div className="w-12 h-12 rounded-xl bg-bodhi-panel border border-BODHI-border flex items-center justify-center text-bodhi-accent mb-3 shadow-inner">
          <Search size={22} />
        </div>
        <h3 className="font-semibold text-white text-xs mb-1">No Folder Opened</h3>
        <p className="text-[11px] text-bodhi-muted mb-4 max-w-[200px]">
          Open a folder to search across workspace files.
        </p>
        <button
          onClick={() => openFolder()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bodhi-accent/20 border border-bodhi-accent/40 text-bodhi-accent hover:bg-bodhi-accent hover:text-black font-semibold text-xs rounded-lg transition-all"
        >
          <FolderOpen size={13} />
          <span>Open Folder</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-BODHI-sidebar text-xs">
      {/* Header Title */}
      <div className="px-3 py-2 border-b border-BODHI-border/70 flex items-center justify-between">
        <span className="font-semibold tracking-wider text-[11px] text-bodhi-muted uppercase">
          Search
        </span>

        {results.length > 0 && (
          <button
            onClick={handleSearch}
            title="Refresh Search"
            className="p-1 text-bodhi-muted hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <RefreshCw size={12} className={isSearching ? 'animate-spin text-bodhi-accent' : ''} />
          </button>
        )}
      </div>

      {/* Search Input Controls */}
      <div className="p-3 space-y-2 border-b border-BODHI-border">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search (e.g. functionName, regex)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bodhi-panel border border-BODHI-border focus:border-bodhi-accent/50 focus:outline-none rounded-md px-2.5 py-1.5 text-xs text-BODHI-text placeholder:text-bodhi-muted/60 pr-20"
          />

          {/* Modifier Toggles */}
          <div className="absolute right-1.5 flex items-center gap-0.5 text-bodhi-muted">
            <button
              onClick={() => setMatchCase((p) => !p)}
              title="Match Case (Alt+C)"
              className={`p-0.5 rounded transition-colors ${
                matchCase
                  ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
                  : 'hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <CaseSensitive size={13} />
            </button>
            <button
              onClick={() => setMatchWholeWord((p) => !p)}
              title="Match Whole Word (Alt+W)"
              className={`p-0.5 rounded transition-colors ${
                matchWholeWord
                  ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
                  : 'hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <WholeWord size={13} />
            </button>
            <button
              onClick={() => setIsRegex((p) => !p)}
              title="Use Regular Expression (Alt+R)"
              className={`p-0.5 rounded transition-colors ${
                isRegex
                  ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
                  : 'hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Regex size={13} />
            </button>
          </div>
        </div>

        {/* Replace Bar Toggle */}
        <div className="flex items-center gap-1 text-[11px] text-bodhi-muted">
          <button
            onClick={() => setIsReplaceOpen((p) => !p)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {isReplaceOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Replace</span>
          </button>
        </div>

        {/* Replace Input & Replace All Action */}
        {isReplaceOpen && (
          <div className="flex items-center gap-1.5 pt-1 animate-fade-in">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="flex-1 bg-bodhi-panel border border-BODHI-border focus:border-bodhi-accent/50 focus:outline-none rounded-md px-2.5 py-1 text-xs text-BODHI-text placeholder:text-bodhi-muted/60"
            />
            <button
              onClick={handleReplaceAll}
              disabled={results.length === 0}
              title="Replace All across workspace"
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                results.length > 0
                  ? 'bg-bodhi-accent text-black hover:bg-bodhi-accentHover active:scale-95 shadow-sm'
                  : 'bg-bodhi-surface text-bodhi-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <Replace size={12} />
              <span>All</span>
            </button>
          </div>
        )}

        {/* File Filter Toggle */}
        <div className="flex items-center justify-between text-[11px] text-bodhi-muted pt-1">
          <button
            onClick={() => setIsFiltersOpen((p) => !p)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <SlidersHorizontal size={11} />
            <span>Files to include/exclude</span>
          </button>
        </div>

        {/* Filter Inputs */}
        {isFiltersOpen && (
          <div className="space-y-1.5 pt-1 text-[11px] text-bodhi-muted animate-fade-in">
            <div>
              <span className="block mb-0.5 text-[10px]">Files to include (e.g. *.ts, src/**):</span>
              <input
                type="text"
                placeholder="e.g. *.tsx, src/*"
                value={includePattern}
                onChange={(e) => setIncludePattern(e.target.value)}
                className="w-full bg-bodhi-panel border border-BODHI-border rounded px-2 py-0.5 text-xs text-BODHI-text placeholder:text-bodhi-muted/50"
              />
            </div>
            <div>
              <span className="block mb-0.5 text-[10px]">Files to exclude:</span>
              <input
                type="text"
                placeholder="e.g. *.test.ts, *.json"
                value={excludePattern}
                onChange={(e) => setExcludePattern(e.target.value)}
                className="w-full bg-bodhi-panel border border-BODHI-border rounded px-2 py-0.5 text-xs text-BODHI-text placeholder:text-bodhi-muted/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header / Status */}
      {statusMessage && (
        <div className="px-3 py-1.5 bg-bodhi-panel/50 border-b border-BODHI-border text-[11px] text-bodhi-muted font-medium flex items-center justify-between">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Results Tree List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-1">
        {results.map((group) => {
          const isCollapsed = collapsedFiles.has(group.filePath)
          return (
            <div key={group.filePath} className="rounded overflow-hidden">
              {/* File Group Header */}
              <div
                onClick={() => toggleFileCollapse(group.filePath)}
                className="flex items-center justify-between px-2 py-1 hover:bg-bodhi-surface rounded cursor-pointer group text-BODHI-text transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCollapsed ? <ChevronRight size={13} className="text-bodhi-muted shrink-0" /> : <ChevronDown size={13} className="text-bodhi-muted shrink-0" />}
                  <FileCode size={13} className="text-bodhi-accent shrink-0" />
                  <span className="font-medium truncate text-white">{group.fileName}</span>
                  <span className="text-[10px] text-bodhi-muted truncate">{group.relativePath}</span>
                </div>

                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-bodhi-accent/15 text-bodhi-accent font-mono border border-bodhi-accent/30 shrink-0 ml-1">
                  {group.matches.length}
                </span>
              </div>

              {/* Matching Lines in File */}
              {!isCollapsed && (
                <div className="pl-5 pr-1 py-0.5 space-y-0.5">
                  {group.matches.map((match, idx) => (
                    <div
                      key={`${match.filePath}-${match.line}-${match.column}-${idx}`}
                      onClick={() => openFileAtLocation(match.filePath, match.line, match.column)}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-bodhi-panel cursor-pointer text-[11px] group transition-colors"
                      title={`${group.relativePath}:${match.line}:${match.column}`}
                    >
                      <span className="font-mono text-[10px] text-bodhi-muted w-6 text-right shrink-0">
                        {match.line}
                      </span>
                      <span className="truncate font-mono text-bodhi-muted group-hover:text-BODHI-text">
                        {match.lineContent.trim()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

