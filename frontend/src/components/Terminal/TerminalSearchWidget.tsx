import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  WholeWord,
  Regex
} from 'lucide-react'

interface TerminalSearchWidgetProps {
  onFindNext: (query: string, options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }) => void
  onFindPrev: (query: string, options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }) => void
  onClose: () => void
  activeMatch?: number
  totalMatches?: number
}

export const TerminalSearchWidget: React.FC<TerminalSearchWidgetProps> = ({
  onFindNext,
  onFindPrev,
  onClose,
  activeMatch = 0,
  totalMatches = 0
}) => {
  const [query, setQuery] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [isRegex, setIsRegex] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Auto trigger search on query or option changes
  useEffect(() => {
    if (query.trim()) {
      onFindNext(query, { matchCase, wholeWord, isRegex })
    }
  }, [query, matchCase, wholeWord, isRegex, onFindNext])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      if (e.shiftKey) {
        onFindPrev(query, { matchCase, wholeWord, isRegex })
      } else {
        onFindNext(query, { matchCase, wholeWord, isRegex })
      }
    }
  }

  return (
    <div className="absolute top-2 right-4 z-40 flex items-center gap-1.5 px-2 py-1.5 bg-bodhi-panel/95 border border-BODHI-border rounded-lg shadow-2xl backdrop-blur-md animate-fade-in text-xs">
      <div className="flex items-center gap-1 bg-bodhi-bg px-2 py-1 rounded border border-BODHI-border focus-within:border-bodhi-accent/70 transition-colors">
        <Search size={12} className="text-bodhi-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find in terminal..."
          className="bg-transparent text-xs text-BODHI-text placeholder-bodhi-muted outline-none w-36 sm:w-48 font-mono"
        />

        {query && (
          <span className="text-[10px] text-bodhi-muted px-1 border-l border-BODHI-border/50 shrink-0 font-mono">
            {totalMatches > 0 ? `${activeMatch} of ${totalMatches}` : 'No matches'}
          </span>
        )}
      </div>

      {/* Option Toggles */}
      <div className="flex items-center gap-0.5 border-l border-BODHI-border pl-1">
        <button
          type="button"
          onClick={() => setMatchCase((prev) => !prev)}
          title="Match Case (Alt+C)"
          className={`p-1 rounded transition-colors ${
            matchCase
              ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
              : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
          }`}
        >
          <CaseSensitive size={13} />
        </button>

        <button
          type="button"
          onClick={() => setWholeWord((prev) => !prev)}
          title="Match Whole Word (Alt+W)"
          className={`p-1 rounded transition-colors ${
            wholeWord
              ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
              : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
          }`}
        >
          <WholeWord size={13} />
        </button>

        <button
          type="button"
          onClick={() => setIsRegex((prev) => !prev)}
          title="Use Regular Expression (Alt+R)"
          className={`p-1 rounded transition-colors ${
            isRegex
              ? 'bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40'
              : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
          }`}
        >
          <Regex size={13} />
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-0.5 border-l border-BODHI-border pl-1">
        <button
          type="button"
          onClick={() => onFindPrev(query, { matchCase, wholeWord, isRegex })}
          title="Previous Match (Shift+Enter)"
          disabled={!query}
          className="p-1 text-bodhi-muted hover:text-white hover:bg-bodhi-surface disabled:opacity-30 rounded transition-colors"
        >
          <ChevronUp size={13} />
        </button>
        <button
          type="button"
          onClick={() => onFindNext(query, { matchCase, wholeWord, isRegex })}
          title="Next Match (Enter)"
          disabled={!query}
          className="p-1 text-bodhi-muted hover:text-white hover:bg-bodhi-surface disabled:opacity-30 rounded transition-colors"
        >
          <ChevronDown size={13} />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Close Search (Escape)"
          className="p-1 text-bodhi-muted hover:text-red-400 hover:bg-bodhi-surface rounded transition-colors ml-0.5"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
