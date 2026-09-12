import React, { useEffect, useRef, useCallback } from 'react'
import { TitleBar } from './components/TitleBar/TitleBar'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TabBar } from './components/Editor/TabBar'
import { CodeEditor } from './components/Editor/CodeEditor'
import { EmptyState } from './components/Editor/EmptyState'
import { TerminalPanel } from './components/Terminal/TerminalPanel'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette/CommandPalette'
import { AboutModal } from './components/AboutModal/AboutModal'
import { TermsModal } from './components/TermsModal/TermsModal'
import { WelcomeWalkthrough } from './components/WelcomeWalkthrough/WelcomeWalkthrough'
import { useEditorStore } from './store/useEditorStore'
import { useWorkspaceStore } from './store/useWorkspaceStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { sessionService } from './services/sessionService'
import { extensionLoaderService } from './services/extensionLoaderService'

export const App: React.FC = () => {
  const {
    tabs,
    pane2Tabs,
    activeTabId,
    pane2ActiveTabId,
    isSplitEditorOpen,
    splitRatio,
    setSplitRatio,
    isTerminalOpen,
    terminalHeight,
    terminalSessions,
    activeTerminalId,
    restoreSession,
    settings,
    initSettingsSync
  } = useEditorStore()
  const { rootPath, initWatcher, openFolder } = useWorkspaceStore()

  const isResizingSplitRef = useRef(false)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const isRestoredRef = useRef(false)

  // Initialize global shortcuts
  useKeyboardShortcuts()

  // Initialize installed extensions (snippets & themes)
  useEffect(() => {
    extensionLoaderService.initialize()
  }, [])

  // Rehydrate previous workspace session on launch
  useEffect(() => {
    if (isRestoredRef.current) return
    isRestoredRef.current = true

    const rehydrate = async (): Promise<void> => {
      const saved = sessionService.loadSession()
      if (!saved) return

      if (saved.rootPath) {
        await openFolder(saved.rootPath)
      }

      // Re-read fresh content from disk for persisted tabs
      const restoreTabsWithContent = async (rawTabs: typeof tabs = []): Promise<typeof tabs> => {
        const results: typeof tabs = []
        for (const t of rawTabs) {
          try {
            if (t.isDirty && t.content) {
              results.push(t)
            } else if (window.bodhiAPI?.readFile && t.path) {
              const fresh = await window.bodhiAPI.readFile(t.path)
              results.push({
                ...t,
                content: fresh,
                savedContent: fresh
              })
            } else {
              results.push(t)
            }
          } catch (err) {
            console.warn(`Could not restore file from disk [${t.path}]:`, err)
            results.push(t)
          }
        }
        return results
      }

      const tabsWithContent = await restoreTabsWithContent(saved.tabs || [])
      const pane2WithContent = await restoreTabsWithContent(saved.pane2Tabs || [])

      restoreSession({
        tabs: tabsWithContent,
        activeTabId: saved.activeTabId || null,
        pane2Tabs: pane2WithContent,
        pane2ActiveTabId: saved.pane2ActiveTabId || null,
        isSplitEditorOpen: !!saved.isSplitEditorOpen,
        splitRatio: saved.splitRatio || 0.5,
        isTerminalOpen: !!saved.isTerminalOpen,
        terminalHeight: saved.terminalHeight || 240,
        terminalSessions:
          saved.terminalSessions && saved.terminalSessions.length > 0
            ? saved.terminalSessions
            : undefined,
        activeTerminalId: saved.activeTerminalId || ''
      })

      // If a saved cursor position exists for the active tab, restore it directly
      if (saved.activeTabId && saved.cursorPosition) {
        useEditorStore.getState().setTargetEditorLocation({
          path: saved.activeTabId,
          line: saved.cursorPosition.line,
          col: saved.cursorPosition.col
        })
      }
    }

    rehydrate()
  }, [openFolder, restoreSession])

  // Synchronously flush active session state on window close/exit
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      const state = useEditorStore.getState()
      const wsState = useWorkspaceStore.getState()
      sessionService.saveSession({
        rootPath: wsState.rootPath,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        pane2Tabs: state.pane2Tabs,
        pane2ActiveTabId: state.pane2ActiveTabId,
        isSplitEditorOpen: state.isSplitEditorOpen,
        splitRatio: state.splitRatio,
        isTerminalOpen: state.isTerminalOpen,
        terminalHeight: state.terminalHeight,
        terminalSessions: state.terminalSessions,
        activeTerminalId: state.activeTerminalId,
        cursorPosition: state.cursorPosition
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Debounced auto-save of workspace session whenever layout or files change
  useEffect(() => {
    if (!isRestoredRef.current) return

    const timer = setTimeout(() => {
      sessionService.saveSession({
        rootPath,
        tabs,
        activeTabId,
        pane2Tabs,
        pane2ActiveTabId,
        isSplitEditorOpen,
        splitRatio,
        isTerminalOpen,
        terminalHeight,
        terminalSessions,
        activeTerminalId,
        cursorPosition: useEditorStore.getState().cursorPosition
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [
    rootPath,
    tabs,
    activeTabId,
    pane2Tabs,
    pane2ActiveTabId,
    isSplitEditorOpen,
    splitRatio,
    isTerminalOpen,
    terminalHeight,
    terminalSessions,
    activeTerminalId
  ])

  // Initialize file watcher and settings subscriptions
  useEffect(() => {
    if (typeof window !== 'undefined' && window.bodhiAPI) {
      const unsubWatcher = initWatcher()
      const unsubSettings = initSettingsSync()
      return () => {
        unsubWatcher()
        unsubSettings()
      }
    }
    return undefined
  }, [initWatcher, initSettingsSync])

  // Auto Save interval (every 5 seconds when enabled and dirty files exist)
  useEffect(() => {
    if (!settings.autoSave) return

    const interval = setInterval(() => {
      const { tabs: currentTabs, pane2Tabs, saveAllTabs } = useEditorStore.getState()
      const hasDirty =
        currentTabs.some((t) => t.isDirty) || pane2Tabs.some((t) => t.isDirty)
      if (hasDirty) {
        saveAllTabs()
      }
    }, settings.autoSaveDelay || 5000)

    return () => clearInterval(interval)
  }, [settings.autoSave, settings.autoSaveDelay])

  // Horizontal resizer for dual pane split
  const handleSplitMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isResizingSplitRef.current = true

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizingSplitRef.current || !splitContainerRef.current) return
        const rect = splitContainerRef.current.getBoundingClientRect()
        const newRatio = (moveEvent.clientX - rect.left) / rect.width
        setSplitRatio(newRatio)
      }

      const handleMouseUp = (): void => {
        isResizingSplitRef.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [setSplitRatio]
  )

  const handleSplitDoubleClick = (): void => {
    setSplitRatio(0.5)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-bodhi-bg text-BODHI-text overflow-hidden font-sans">
      {/* Frameless Draggable TitleBar */}
      <TitleBar />

      {/* Main Workspace Area */}
      <div
        className={`flex-1 flex overflow-hidden relative px-2 pb-2 pt-1 gap-2 ${
          settings.sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Dockable Sidebar */}
        <Sidebar />

        {/* Editor & Terminal Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bodhi-bg border border-BODHI-border/80 rounded-2xl relative shadow-md">
          {/* Main Editor Section */}
          <div ref={splitContainerRef} className="flex-1 flex overflow-hidden relative">
            {isSplitEditorOpen ? (
              <>
                {/* Pane 1 (Left) */}
                <div
                  style={{ width: `${splitRatio * 100}%` }}
                  className="h-full flex flex-col overflow-hidden border-r border-BODHI-border relative"
                >
                  <TabBar pane={1} />
                  <div className="flex-1 overflow-hidden relative">
                    <CodeEditor pane={1} />
                  </div>
                </div>

                {/* Middle Split Resizer Handle */}
                <div
                  onMouseDown={handleSplitMouseDown}
                  onDoubleClick={handleSplitDoubleClick}
                  title="Drag to resize split (Double-click to center)"
                  className="w-1.5 h-full cursor-col-resize hover:bg-bodhi-accent active:bg-bodhi-accent transition-colors z-20 shrink-0 bg-bodhi-panel -mx-[3px]"
                />

                {/* Pane 2 (Right) */}
                <div
                  style={{ width: `${(1 - splitRatio) * 100}%` }}
                  className="h-full flex flex-col overflow-hidden relative"
                >
                  <TabBar pane={2} />
                  <div className="flex-1 overflow-hidden relative">
                    <CodeEditor pane={2} />
                  </div>
                </div>
              </>
            ) : tabs.length > 0 ? (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <TabBar pane={1} />
                <div className="flex-1 overflow-hidden relative">
                  <CodeEditor pane={1} />
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Dockable Bottom Terminal */}
          <TerminalPanel />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Global Quick Open & Command Palette Modal */}
      <CommandPalette />

      {/* About BODHI Modal Dialog */}
      <AboutModal />

      {/* Terms & Conditions Modal Dialog */}
      <TermsModal />

      {/* Interactive First-Time & On-Demand Walkthrough */}
      <WelcomeWalkthrough />
    </div>
  )
}

export default App

