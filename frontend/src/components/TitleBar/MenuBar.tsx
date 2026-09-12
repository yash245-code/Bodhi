import React, { useState, useEffect, useRef } from 'react'
import {
  FileCode2,
  FolderOpen,
  Save,
  FilePlus,
  XSquare,
  Terminal,
  Columns,
  Search,
  Settings,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Scissors,
  Copy,
  Clipboard,
  Undo2,
  Redo2,
  Layers,
  ZoomIn,
  ZoomOut,
  WrapText,
  Maximize2,
  Check,
  ShieldCheck
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'

interface MenuItem {
  label: string
  shortcut?: string
  icon?: React.ReactNode
  divider?: boolean
  disabled?: boolean
  onClick?: () => void
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

export const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  const {
    tabs,
    activeTabId,
    saveActiveTab,
    saveAllTabs,
    closeTab,
    closeAllTabs,
    openPalette,
    toggleTerminal,
    addTerminalSession,
    activeTerminalId,
    toggleSidebarView,
    toggleSplitEditor,
    toggleMarkdownPreview,
    increaseFontSize,
    decreaseFontSize,
    toggleMinimap,
    toggleWordWrap,
    toggleAutoSave,
    toggleSidebarPosition,
    settings,
    setAboutModalOpen,
    setTermsModalOpen,
    setWalkthroughOpen,
    openSettingsWindow,
    openTab
  } = useEditorStore()

  const { openFolder, openFileDirectly, rootPath, setCreatingItem } = useWorkspaceStore()

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && activeMenu !== null) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeMenu])

  const handleMenuClick = (menuName: string): void => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName))
  }

  const handleMenuMouseEnter = (menuName: string): void => {
    if (activeMenu !== null) {
      setActiveMenu(menuName)
    }
  }

  const executeAction = (action?: () => void): void => {
    setActiveMenu(null)
    if (action) {
      action()
    }
  }

  const activeTab = tabs.find((t) => t.id === activeTabId)

  // Define menus with full action wiring
  const menus: MenuCategory[] = [
    {
      name: 'File',
      items: [
        {
          label: 'New File',
          shortcut: 'Ctrl+N',
          icon: <FilePlus size={13} />,
          onClick: () => {
            if (rootPath) {
              setCreatingItem({ parentPath: rootPath, type: 'file' })
              toggleSidebarView('explorer')
            } else {
              openPalette('files')
            }
          }
        },
        {
          label: 'Open File...',
          shortcut: 'Ctrl+O',
          icon: <FileCode2 size={13} />,
          onClick: async () => {
            const file = await openFileDirectly()
            if (file) await openTab(file)
          }
        },
        {
          label: 'Open Folder...',
          shortcut: 'Ctrl+Shift+O',
          icon: <FolderOpen size={13} />,
          onClick: () => openFolder()
        },
        { label: '', divider: true },
        {
          label: 'Save',
          shortcut: 'Ctrl+S',
          icon: <Save size={13} />,
          disabled: !activeTab,
          onClick: () => saveActiveTab()
        },
        {
          label: 'Save All',
          shortcut: 'Ctrl+Shift+S',
          disabled: tabs.length === 0,
          onClick: () => saveAllTabs()
        },
        {
          label: 'Auto Save (5s)',
          icon: (
            <Check
              size={13}
              className={settings.autoSave ? 'text-bodhi-accent' : 'opacity-0'}
            />
          ),
          onClick: () => toggleAutoSave()
        },
        { label: '', divider: true },
        {
          label: 'Close Editor',
          shortcut: 'Ctrl+W',
          disabled: !activeTabId,
          onClick: () => {
            if (activeTabId) closeTab(activeTabId)
          }
        },
        {
          label: 'Close All Editors',
          disabled: tabs.length === 0,
          onClick: () => closeAllTabs()
        },
        { label: '', divider: true },
        {
          label: 'Exit',
          shortcut: 'Alt+F4',
          icon: <XSquare size={13} />,
          onClick: () => {
            if (window.bodhiAPI?.closeWindow) {
              window.bodhiAPI.closeWindow()
            }
          }
        }
      ]
    },
    {
      name: 'Edit',
      items: [
        {
          label: 'Undo',
          shortcut: 'Ctrl+Z',
          icon: <Undo2 size={13} />,
          onClick: () => document.execCommand('undo')
        },
        {
          label: 'Redo',
          shortcut: 'Ctrl+Y',
          icon: <Redo2 size={13} />,
          onClick: () => document.execCommand('redo')
        },
        { label: '', divider: true },
        {
          label: 'Cut',
          shortcut: 'Ctrl+X',
          icon: <Scissors size={13} />,
          onClick: () => document.execCommand('cut')
        },
        {
          label: 'Copy',
          shortcut: 'Ctrl+C',
          icon: <Copy size={13} />,
          onClick: () => document.execCommand('copy')
        },
        {
          label: 'Paste',
          shortcut: 'Ctrl+V',
          icon: <Clipboard size={13} />,
          onClick: () => document.execCommand('paste')
        },
        { label: '', divider: true },
        {
          label: 'Find in Active File',
          shortcut: 'Ctrl+F',
          icon: <Search size={13} />,
          onClick: () => {
            // Focus editor and trigger find
            window.dispatchEvent(new CustomEvent('BODHI:editor:find'))
          }
        },
        {
          label: 'Replace in Active File',
          shortcut: 'Ctrl+H',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('BODHI:editor:replace'))
          }
        }
      ]
    },
    {
      name: 'View',
      items: [
        {
          label: 'Command Palette...',
          shortcut: 'Ctrl+Shift+P',
          icon: <Sparkles size={13} />,
          onClick: () => openPalette('commands')
        },
        {
          label: 'Quick Open...',
          shortcut: 'Ctrl+P',
          icon: <Search size={13} />,
          onClick: () => openPalette('files')
        },
        { label: '', divider: true },
        {
          label: 'Explorer',
          shortcut: 'Ctrl+Shift+E',
          icon: <Columns size={13} />,
          onClick: () => toggleSidebarView('explorer')
        },
        {
          label: 'Search',
          shortcut: 'Ctrl+Shift+F',
          icon: <Search size={13} />,
          onClick: () => toggleSidebarView('search')
        },
        {
          label: 'Source Control',
          shortcut: 'Ctrl+Shift+G',
          icon: <Columns size={13} />,
          onClick: () => toggleSidebarView('git')
        },
        {
          label: 'Toggle Primary Side Bar',
          shortcut: 'Ctrl+B',
          onClick: () => toggleSidebarView('explorer')
        },
        {
          label: (settings.sidebarPosition || 'left') === 'right' ? 'Move Primary Side Bar Left' : 'Move Primary Side Bar Right',
          onClick: () => toggleSidebarPosition()
        },
        {
          label: 'Toggle Integrated Terminal',
          shortcut: 'Ctrl+`',
          icon: <Terminal size={13} />,
          onClick: () => toggleTerminal()
        },
        { label: '', divider: true },
        {
          label: 'Color Theme...',
          shortcut: 'Ctrl+K Ctrl+T',
          onClick: () => openPalette('themes')
        },
        {
          label: 'Accent Color...',
          onClick: () => openPalette('accents')
        },
        { label: '', divider: true },
        {
          label: 'Split Editor Right',
          shortcut: 'Ctrl+\\',
          icon: <Columns size={13} />,
          onClick: () => toggleSplitEditor()
        },
        {
          label: 'Toggle Markdown Preview',
          shortcut: 'Ctrl+Shift+V',
          onClick: () => toggleMarkdownPreview()
        },
        { label: '', divider: true },
        {
          label: 'Zoom In',
          shortcut: 'Ctrl+=',
          icon: <ZoomIn size={13} />,
          onClick: () => {
            if (window.bodhiAPI?.zoomIn) {
              window.bodhiAPI.zoomIn()
            } else {
              increaseFontSize()
            }
          }
        },
        {
          label: 'Zoom Out',
          shortcut: 'Ctrl+-',
          icon: <ZoomOut size={13} />,
          onClick: () => {
            if (window.bodhiAPI?.zoomOut) {
              window.bodhiAPI.zoomOut()
            } else {
              decreaseFontSize()
            }
          }
        },
        {
          label: 'Reset Zoom',
          shortcut: 'Ctrl+0',
          onClick: () => {
            if (window.bodhiAPI?.resetZoom) {
              window.bodhiAPI.resetZoom()
            }
          }
        },
        { label: '', divider: true },
        {
          label: 'Toggle Minimap',
          icon: <Layers size={13} />,
          onClick: () => toggleMinimap()
        },
        {
          label: 'Toggle Word Wrap',
          shortcut: 'Alt+Z',
          icon: <WrapText size={13} />,
          onClick: () => toggleWordWrap()
        },
        {
          label: 'Toggle Full Screen',
          shortcut: 'F11',
          icon: <Maximize2 size={13} />,
          onClick: () => {
            if (window.bodhiAPI?.maximizeWindow) {
              window.bodhiAPI.maximizeWindow()
            }
          }
        }
      ]
    },
    {
      name: 'Run',
      items: [
        {
          label: 'Run Active File in Terminal',
          shortcut: 'F5',
          icon: <Play size={13} />,
          disabled: !activeTab,
          onClick: () => {
            if (activeTab && window.bodhiAPI?.writeTerminal) {
              const ext = activeTab.name.split('.').pop()?.toLowerCase()
              let cmd = ''
              if (ext === 'js' || ext === 'mjs') cmd = `node "${activeTab.path}"\r`
              else if (ext === 'ts') cmd = `npx ts-node "${activeTab.path}"\r`
              else if (ext === 'py') cmd = `python "${activeTab.path}"\r`
              else if (ext === 'ps1') cmd = `powershell -ExecutionPolicy Bypass -File "${activeTab.path}"\r`
              else cmd = `echo "Running ${activeTab.name}"\r`

              window.bodhiAPI.writeTerminal(activeTerminalId, cmd)
            }
          }
        },
        {
          label: 'Restart Terminal Session',
          icon: <RotateCcw size={13} />,
          onClick: () => {
            if (window.bodhiAPI?.writeTerminal) {
              window.bodhiAPI.writeTerminal(activeTerminalId, '\x03clear\r')
            }
          }
        }
      ]
    },
    {
      name: 'Terminal',
      items: [
        {
          label: 'New Terminal Session',
          shortcut: 'Ctrl+Shift+`',
          icon: <Terminal size={13} />,
          onClick: () => {
            addTerminalSession('powershell')
          }
        },
        {
          label: 'Clear Terminal Output',
          shortcut: 'Ctrl+K',
          onClick: () => {
            if (window.bodhiAPI?.writeTerminal) {
              window.bodhiAPI.writeTerminal(activeTerminalId, 'cls\r')
            }
          }
        },
        { label: '', divider: true },
        {
          label: 'Toggle Terminal Panel',
          shortcut: 'Ctrl+`',
          icon: <Terminal size={13} />,
          onClick: () => toggleTerminal()
        }
      ]
    },
    {
      name: 'Help',
      items: [
        {
          label: 'Interactive Walkthrough & Tour',
          shortcut: 'F1',
          icon: <Sparkles size={13} className="text-bodhi-accent" />,
          onClick: () => setWalkthroughOpen(true)
        },
        {
          label: 'Command Palette',
          shortcut: 'Ctrl+Shift+P',
          icon: <Sparkles size={13} />,
          onClick: () => openPalette('commands')
        },
        {
          label: 'Settings & Configurations',
          shortcut: 'Ctrl+,',
          icon: <Settings size={13} />,
          onClick: () => openSettingsWindow()
        },
        { label: '', divider: true },
        {
          label: 'About BODHI',
          icon: <HelpCircle size={13} />,
          onClick: () => setAboutModalOpen(true)
        },
        {
          label: 'Terms & Conditions (BUIMB Research)',
          icon: <ShieldCheck size={13} />,
          onClick: () => setTermsModalOpen(true)
        }
      ]
    }
  ]

  return (
    <div ref={menuBarRef} className="flex items-center gap-1 select-none">
      {menus.map((menu) => {
        const isOpen = activeMenu === menu.name
        return (
          <div key={menu.name} className="relative">
            {/* Top Menu Trigger Button */}
            <button
              onClick={() => handleMenuClick(menu.name)}
              onMouseEnter={() => handleMenuMouseEnter(menu.name)}
              className={`px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
                isOpen
                  ? 'bg-bodhi-surface text-bodhi-accent font-semibold shadow-sm'
                  : 'text-bodhi-muted hover:text-BODHI-text hover:bg-bodhi-surface/70'
              }`}
            >
              {menu.name}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-[220px] bg-bodhi-panel border border-BODHI-border rounded-lg shadow-2xl py-1 z-50 animate-fade-in backdrop-blur-md">
                {menu.items.map((item, idx) => {
                  if (item.divider) {
                    return <div key={`div-${idx}`} className="h-[1px] bg-BODHI-border my-1 mx-2" />
                  }

                  return (
                    <button
                      key={item.label}
                      disabled={item.disabled}
                      onClick={() => executeAction(item.onClick)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-left transition-colors ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed text-bodhi-muted'
                          : 'text-BODHI-text hover:bg-bodhi-surface hover:text-white group'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 flex items-center justify-center shrink-0 ${
                            item.disabled
                              ? 'text-bodhi-muted'
                              : 'text-bodhi-muted group-hover:text-bodhi-accent transition-colors'
                          }`}
                        >
                          {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-bodhi-muted/30" />}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.shortcut && (
                        <span className="text-[11px] font-mono text-bodhi-muted group-hover:text-bodhi-muted/90 pl-3">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

