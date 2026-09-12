import React, { useRef, useCallback } from 'react'
import {
  Files,
  Search,
  Settings,
  Terminal,
  FolderOpen,
  GitBranch,
  Blocks,
  Sparkles
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useGitStore } from '../../store/useGitStore'
import { FileTree } from './FileTree'
import { SearchPanel } from './SearchPanel'
import { SourceControlPanel } from './SourceControlPanel'
import { ExtensionsPanel } from './ExtensionsPanel'
import { AIChatPanel } from './AIChatPanel'

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    activeSidebarView,
    toggleSidebarView,
    toggleTerminal,
    isTerminalOpen,
    openSettingsWindow,
    settings
  } = useEditorStore()

  const isRight = settings.sidebarPosition === 'right'
  const { openFolder } = useWorkspaceStore()
  const { stagedFiles, unstagedFiles, untrackedFiles, isGitRepo } = useGitStore()
  const isResizingRef = useRef(false)

  const totalGitChanges = stagedFiles.length + unstagedFiles.length + untrackedFiles.length

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isResizingRef.current = true

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizingRef.current) return
        const isRightAligned = useEditorStore.getState().settings.sidebarPosition === 'right'
        // Subtract activity bar width (48px) and outer workspace padding (8px)
        const newWidth = isRightAligned
          ? window.innerWidth - moveEvent.clientX - 48 - 8
          : moveEvent.clientX - 48 - 8
        setSidebarWidth(newWidth)
      }

      const handleMouseUp = (): void => {
        isResizingRef.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [setSidebarWidth]
  )

  const isExplorerActive = isSidebarOpen && activeSidebarView === 'explorer'
  const isSearchActive = isSidebarOpen && activeSidebarView === 'search'
  const isGitActive = isSidebarOpen && activeSidebarView === 'git'
  const isAiActive = isSidebarOpen && activeSidebarView === 'ai'

  const indicatorClass = isRight
    ? 'absolute right-0 top-1 bottom-1 w-[3px] bg-bodhi-accent rounded-l shadow-[0_0_8px_var(--bodhi-accent)]'
    : 'absolute left-0 top-1 bottom-1 w-[3px] bg-bodhi-accent rounded-r shadow-[0_0_8px_var(--bodhi-accent)]'

  return (
    <div
      className={`flex h-full select-none shrink-0 relative bg-BODHI-sidebar border border-BODHI-border/80 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 ${
        isRight ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Persistent Activity Bar (Slim 48px rail) */}
      <div
        className={`w-12 h-full bg-bodhi-panel flex flex-col items-center py-3 justify-between shrink-0 z-30 ${
          isSidebarOpen ? (isRight ? 'border-l border-BODHI-border/60' : 'border-r border-BODHI-border/60') : ''
        }`}
      >
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Explorer Button */}
          <div className="relative w-full flex justify-center">
            {isExplorerActive && <div className={indicatorClass} />}
            <button
              onClick={() => toggleSidebarView('explorer')}
              title="Explorer (Ctrl+Shift+E)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isExplorerActive
                  ? 'text-bodhi-accent bg-bodhi-accent/15 border border-bodhi-accent/35 shadow-sm'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Files size={18} />
            </button>
          </div>

          {/* Search Button */}
          <div className="relative w-full flex justify-center">
            {isSearchActive && <div className={indicatorClass} />}
            <button
              onClick={() => toggleSidebarView('search')}
              title="Search (Ctrl+Shift+F)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isSearchActive
                  ? 'text-bodhi-accent bg-bodhi-accent/15 border border-bodhi-accent/35 shadow-sm'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Source Control Button */}
          <div className="relative w-full flex justify-center">
            {isGitActive && <div className={indicatorClass} />}
            <button
              onClick={() => toggleSidebarView('git')}
              title="Source Control (Ctrl+Shift+G)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors ${
                isGitActive
                  ? 'text-bodhi-accent bg-bodhi-accent/15 border border-bodhi-accent/35 shadow-sm'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <GitBranch size={18} />
              {isGitRepo && totalGitChanges > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-bodhi-accent text-black font-mono text-[9px] font-extrabold flex items-center justify-center shadow">
                  {totalGitChanges > 99 ? '99+' : totalGitChanges}
                </span>
              )}
            </button>
          </div>

          {/* AI Assistant Button */}
          <div className="relative w-full flex justify-center">
            {isAiActive && <div className={indicatorClass} />}
            <button
              onClick={() => toggleSidebarView('ai')}
              title="AI Assistant (Ctrl+Shift+I)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isAiActive
                  ? 'text-bodhi-accent bg-bodhi-accent/15 border border-bodhi-accent/35 shadow-sm'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Sparkles size={18} />
            </button>
          </div>

          {/* Extensions Button */}
          <div className="relative w-full flex justify-center">
            {activeSidebarView === 'extensions' && <div className={indicatorClass} />}
            <button
              onClick={() => toggleSidebarView('extensions')}
              onContextMenu={(e) => {
                e.preventDefault()
                window.bodhiAPI?.openExtensionsWindow?.()
              }}
              title="Extensions (Ctrl+Shift+X) — Right-click for standalone window"
              className={`w-8 h-8 rounded-lg flex items-center justify-center relative transition-colors ${
                activeSidebarView === 'extensions'
                  ? 'text-bodhi-accent bg-bodhi-accent/15 border border-bodhi-accent/35 shadow-sm'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Blocks size={18} />
            </button>
          </div>

          {/* Open Folder Button */}
          <div className="relative w-full flex justify-center">
            <button
              onClick={() => openFolder()}
              title="Open Folder (Ctrl+Shift+O)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
            >
              <FolderOpen size={18} />
            </button>
          </div>

          {/* Terminal Toggle Button */}
          <div className="relative w-full flex justify-center">
            <button
              onClick={toggleTerminal}
              title="Integrated Terminal (Ctrl+`)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isTerminalOpen
                  ? 'text-bodhi-accent bg-bodhi-accent/10 border border-bodhi-accent/25'
                  : 'text-bodhi-muted hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Terminal size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Activity Bar (Settings Window Opener) */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative w-full flex justify-center">
            <button
              onClick={openSettingsWindow}
              title="Open Settings Window (Ctrl+,)"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-bodhi-muted hover:text-white hover:bg-bodhi-surface active:text-bodhi-accent"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Sidebar Content Panel */}
      {isSidebarOpen && (
        <>
          <div
            style={{ width: `${sidebarWidth}px` }}
            className="h-full flex flex-col overflow-hidden bg-BODHI-sidebar animate-fade-in"
          >
            {activeSidebarView === 'explorer' && <FileTree />}
            {activeSidebarView === 'search' && <SearchPanel />}
            {activeSidebarView === 'git' && <SourceControlPanel />}
            {activeSidebarView === 'extensions' && <ExtensionsPanel />}
            {activeSidebarView === 'ai' && <AIChatPanel />}
          </div>

          {/* Horizontal Resizer Line */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-1.5 absolute top-0 bottom-0 cursor-col-resize hover:bg-bodhi-accent/50 active:bg-bodhi-accent transition-colors z-20 ${
              isRight ? 'left-0' : 'right-0'
            }`}
          />
        </>
      )}
    </div>
  )
}



