import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Copy, Search, Settings, User } from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { useAuthStore } from '../store/useAuthStore'
import { MenuBar } from './TitleBar/MenuBar'
import { BodhiLogo } from './common/BodhiLogo'
import { AccountModal } from './AccountModal/AccountModal'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const { tabs, activeTabId, openPalette, openSettingsWindow } = useEditorStore()
  const { rootPath } = useWorkspaceStore()
  const { user, openAuthModal, checkAuthStatus } = useAuthStore()

  const activeTab = tabs.find((t) => t.id === activeTabId)

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    const checkMaximized = async (): Promise<void> => {
      if (window.bodhiAPI?.isMaximized) {
        const max = await window.bodhiAPI.isMaximized()
        setIsMaximized(max)
      }
    }
    checkMaximized()
  }, [])

  const handleMinimize = async (): Promise<void> => {
    await window.bodhiAPI.minimizeWindow()
  }

  const handleMaximize = async (): Promise<void> => {
    await window.bodhiAPI.maximizeWindow()
    const max = await window.bodhiAPI.isMaximized()
    setIsMaximized(max)
  }

  const handleClose = async (): Promise<void> => {
    await window.bodhiAPI.closeWindow()
  }

  // Format breadcrumb
  let breadcrumb = 'BODHI'
  if (rootPath) {
    const rootName = rootPath.split(/[/\\]/).pop() || rootPath
    breadcrumb = rootName
    if (activeTab) {
      const relPath = activeTab.path.replace(rootPath, '')
      breadcrumb = `${rootName} ${relPath.replace(/^[/\\]/, ' › ')}`
    }
  } else if (activeTab) {
    breadcrumb = activeTab.name
  }

  return (
    <div className="h-11 w-full bg-BODHI-sidebar border-b border-BODHI-border flex items-center justify-between px-3 select-none draggable-region z-[70] relative">
      {/* Left section: Logo and Quick Open Search Bar */}
      <div className="flex items-center gap-3 non-draggable z-10">
        <button
          onClick={() => openPalette('accents')}
          title="BODHI - Click to customize Accent Color & Theme"
          className="flex items-center pr-1 pl-0.5 cursor-pointer hover:scale-105 active:scale-95 transition-all group focus:outline-none"
        >
          <BodhiLogo size={28} className="rounded-md shadow-sm" />
        </button>

        <div className="h-4 w-[1px] bg-BODHI-border" />

        {/* Search option in Top-Left */}
        <button
          onClick={() => openPalette('files')}
          title="Quick Open (Ctrl+P)"
          className="flex items-center gap-2 w-48 sm:w-60 md:w-72 px-2.5 py-1 bg-bodhi-bg/80 hover:bg-bodhi-surface border border-BODHI-border/70 hover:border-bodhi-accent/40 rounded-md text-xs text-bodhi-muted hover:text-BODHI-text transition-all shadow-inner group"
        >
          <Search size={12} className="text-bodhi-muted group-hover:text-bodhi-accent transition-colors shrink-0" />
          <span className="truncate flex-1 text-left">{breadcrumb}</span>
          <kbd className="hidden sm:inline px-1.5 py-0.2 text-[10px] font-mono rounded bg-bodhi-panel text-bodhi-muted border border-BODHI-border/50">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* Center section: File, Edit, View, Run, Terminal, Help Menus */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center non-draggable z-10">
        <MenuBar />
      </div>

      {/* Right section: Window Controls */}
      <div className="flex items-center non-draggable z-10">
        <button
          onClick={openAuthModal}
          className="h-11 w-11 flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
          title={user ? `Account: ${user.name} (${user.email})` : 'Sign in with Google'}
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-5 h-5 rounded-full border border-bodhi-accent/60"
            />
          ) : (
            <User size={14} className={user ? 'text-bodhi-accent' : ''} />
          )}
        </button>
        <button
          onClick={openSettingsWindow}
          className="h-11 w-11 flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
          title="Settings (Ctrl+,)"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={handleMinimize}
          className="h-11 w-11 flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
          title="Minimize"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={handleMaximize}
          className="h-11 w-11 flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy size={11} className="rotate-180" /> : <Square size={11} />}
        </button>
        <button
          onClick={handleClose}
          className="h-11 w-11 flex items-center justify-center text-bodhi-muted hover:text-white hover:bg-red-600 transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      <AccountModal />
    </div>
  )
}

