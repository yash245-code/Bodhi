import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Terminal as TerminalIcon,
  Trash2,
  RotateCcw,
  X,
  ChevronDown,
  Plus,
  SquareCode,
  SplitSquareHorizontal,
  Search,
  Play,
  Zap
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { TerminalInstance, TerminalInstanceHandle } from './TerminalInstance'
import { TerminalSearchWidget } from './TerminalSearchWidget'
import { ShellType, ShellProfile } from '@shared/types'

export const TerminalPanel: React.FC = () => {
  const {
    isTerminalOpen,
    terminalHeight,
    setTerminalHeight,
    toggleTerminal,
    terminalSessions,
    activeTerminalId,
    setActiveTerminalId,
    addTerminalSession,
    removeTerminalSession,
    splitTerminalSession,
    closeSplitSession,
    setTerminalSplitRatio,
    isTerminalSearchOpen,
    setTerminalSearchOpen,
    toggleTerminalSearch
  } = useEditorStore()

  const { rootPath } = useWorkspaceStore()
  const isResizingRef = useRef(false)
  const [isShellMenuOpen, setIsShellMenuOpen] = useState(false)
  const [isTasksMenuOpen, setIsTasksMenuOpen] = useState(false)
  const [availableShells, setAvailableShells] = useState<ShellProfile[]>([])
  const [packageScripts, setPackageScripts] = useState<Array<{ name: string; script: string }>>([])
  const [searchMatches, setSearchMatches] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0
  })

  const shellMenuRef = useRef<HTMLDivElement>(null)
  const tasksMenuRef = useRef<HTMLDivElement>(null)
  const terminalRefs = useRef<Map<string, TerminalInstanceHandle>>(new Map())
  const isHorizontalResizingRef = useRef<{ sessionId: string; startX: number; startRatio: number } | null>(null)

  // 1. Fetch available system shells on mount
  useEffect(() => {
    if (window.bodhiAPI?.terminalGetAvailableShells) {
      window.bodhiAPI.terminalGetAvailableShells().then((shells) => {
        if (shells && shells.length > 0) {
          setAvailableShells(shells)
        }
      })
    }
  }, [])

  // 2. Discover package.json scripts from open workspace
  useEffect(() => {
    if (!rootPath || !window.bodhiAPI?.readFile) {
      setPackageScripts([])
      return
    }

    const pkgPath = rootPath.includes('\\')
      ? `${rootPath}\\package.json`
      : `${rootPath}/package.json`

    window.bodhiAPI
      .readFile(pkgPath)
      .then((content) => {
        if (content) {
          try {
            const parsed = JSON.parse(content)
            if (parsed.scripts && typeof parsed.scripts === 'object') {
              const scripts = Object.entries(parsed.scripts).map(([name, script]) => ({
                name,
                script: String(script)
              }))
              setPackageScripts(scripts)
            }
          } catch {
            setPackageScripts([])
          }
        }
      })
      .catch(() => {
        setPackageScripts([])
      })
  }, [rootPath])

  // Vertical resizing handle for terminal panel height
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isResizingRef.current = true

      const startY = e.clientY
      const startHeight = terminalHeight

      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizingRef.current) return
        const delta = startY - moveEvent.clientY
        const newHeight = startHeight + delta
        setTerminalHeight(newHeight)
      }

      const handleMouseUp = (): void => {
        isResizingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [terminalHeight, setTerminalHeight]
  )

  // Horizontal splitter resizing between side-by-side terminal panes
  const handleHorizontalSplitterMouseDown = (
    e: React.MouseEvent,
    sessionId: string,
    currentRatio: number,
    containerWidth: number
  ): void => {
    e.preventDefault()
    e.stopPropagation()

    isHorizontalResizingRef.current = {
      sessionId,
      startX: e.clientX,
      startRatio: currentRatio
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      if (!isHorizontalResizingRef.current) return
      const deltaX = moveEvent.clientX - isHorizontalResizingRef.current.startX
      const deltaRatio = deltaX / Math.max(containerWidth, 200)
      const nextRatio = Math.max(
        0.2,
        Math.min(0.8, isHorizontalResizingRef.current.startRatio + deltaRatio)
      )
      setTerminalSplitRatio(sessionId, nextRatio)
    }

    const handleMouseUp = (): void => {
      isHorizontalResizingRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (shellMenuRef.current && !shellMenuRef.current.contains(e.target as Node)) {
        setIsShellMenuOpen(false)
      }
      if (tasksMenuRef.current && !tasksMenuRef.current.contains(e.target as Node)) {
        setIsTasksMenuOpen(false)
      }
    }
    if (isShellMenuOpen || isTasksMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isShellMenuOpen, isTasksMenuOpen])

  const handleClear = (): void => {
    if (window.bodhiAPI?.writeTerminal && activeTerminalId) {
      window.bodhiAPI.writeTerminal(activeTerminalId, 'cls\r')
    }
  }

  const handleRestart = (): void => {
    if (window.bodhiAPI?.writeTerminal && activeTerminalId) {
      window.bodhiAPI.writeTerminal(activeTerminalId, '\x03clear\r')
    }
  }

  const handleCreateShell = (shell: ShellType): void => {
    setIsShellMenuOpen(false)
    addTerminalSession(shell)
  }

  // 1-Click execute package.json script in a new dedicated terminal session
  const handleRunScript = (scriptName: string): void => {
    setIsTasksMenuOpen(false)
    const newSessionId = addTerminalSession('powershell')

    // Delay slightly to allow backend PTY spawn before piping npm run command
    setTimeout(() => {
      if (window.bodhiAPI?.writeTerminal) {
        window.bodhiAPI.writeTerminal(newSessionId, `npm run ${scriptName}\r`)
      }
    }, 400)
  }

  const handleSplitActiveTerminal = (): void => {
    if (activeTerminalId) {
      splitTerminalSession(activeTerminalId)
    }
  }

  // Terminal in-buffer search handlers
  const handleSearchFindNext = (
    query: string,
    options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }
  ): void => {
    const activeRef = terminalRefs.current.get(activeTerminalId)
    if (activeRef) {
      const result = activeRef.findNext(query, options)
      setSearchMatches(result)
    }
  }

  const handleSearchFindPrev = (
    query: string,
    options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }
  ): void => {
    const activeRef = terminalRefs.current.get(activeTerminalId)
    if (activeRef) {
      const result = activeRef.findPrev(query, options)
      setSearchMatches(result)
    }
  }

  const handleCloseSearch = (): void => {
    setTerminalSearchOpen(false)
    const activeRef = terminalRefs.current.get(activeTerminalId)
    if (activeRef) {
      activeRef.clearSearch()
      activeRef.focus()
    }
  }

  if (terminalSessions.length === 0) return null

  // Separate root sessions from child split sessions
  const childSplitIds = new Set(
    terminalSessions.map((s) => s.splitSessionId).filter(Boolean)
  )
  const rootSessions = terminalSessions.filter((s) => !childSplitIds.has(s.id))

  const fallbackShells: Array<{ label: string; shell: ShellType; desc: string }> = [
    { label: 'PowerShell', shell: 'powershell', desc: 'Windows PowerShell 5/7' },
    { label: 'Command Prompt', shell: 'cmd', desc: 'Default Windows Command Prompt' },
    { label: 'Git Bash', shell: 'bash', desc: 'Bash for Windows' },
    { label: 'WSL (Linux)', shell: 'wsl', desc: 'Windows Subsystem for Linux' }
  ]

  return (
    <div
      style={{ height: `${terminalHeight}px` }}
      className={`w-full flex-col bg-bodhi-bg border-t border-BODHI-border relative shrink-0 ${
        isTerminalOpen ? 'flex' : 'hidden'
      }`}
    >
      {/* Top resize handle with generous hit area and visible accent line */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag to resize terminal"
        className="group h-3 w-full absolute -top-1.5 left-0 right-0 cursor-row-resize z-50 flex items-center justify-center"
      >
        <div className="h-[2px] w-full bg-transparent group-hover:bg-bodhi-accent/80 group-active:bg-bodhi-accent transition-colors" />
      </div>

      {/* Terminal Header & Multi-Session Tab Bar */}
      <div className="h-8 px-2 flex items-center justify-between border-b border-BODHI-border select-none shrink-0 bg-bodhi-panel gap-2 relative z-30">
        {/* Left: Terminal Sessions Tab Bar */}
        <div className="flex items-center gap-1 flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-BODHI-text border-r border-BODHI-border/70 pr-2.5 shrink-0">
            <TerminalIcon size={13} className="text-bodhi-accent" />
            <span className="hidden sm:inline">TERMINAL</span>
          </div>

          {/* Session Tabs (Scrollable) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0">
            {rootSessions.map((session) => {
              const isActive =
                session.id === activeTerminalId ||
                session.splitSessionId === activeTerminalId
              return (
                <div
                  key={session.id}
                  onClick={() => setActiveTerminalId(session.id)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all border shrink-0 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent/40 font-medium shadow-sm'
                      : 'bg-transparent text-bodhi-muted hover:text-BODHI-text hover:bg-bodhi-surface/50 border-transparent'
                  }`}
                >
                  {session.splitSessionId ? (
                    <SplitSquareHorizontal size={11} className={isActive ? 'text-bodhi-accent' : 'text-bodhi-muted'} />
                  ) : (
                    <SquareCode size={11} className={isActive ? 'text-bodhi-accent' : 'text-bodhi-muted'} />
                  )}
                  <span className="truncate max-w-[110px]">{session.name}</span>

                  {/* Close Session Button */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTerminalSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                    title="Close Terminal Session"
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add Terminal & Shell Dropdown */}
          <div className="flex items-center gap-0.5 shrink-0 relative" ref={shellMenuRef}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => addTerminalSession('powershell')}
              title="New Terminal (PowerShell)"
              className="p-1 text-bodhi-muted hover:text-white hover:bg-bodhi-surface rounded transition-colors"
            >
              <Plus size={13} />
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsShellMenuOpen((prev) => !prev)}
              title="Select Shell Type"
              className={`p-1 rounded transition-colors ${
                isShellMenuOpen
                  ? 'text-bodhi-accent bg-bodhi-accent/15'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <ChevronDown size={11} />
            </button>

            {/* Shell Switcher Dropdown */}
            {isShellMenuOpen && (
              <div
                className={`absolute left-0 w-64 bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in backdrop-blur-lg ${
                  terminalHeight < 240 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                }`}
              >
                <div className="px-3 py-1 text-[10px] font-semibold text-bodhi-muted uppercase tracking-wider border-b border-BODHI-border/50 mb-1">
                  Spawn Shell Session
                </div>
                {availableShells.length > 0
                  ? availableShells.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCreateShell(opt.shell)
                        }}
                        className="w-full flex flex-col text-left px-3 py-1.5 text-xs text-BODHI-text hover:bg-bodhi-surface hover:text-white transition-colors"
                      >
                        <span className="font-medium text-white flex items-center justify-between">
                          {opt.name}
                        </span>
                        <span className="text-[10px] text-bodhi-muted truncate">{opt.description}</span>
                      </button>
                    ))
                  : fallbackShells.map((opt) => (
                      <button
                        type="button"
                        key={opt.shell}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCreateShell(opt.shell)
                        }}
                        className="w-full flex flex-col text-left px-3 py-1.5 text-xs text-BODHI-text hover:bg-bodhi-surface hover:text-white transition-colors"
                      >
                        <span className="font-medium text-white flex items-center justify-between">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-bodhi-muted">{opt.desc}</span>
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side powerhouse toolbar actions */}
        <div className="flex items-center gap-1 text-bodhi-muted shrink-0">
          {/* 1-Click Project Scripts & Tasks Runner */}
          {packageScripts.length > 0 && (
            <div className="relative" ref={tasksMenuRef}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsTasksMenuOpen((prev) => !prev)}
                title="Run Project Script (package.json)"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                  isTasksMenuOpen
                    ? 'bg-bodhi-accent/20 text-bodhi-accent font-medium'
                    : 'hover:text-white hover:bg-bodhi-surface'
                }`}
              >
                <Zap size={12} className="text-amber-400" />
                <span className="text-[11px] hidden md:inline">Tasks</span>
                <span className="px-1 py-0.1 text-[9px] rounded bg-bodhi-surface border border-BODHI-border font-mono text-bodhi-accent">
                  {packageScripts.length}
                </span>
                <ChevronDown size={10} />
              </button>

              {/* Tasks Dropdown Menu */}
              {isTasksMenuOpen && (
                <div
                  className={`absolute right-0 w-64 bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in backdrop-blur-lg ${
                    terminalHeight < 240 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  }`}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-bodhi-muted uppercase tracking-wider border-b border-BODHI-border/50 mb-1 flex items-center justify-between">
                    <span>Project Scripts (npm)</span>
                    <span className="text-[9px] text-bodhi-accent">1-Click Run</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {packageScripts.map((pkg) => (
                      <button
                        type="button"
                        key={pkg.name}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRunScript(pkg.name)
                        }}
                        className="w-full flex items-center justify-between text-left px-3 py-1.5 text-xs text-BODHI-text hover:bg-bodhi-surface hover:text-white transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Play size={11} className="text-bodhi-accent group-hover:scale-110 transition-transform shrink-0" />
                          <span className="font-semibold text-white truncate font-mono">{pkg.name}</span>
                        </div>
                        <span className="text-[10px] text-bodhi-muted font-mono truncate max-w-[100px]">
                          {pkg.script}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Split Terminal Button */}
          <button
            type="button"
            tabIndex={-1}
            onClick={handleSplitActiveTerminal}
            title="Split Terminal Side-by-Side (Ctrl+Shift+5)"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <SplitSquareHorizontal size={13} />
          </button>

          {/* In-Terminal Search Toggle */}
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleTerminalSearch}
            title="Find in Terminal (Ctrl+F)"
            className={`p-1 rounded transition-colors ${
              isTerminalSearchOpen
                ? 'text-bodhi-accent bg-bodhi-accent/15'
                : 'hover:text-white hover:bg-bodhi-surface'
            }`}
          >
            <Search size={13} />
          </button>

          <div className="h-3.5 w-[1px] bg-BODHI-border/70 mx-0.5" />

          {/* Clear & Restart */}
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            title="Clear Terminal Output"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <Trash2 size={12} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleRestart}
            title="Restart Session"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <RotateCcw size={12} />
          </button>

          <div className="h-3.5 w-[1px] bg-BODHI-border/70 mx-0.5" />

          {/* Minimize & Close */}
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleTerminal}
            title="Hide Terminal (Ctrl+`)"
            className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleTerminal}
            title="Close Panel"
            className="p-1 hover:text-red-400 hover:bg-bodhi-surface rounded transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Floating In-Terminal Search Bar */}
      {isTerminalSearchOpen && (
        <TerminalSearchWidget
          onFindNext={handleSearchFindNext}
          onFindPrev={handleSearchFindPrev}
          onClose={handleCloseSearch}
          activeMatch={searchMatches.current}
          totalMatches={searchMatches.total}
        />
      )}

      {/* Persistent Multi-Session Containers with Side-by-Side Dual Pane Split Support */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        {rootSessions.map((session) => {
          const isParentActive = session.id === activeTerminalId
          const isChildActive = session.splitSessionId === activeTerminalId
          const isSessionVisible = isTerminalOpen && (isParentActive || isChildActive)

          const splitRatio = session.splitRatio || 0.5
          const childSession = session.splitSessionId
            ? terminalSessions.find((s) => s.id === session.splitSessionId)
            : null

          return (
            <div
              key={session.id}
              className={`w-full h-full ${isSessionVisible ? 'flex flex-row' : 'hidden'}`}
            >
              {/* Primary Left Terminal Pane */}
              <div
                style={{
                  width: childSession ? `${splitRatio * 100}%` : '100%',
                  height: '100%'
                }}
                className="relative overflow-hidden"
              >
                <TerminalInstance
                  ref={(instance) => {
                    if (instance) {
                      terminalRefs.current.set(session.id, instance)
                    } else {
                      terminalRefs.current.delete(session.id)
                    }
                  }}
                  session={session}
                  isActive={isSessionVisible}
                  rootPath={rootPath}
                />
              </div>

              {/* Middle Resize Splitter */}
              {childSession && (
                <div
                  onMouseDown={(e) => {
                    const containerWidth = e.currentTarget.parentElement?.clientWidth || 800
                    handleHorizontalSplitterMouseDown(
                      e,
                      session.id,
                      splitRatio,
                      containerWidth
                    )
                  }}
                  title="Drag to resize split panes"
                  className="w-1.5 h-full bg-BODHI-border hover:bg-bodhi-accent active:bg-bodhi-accent cursor-col-resize z-20 shrink-0 transition-colors"
                />
              )}

              {/* Secondary Right Split Terminal Pane */}
              {childSession && (
                <div
                  style={{
                    width: `${(1 - splitRatio) * 100}%`,
                    height: '100%'
                  }}
                  className="relative overflow-hidden border-l border-BODHI-border flex flex-col"
                >
                  {/* Split Pane Header Bar */}
                  <div className="h-6 px-2 bg-bodhi-surface/80 border-b border-BODHI-border/50 flex items-center justify-between text-[11px] text-bodhi-muted shrink-0 select-none">
                    <span className="font-mono text-bodhi-accent text-[10px]">
                      {childSession.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => closeSplitSession(session.id)}
                      title="Close Split Terminal"
                      className="hover:text-red-400 p-0.5 rounded transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>

                  <div className="flex-1 w-full h-full overflow-hidden">
                    <TerminalInstance
                      ref={(instance) => {
                        if (instance) {
                          terminalRefs.current.set(childSession.id, instance)
                        } else {
                          terminalRefs.current.delete(childSession.id)
                        }
                      }}
                      session={childSession}
                      isActive={isSessionVisible}
                      rootPath={rootPath}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

