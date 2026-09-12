import React, { useState } from 'react'
import {
  X,
  Circle,
  FileCode,
  FileText,
  FileJson,
  Columns,
  Eye,
  BookOpen,
  ArrowRightLeft,
  GitCompare
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useGitStore } from '../../store/useGitStore'
import { Tab } from '@shared/types'

function getTabIcon(tab: Tab): React.ReactNode {
  if (tab.isDiff) {
    return <GitCompare size={13} className="text-amber-400 shrink-0" />
  }

  const ext = tab.name.split('.').pop()?.toLowerCase() || ''
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'cpp', 'c', 'cs'].includes(ext)) {
    return <FileCode size={13} className="text-bodhi-accent shrink-0" />
  }
  if (['json', 'yaml', 'yml', 'toml'].includes(ext)) {
    return <FileJson size={13} className="text-yellow-400 shrink-0" />
  }
  if (['md', 'markdown'].includes(ext)) {
    return <BookOpen size={13} className="text-bodhi-accent shrink-0" />
  }
  return <FileText size={13} className="text-bodhi-muted shrink-0" />
}

interface TabBarProps {
  pane?: 1 | 2
}

export const TabBar: React.FC<TabBarProps> = ({ pane = 1 }) => {
  const {
    tabs,
    activeTabId,
    pane2Tabs,
    pane2ActiveTabId,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    moveTabToPane,
    toggleSplitEditor,
    isSplitEditorOpen,
    isMarkdownPreviewOpen,
    toggleMarkdownPreview,
    toggleDiffMode
  } = useEditorStore()

  const { isGitRepo } = useGitStore()

  const currentTabs = pane === 1 ? tabs : pane2Tabs
  const currentActiveId = pane === 1 ? activeTabId : pane2ActiveTabId
  const activeTab = currentTabs.find((t) => t.id === currentActiveId)
  const isMarkdownFile =
    activeTab?.name.endsWith('.md') || activeTab?.name.endsWith('.markdown')

  const [contextMenu, setContextMenu] = useState<{
    tabId: string
    x: number
    y: number
  } | null>(null)

  if (currentTabs.length === 0) return null

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId, pane)
  }

  const handleTabAuxClick = (e: React.MouseEvent, tabId: string): void => {
    if (e.button === 1) {
      e.preventDefault()
      closeTab(tabId, pane)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, tabId: string): void => {
    e.preventDefault()
    setContextMenu({ tabId, x: e.clientX, y: e.clientY })
  }

  const closeMenu = (): void => setContextMenu(null)

  return (
    <>
      <div className="h-9 bg-bodhi-panel border-b border-BODHI-border flex items-center justify-between px-1 select-none shrink-0 overflow-hidden">
        {/* Tab List */}
        <div className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar flex-1">
          {currentTabs.map((tab: Tab) => {
            const isActive = tab.id === currentActiveId
            return (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                onAuxClick={(e) => handleTabAuxClick(e, tab.id)}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                title={tab.diffTitle || tab.path}
                className={`group relative flex items-center gap-2 h-8 px-3 rounded-t-md text-xs cursor-pointer transition-all border-t-2 shrink-0 ${
                  isActive
                    ? 'bg-bodhi-bg text-white border-bodhi-accent font-medium tab-active-glow'
                    : 'bg-transparent text-bodhi-muted border-transparent hover:bg-bodhi-surface/40 hover:text-gray-200'
                }`}
              >
                {getTabIcon(tab)}
                <span className="truncate max-w-[130px]">{tab.name}</span>

                {/* Dirty state circle or Close button */}
                <div className="flex items-center justify-center w-4 h-4 ml-1">
                  {tab.isDirty ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tab.id, pane)
                      }}
                      className="group-hover:hidden flex items-center justify-center text-bodhi-accent"
                    >
                      <Circle size={8} fill="currentColor" />
                    </button>
                  ) : null}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id, pane)
                    }}
                    className={`rounded hover:bg-bodhi-surface/80 hover:text-white p-0.5 text-bodhi-muted ${
                      tab.isDirty ? 'hidden group-hover:flex' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right TabBar Quick Actions */}
        <div className="flex items-center gap-1 pl-2 text-bodhi-muted shrink-0">
          {/* Git Diff with HEAD Button */}
          {isGitRepo && activeTab && (
            <button
              onClick={() => toggleDiffMode(activeTab.id, pane)}
              title={
                activeTab.isDiff
                  ? 'Switch back to Regular Editor'
                  : 'Open Side-by-Side Diff with HEAD'
              }
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
                activeTab.isDiff
                  ? 'text-amber-400 bg-amber-400/15 border border-amber-400/30 font-medium'
                  : 'hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <GitCompare size={13} />
              <span className="hidden md:inline">
                {activeTab.isDiff ? 'Diff Active' : 'Diff'}
              </span>
            </button>
          )}

          {/* Markdown Preview Button (shown if active file is .md) */}
          {isMarkdownFile && !activeTab?.isDiff && (
            <button
              onClick={toggleMarkdownPreview}
              title={`Toggle Markdown Preview (Ctrl+Shift+V) - ${isMarkdownPreviewOpen ? 'On' : 'Off'}`}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
                isMarkdownPreviewOpen
                  ? 'text-bodhi-accent bg-bodhi-accent/20 border border-bodhi-accent/40 font-medium'
                  : 'hover:text-white hover:bg-bodhi-surface'
              }`}
            >
              <Eye size={13} />
              <span className="hidden md:inline">Preview</span>
            </button>
          )}

          {/* Split Editor Toggle Button */}
          <button
            onClick={toggleSplitEditor}
            title={`Split Editor Right (Ctrl+\\) - ${isSplitEditorOpen ? 'Active' : 'Disabled'}`}
            className={`p-1.5 rounded transition-colors ${
              isSplitEditorOpen
                ? 'text-bodhi-accent bg-bodhi-accent/15'
                : 'hover:text-white hover:bg-bodhi-surface'
            }`}
          >
            <Columns size={13} />
          </button>
        </div>
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50 bg-transparent"
          onClick={closeMenu}
          onContextMenu={(e) => {
            e.preventDefault()
            closeMenu()
          }}
        >
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="absolute bg-bodhi-surface border border-BODHI-border rounded-md shadow-xl py-1 w-48 text-xs text-BODHI-text z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {isGitRepo && (
              <>
                <button
                  onClick={() => {
                    toggleDiffMode(contextMenu.tabId, pane)
                    closeMenu()
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-bodhi-accent hover:text-black font-medium transition-colors flex items-center gap-2"
                >
                  <GitCompare size={12} className="text-amber-400" />
                  <span>Toggle Diff View</span>
                </button>
                <div className="h-[1px] bg-BODHI-border my-1" />
              </>
            )}
            <button
              onClick={() => {
                closeTab(contextMenu.tabId, pane)
                closeMenu()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-bodhi-accent hover:text-black font-medium transition-colors"
            >
              Close Tab
            </button>
            <button
              onClick={() => {
                closeOtherTabs(contextMenu.tabId, pane)
                closeMenu()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-bodhi-accent hover:text-black font-medium transition-colors"
            >
              Close Others
            </button>
            <div className="h-[1px] bg-BODHI-border my-1" />
            <button
              onClick={() => {
                moveTabToPane(contextMenu.tabId, pane === 1 ? 2 : 1)
                closeMenu()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-bodhi-accent hover:text-black font-medium transition-colors flex items-center justify-between"
            >
              <span>Move to {pane === 1 ? 'Right Pane' : 'Left Pane'}</span>
              <ArrowRightLeft size={11} className="text-bodhi-muted" />
            </button>
            <div className="h-[1px] bg-BODHI-border my-1" />
            <button
              onClick={() => {
                closeAllTabs(pane)
                closeMenu()
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white transition-colors"
            >
              Close All in Pane
            </button>
          </div>
        </div>
      )}
    </>
  )
}
