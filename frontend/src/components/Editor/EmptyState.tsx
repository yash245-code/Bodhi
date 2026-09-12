import React from 'react'
import {
  FolderOpen,
  FilePlus,
  Terminal,
  Keyboard,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useEditorStore } from '../../store/useEditorStore'
import { BodhiLogo } from '../common/BodhiLogo'

export const EmptyState: React.FC = () => {
  const { openFolder, openFileDirectly, rootPath, setCreatingItem } = useWorkspaceStore()
  const { openTab, toggleTerminal, setWalkthroughOpen } = useEditorStore()

  const handleOpenFile = async (): Promise<void> => {
    const filePath = await openFileDirectly()
    if (filePath) {
      await openTab(filePath)
    }
  }

  const handleNewFile = (): void => {
    if (rootPath) {
      setCreatingItem({ parentPath: rootPath, type: 'file' })
    } else {
      openFolder()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-bodhi-bg select-none p-6">
      <div className="flex flex-col items-center max-w-md w-full text-center">
        {/* Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <BodhiLogo
            size={108}
            className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 ring-1 ring-white/10"
          />
        </div>

        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-[#bdf59e] to-bodhi-accent bg-clip-text text-transparent mb-2 tracking-tight">
          BODHI EDITOR
        </h1>
        <p className="text-xs text-bodhi-muted mb-5 leading-relaxed">
          High-performance desktop code editor with Monaco Engine & node-pty Terminal
        </p>

        {/* Interactive Walkthrough Banner */}
        <button
          onClick={() => setWalkthroughOpen(true)}
          className="w-full mb-6 p-3 rounded-xl bg-gradient-to-r from-bodhi-accent/20 via-bodhi-panel to-bodhi-accent/10 border border-bodhi-accent/40 hover:border-bodhi-accent text-left transition-all group flex items-center justify-between shadow-lg shadow-bodhi-accent/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bodhi-accent text-black flex items-center justify-center font-bold shadow-md shadow-bodhi-accent/20 group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Interactive Walkthrough & Tour</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/30">
                  Interactive
                </span>
              </div>
              <div className="text-[10px] text-bodhi-muted">
                Explore themes, AI superpowers, hot-reload, and terminal
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-bodhi-accent flex items-center gap-1 pr-1 group-hover:translate-x-1 transition-transform">
            <span>Start Tour</span>
            <ArrowRight size={13} />
          </div>
        </button>

        {/* Quick Actions */}
        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => openFolder()}
            className="flex items-center gap-3 p-3 rounded-lg bg-bodhi-panel border border-BODHI-border hover:border-bodhi-accent/50 hover:bg-bodhi-surface text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-bodhi-accent/10 flex items-center justify-center text-bodhi-accent group-hover:scale-110 transition-transform">
              <FolderOpen size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Open Folder</div>
              <div className="text-[10px] text-bodhi-muted">Ctrl + Shift + O</div>
            </div>
          </button>

          <button
            onClick={handleOpenFile}
            className="flex items-center gap-3 p-3 rounded-lg bg-bodhi-panel border border-BODHI-border hover:border-bodhi-accent/50 hover:bg-bodhi-surface text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-bodhi-accent/10 flex items-center justify-center text-bodhi-accent group-hover:scale-110 transition-transform">
              <FilePlus size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Open File</div>
              <div className="text-[10px] text-bodhi-muted">Ctrl + O</div>
            </div>
          </button>

          <button
            onClick={handleNewFile}
            className="flex items-center gap-3 p-3 rounded-lg bg-bodhi-panel border border-BODHI-border hover:border-bodhi-accent/50 hover:bg-bodhi-surface text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-bodhi-accent/10 flex items-center justify-center text-bodhi-accent group-hover:scale-110 transition-transform">
              <FilePlus size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">New File</div>
              <div className="text-[10px] text-bodhi-muted">In workspace</div>
            </div>
          </button>

          <button
            onClick={toggleTerminal}
            className="flex items-center gap-3 p-3 rounded-lg bg-bodhi-panel border border-BODHI-border hover:border-bodhi-accent/50 hover:bg-bodhi-surface text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-bodhi-accent/10 flex items-center justify-center text-bodhi-accent group-hover:scale-110 transition-transform">
              <Terminal size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Terminal</div>
              <div className="text-[10px] text-bodhi-muted">Ctrl + `</div>
            </div>
          </button>
        </div>

        {/* Shortcuts Cheat Sheet */}
        <div className="w-full bg-bodhi-panel/60 border border-BODHI-border/70 rounded-lg p-3 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-bodhi-accent mb-2">
            <Keyboard size={13} />
            <span>Keybindings</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
            <div className="flex items-center justify-between pr-3 text-bodhi-muted">
              <span>Save file</span>
              <kbd className="px-1.5 py-0.5 rounded bg-bodhi-surface text-white text-[10px] font-mono border border-BODHI-border">
                Ctrl+S
              </kbd>
            </div>
            <div className="flex items-center justify-between text-bodhi-muted">
              <span>Close tab</span>
              <kbd className="px-1.5 py-0.5 rounded bg-bodhi-surface text-white text-[10px] font-mono border border-BODHI-border">
                Ctrl+W
              </kbd>
            </div>
            <div className="flex items-center justify-between pr-3 text-bodhi-muted">
              <span>Toggle sidebar</span>
              <kbd className="px-1.5 py-0.5 rounded bg-bodhi-surface text-white text-[10px] font-mono border border-BODHI-border">
                Ctrl+B
              </kbd>
            </div>
            <div className="flex items-center justify-between text-bodhi-muted">
              <span>Toggle terminal</span>
              <kbd className="px-1.5 py-0.5 rounded bg-bodhi-surface text-white text-[10px] font-mono border border-BODHI-border">
                Ctrl+`
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
