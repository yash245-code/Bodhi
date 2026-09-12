import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Search,
  Terminal,
  FileCode,
  FileJson,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  CornerDownLeft,
  ArrowUpDown,
  X,
  Palette,
  Sparkles,
  Check,
  FolderGit2,
  Clock,
  Type
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useGitStore } from '../../store/useGitStore'
import { THEMES, ACCENT_COLORS } from '../../theme/themeRegistry'
import { FONT_THEMES } from '../../theme/fontRegistry'
import {
  flattenFileTree,
  fuzzyMatch,
  EditorCommand,
  FlatFileItem
} from '../../utils/commandRegistry'

function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode size={15} className="text-bodhi-accent shrink-0" />
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode size={15} className="text-amber-400 shrink-0" />
    case 'json':
      return <FileJson size={15} className="text-yellow-400 shrink-0" />
    case 'html':
    case 'htm':
    case 'css':
    case 'scss':
      return <FileCode size={15} className="text-cyan-400 shrink-0" />
    case 'md':
    case 'markdown':
    case 'txt':
      return <FileText size={15} className="text-emerald-400 shrink-0" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <FileImage size={15} className="text-purple-400 shrink-0" />
    case 'csv':
    case 'sql':
      return <FileSpreadsheet size={15} className="text-emerald-500 shrink-0" />
    default:
      return <File size={15} className="text-bodhi-muted shrink-0" />
  }
}

function HighlightedText({
  text,
  matchedIndices
}: {
  text: string
  matchedIndices: number[]
}): React.ReactElement {
  if (!matchedIndices || matchedIndices.length === 0) {
    return <span>{text}</span>
  }

  const indicesSet = new Set(matchedIndices)
  const elements: React.ReactNode[] = []

  for (let i = 0; i < text.length; i++) {
    if (indicesSet.has(i)) {
      elements.push(
        <span key={i} className="text-bodhi-accent font-bold underline decoration-bodhi-accent/40">
          {text[i]}
        </span>
      )
    } else {
      elements.push(<span key={i}>{text[i]}</span>)
    }
  }

  return <>{elements}</>
}

export const CommandPalette: React.FC = () => {
  const {
    isPaletteOpen,
    paletteMode,
    openPalette,
    closePalette,
    openTab,
    toggleTerminal,
    toggleSidebar,
    toggleSidebarView,
    saveActiveTab,
    saveAllTabs,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    activeTabId,
    increaseFontSize,
    decreaseFontSize,
    toggleMinimap,
    toggleWordWrap,
    toggleSidebarPosition,
    openSettingsWindow,
    settings,
    updateSettings,
    toggleChurnHeatmap,
    setWalkthroughOpen,
    setTermsModalOpen
  } = useEditorStore()

  const {
    rootNode,
    rootPath,
    openFolder,
    openFileDirectly,
    refreshTree,
    setCreatingItem,
    recentWorkspaces,
    removeRecentWorkspace
  } = useWorkspaceStore()

  const { refreshGitStatus, stageAll } = useGitStore()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-focus input when opened & initialize query based on mode
  useEffect(() => {
    if (isPaletteOpen) {
      if (paletteMode === 'commands') {
        setQuery('>')
      } else {
        setQuery('')
      }
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isPaletteOpen, paletteMode])

  // Generate flat list of workspace files
  const fileItems = useMemo(() => {
    return flattenFileTree(rootNode, rootPath)
  }, [rootNode, rootPath])

  // Theme list items
  const themeItems = useMemo(() => {
    return Object.values(THEMES).map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      type: theme.type,
      preview: theme.previewColors
    }))
  }, [])

  // Accent list items
  const accentItems = useMemo(() => {
    return ACCENT_COLORS
  }, [])

  // Font Theme list items
  const fontItems = useMemo(() => {
    return Object.values(FONT_THEMES)
  }, [])

  // Build command registry
  const allCommands = useMemo<EditorCommand[]>(() => {
    const list: EditorCommand[] = [
      {
        id: 'help.walkthrough',
        title: 'Help: Open Interactive Walkthrough & Tour',
        category: 'Help',
        shortcut: 'F1',
        action: () => setWalkthroughOpen(true)
      },
      {
        id: 'help.terms',
        title: 'Help: Terms and Conditions & Open Source License (BUIMB Research)',
        category: 'Help',
        action: () => setTermsModalOpen(true)
      },
      {
        id: 'preferences.colorTheme',
        title: 'Preferences: Color Theme',
        category: 'Preferences',
        shortcut: 'Ctrl+K Ctrl+T',
        action: () => openPalette('themes')
      },
      {
        id: 'preferences.accentColor',
        title: 'Preferences: Switch Accent Color',
        category: 'Preferences',
        action: () => openPalette('accents')
      },
      {
        id: 'preferences.fontTheme',
        title: 'Preferences: Switch Editor Font Vibe / Typography...',
        category: 'Preferences',
        shortcut: 'Ctrl+K Ctrl+F',
        action: () => openPalette('fonts')
      },
      {
        id: 'view.sourceControl',
        title: 'View: Show Source Control (Git)',
        category: 'View',
        shortcut: 'Ctrl+Shift+G',
        action: () => toggleSidebarView('git')
      },
      {
        id: 'view.extensions',
        title: 'View: Show Extensions',
        category: 'View',
        shortcut: 'Ctrl+Shift+X',
        action: () => window.bodhiAPI?.openExtensionsWindow?.()
      },
      {
        id: 'view.ai',
        title: 'View: Show AI Assistant',
        category: 'View',
        shortcut: 'Ctrl+Shift+I',
        action: () => toggleSidebarView('ai')
      },
      {
        id: 'extensions.installVsix',
        title: 'Extensions: Install from VSIX...',
        category: 'Extensions',
        action: async () => {
          toggleSidebarView('extensions')
          await window.bodhiAPI?.extensionsInstallFromVsix()
        }
      },
      {
        id: 'git.refresh',
        title: 'Git: Refresh Status',
        category: 'Git',
        action: () => refreshGitStatus()
      },
      {
        id: 'git.stageAll',
        title: 'Git: Stage All Changes',
        category: 'Git',
        action: () => stageAll()
      },
      {
        id: 'git.toggleChurnHeatmap',
        title: 'Git: Toggle Gutter Churn Heatmap',
        category: 'Git',
        action: () => toggleChurnHeatmap()
      },
      {
        id: 'view.toggleTerminal',
        title: 'View: Toggle Integrated Terminal',
        category: 'View',
        shortcut: 'Ctrl+`',
        action: () => toggleTerminal()
      },
      {
        id: 'view.toggleSidebar',
        title: 'View: Toggle File Explorer Sidebar',
        category: 'View',
        shortcut: 'Ctrl+B',
        action: () => toggleSidebar()
      },
      {
        id: 'view.toggleSidebarPosition',
        title: 'View: Toggle Side Bar Position (Left / Right)',
        category: 'View',
        action: () => toggleSidebarPosition()
      },
      {
        id: 'file.openFolder',
        title: 'File: Open Workspace Folder...',
        category: 'File',
        shortcut: 'Ctrl+Shift+O',
        action: () => openFolder()
      },
      {
        id: 'file.openRecent',
        title: 'File: Open Recent Project / Workspace...',
        category: 'File',
        shortcut: 'Ctrl+R',
        action: () => openPalette('recent-workspaces')
      },
      {
        id: 'file.openFile',
        title: 'File: Open File...',
        category: 'File',
        shortcut: 'Ctrl+O',
        action: async () => {
          const filePath = await openFileDirectly()
          if (filePath) await openTab(filePath)
        }
      },
      {
        id: 'file.saveActive',
        title: 'File: Save Active File',
        category: 'File',
        shortcut: 'Ctrl+S',
        action: () => saveActiveTab()
      },
      {
        id: 'file.saveAll',
        title: 'File: Save All Open Files',
        category: 'File',
        shortcut: 'Ctrl+Shift+S',
        action: () => saveAllTabs()
      },
      {
        id: 'file.closeActive',
        title: 'File: Close Active Tab',
        category: 'File',
        shortcut: 'Ctrl+W',
        action: () => {
          if (activeTabId) closeTab(activeTabId)
        }
      },
      {
        id: 'file.closeOther',
        title: 'File: Close Other Tabs',
        category: 'File',
        action: () => {
          if (activeTabId) closeOtherTabs(activeTabId)
        }
      },
      {
        id: 'file.closeAll',
        title: 'File: Close All Tabs',
        category: 'File',
        action: () => closeAllTabs()
      },
      {
        id: 'file.newFile',
        title: 'File: New File in Workspace',
        category: 'File',
        action: () => {
          if (rootPath) setCreatingItem({ parentPath: rootPath, type: 'file' })
          else openFolder()
        }
      },
      {
        id: 'file.refreshTree',
        title: 'File: Refresh Explorer Directory Tree',
        category: 'File',
        action: () => refreshTree()
      },
      {
        id: 'editor.increaseFontSize',
        title: 'Editor: Increase Font Size',
        category: 'Editor',
        action: () => increaseFontSize()
      },
      {
        id: 'editor.decreaseFontSize',
        title: 'Editor: Decrease Font Size',
        category: 'Editor',
        action: () => decreaseFontSize()
      },
      {
        id: 'editor.toggleMinimap',
        title: 'Editor: Toggle Minimap',
        category: 'Editor',
        action: () => toggleMinimap()
      },
      {
        id: 'editor.toggleWordWrap',
        title: 'Editor: Toggle Word Wrap',
        category: 'Editor',
        action: () => toggleWordWrap()
      },
      {
        id: 'preferences.openSettings',
        title: 'Preferences: Open Settings Window',
        category: 'Preferences',
        shortcut: 'Ctrl+,',
        action: () => openSettingsWindow()
      }
    ]

    // Append direct theme switcher commands
    Object.values(THEMES).forEach((t) => {
      list.push({
        id: `theme.${t.id}`,
        title: `Theme: ${t.name}`,
        category: 'Theme',
        action: () => updateSettings({ theme: t.id })
      })
    })

    // Append direct font vibe commands
    Object.values(FONT_THEMES).forEach((f) => {
      list.push({
        id: `font.${f.id}`,
        title: `Font: ${f.name} (${f.vibe})`,
        category: 'Font Theme',
        action: () => updateSettings({ fontTheme: f.id })
      })
    })

    return list
  }, [
    openPalette,
    toggleSidebarView,
    refreshGitStatus,
    stageAll,
    openSettingsWindow,
    toggleTerminal,
    toggleSidebar,
    openFolder,
    openFileDirectly,
    openTab,
    saveActiveTab,
    saveAllTabs,
    activeTabId,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    rootPath,
    setCreatingItem,
    refreshTree,
    increaseFontSize,
    decreaseFontSize,
    toggleMinimap,
    toggleWordWrap,
    updateSettings,
    toggleChurnHeatmap
  ])

  // Determine current active search mode
  const isCommandMode = paletteMode === 'commands' || query.startsWith('>')
  const isThemeMode = paletteMode === 'themes'
  const isAccentMode = paletteMode === 'accents'
  const isFontMode = paletteMode === 'fonts'
  const isRecentWorkspacesMode = paletteMode === 'recent-workspaces'
  const searchFilter = isCommandMode ? query.replace(/^>/, '').trim() : query.trim()

  // Filter and score results
  const filteredFiles = useMemo(() => {
    if (isCommandMode || isThemeMode || isAccentMode || isFontMode || isRecentWorkspacesMode)
      return []
    if (!searchFilter) {
      return fileItems.slice(0, 50).map((file) => ({
        item: file,
        matchedIndices: []
      }))
    }

    const scored: { item: FlatFileItem; score: number; matchedIndices: number[] }[] = []
    for (const file of fileItems) {
      const match = fuzzyMatch(file.relativePath, searchFilter)
      if (match) {
        scored.push({
          item: file,
          score: match.score,
          matchedIndices: match.matchedIndices
        })
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
  }, [
    isCommandMode,
    isThemeMode,
    isAccentMode,
    isFontMode,
    isRecentWorkspacesMode,
    searchFilter,
    fileItems
  ])

  const filteredCommands = useMemo(() => {
    if (!isCommandMode) return []
    if (!searchFilter) {
      return allCommands.map((cmd) => ({
        item: cmd,
        matchedIndices: []
      }))
    }

    const scored: { item: EditorCommand; score: number; matchedIndices: number[] }[] = []
    for (const cmd of allCommands) {
      const match = fuzzyMatch(cmd.title, searchFilter)
      if (match) {
        scored.push({
          item: cmd,
          score: match.score,
          matchedIndices: match.matchedIndices
        })
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
  }, [isCommandMode, searchFilter, allCommands])

  const filteredThemes = useMemo(() => {
    if (!isThemeMode) return []
    if (!searchFilter) return themeItems
    return themeItems.filter(
      (t) =>
        t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.description.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [isThemeMode, searchFilter, themeItems])

  const filteredAccents = useMemo(() => {
    if (!isAccentMode) return []
    if (!searchFilter) return accentItems
    return accentItems.filter((a) =>
      a.name.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [isAccentMode, searchFilter, accentItems])

  const filteredFonts = useMemo(() => {
    if (!isFontMode) return []
    if (!searchFilter) return fontItems
    return fontItems.filter(
      (f) =>
        f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.vibe.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.description.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [isFontMode, searchFilter, fontItems])

  const filteredRecentWorkspaces = useMemo(() => {
    if (!isRecentWorkspacesMode) return []
    if (!searchFilter) return recentWorkspaces
    return recentWorkspaces.filter(
      (r) =>
        r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.path.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [isRecentWorkspacesMode, searchFilter, recentWorkspaces])

  const totalItemsCount = isThemeMode
    ? filteredThemes.length
    : isAccentMode
    ? filteredAccents.length
    : isFontMode
    ? filteredFonts.length
    : isRecentWorkspacesMode
    ? filteredRecentWorkspaces.length
    : isCommandMode
    ? filteredCommands.length
    : filteredFiles.length

  // Ensure selectedIndex stays valid when list changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, paletteMode])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const executeSelected = useCallback(async (): Promise<void> => {
    if (totalItemsCount === 0) return

    if (isThemeMode) {
      const theme = filteredThemes[selectedIndex]
      if (theme) {
        updateSettings({ theme: theme.id })
        closePalette()
      }
    } else if (isAccentMode) {
      const accent = filteredAccents[selectedIndex]
      if (accent) {
        updateSettings({ accentColor: accent.color })
        closePalette()
      }
    } else if (isFontMode) {
      const font = filteredFonts[selectedIndex]
      if (font) {
        updateSettings({ fontTheme: font.id })
        closePalette()
      }
    } else if (isRecentWorkspacesMode) {
      const rec = filteredRecentWorkspaces[selectedIndex]
      if (rec) {
        closePalette()
        await openFolder(rec.path)
      }
    } else if (isCommandMode) {
      const cmd = filteredCommands[selectedIndex]?.item
      if (cmd) {
        closePalette()
        await cmd.action()
      }
    } else {
      const file = filteredFiles[selectedIndex]?.item
      if (file) {
        closePalette()
        await openTab(file.path)
      }
    }
  }, [
    totalItemsCount,
    isThemeMode,
    isAccentMode,
    isFontMode,
    isRecentWorkspacesMode,
    isCommandMode,
    filteredThemes,
    filteredAccents,
    filteredFonts,
    filteredRecentWorkspaces,
    filteredCommands,
    filteredFiles,
    selectedIndex,
    updateSettings,
    closePalette,
    openFolder,
    openTab
  ])

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (totalItemsCount > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalItemsCount)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (totalItemsCount > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalItemsCount) % totalItemsCount)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeSelected()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
    }
  }

  if (!isPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm select-none"
      onClick={closePalette}
    >
      <div
        className="w-full max-w-xl bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl overflow-hidden flex flex-col tab-active-glow animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-bodhi-surface/70 border-b border-BODHI-border">
          {isThemeMode ? (
            <Palette size={17} className="text-bodhi-accent shrink-0" />
          ) : isAccentMode ? (
            <Sparkles size={17} className="text-bodhi-accent shrink-0" />
          ) : isFontMode ? (
            <Type size={17} className="text-bodhi-accent shrink-0" />
          ) : isRecentWorkspacesMode ? (
            <FolderGit2 size={17} className="text-bodhi-accent shrink-0" />
          ) : isCommandMode ? (
            <Terminal size={17} className="text-bodhi-accent shrink-0 animate-pulse" />
          ) : (
            <Search size={17} className="text-bodhi-accent shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isThemeMode
                ? 'Select Color Theme...'
                : isAccentMode
                ? 'Select Accent Color...'
                : isFontMode
                ? 'Select Editor Font Vibe / Typography...'
                : isRecentWorkspacesMode
                ? 'Open Recent Project / Workspace (Ctrl+R)...'
                : isCommandMode
                ? 'Type a command to run...'
                : 'Type the name of a file to open (type > for commands)...'
            }
            className="flex-1 bg-transparent text-sm text-BODHI-text placeholder:text-bodhi-muted outline-none font-sans"
          />

          <button
            onClick={closePalette}
            className="p-1 text-bodhi-muted hover:text-white rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-1.5 flex flex-col gap-0.5 no-scrollbar"
        >
          {totalItemsCount === 0 ? (
            <div className="py-8 text-center text-xs text-bodhi-muted italic">
              {isThemeMode
                ? 'No matching themes found'
                : isAccentMode
                ? 'No matching accents found'
                : isFontMode
                ? 'No matching font themes found'
                : isRecentWorkspacesMode
                ? 'No recent projects recorded yet'
                : isCommandMode
                ? 'No matching commands found'
                : 'No matching files found in workspace'}
            </div>
          ) : isFontMode ? (
            filteredFonts.map((font, idx) => {
              const isActive = idx === selectedIndex
              const isCurrent = (settings.fontTheme || 'fira-code') === font.id
              return (
                <div
                  key={font.id}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex flex-col gap-1 px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{font.name}</span>
                      <span className="text-[11px] text-bodhi-muted font-normal">
                        {font.vibe}
                      </span>
                      {font.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-bodhi-panel text-bodhi-accent border border-BODHI-border font-mono font-medium">
                          {font.badge}
                        </span>
                      )}
                    </div>
                    {isCurrent && <Check size={14} className="text-bodhi-accent shrink-0" />}
                  </div>

                  <div className="text-[11px] text-bodhi-muted">{font.description}</div>

                  <div
                    style={{ fontFamily: font.fontFamily }}
                    className="mt-1 px-2.5 py-1.5 rounded bg-bodhi-bg border border-BODHI-border/70 text-[11px] text-emerald-400 font-mono overflow-hidden truncate"
                  >
                    {font.sampleCode}
                  </div>
                </div>
              )
            })
          ) : isRecentWorkspacesMode ? (
            filteredRecentWorkspaces.map((rec, idx) => {
              const isActive = idx === selectedIndex
              const isCurrent = rootPath?.toLowerCase() === rec.path.toLowerCase()
              return (
                <div
                  key={rec.path}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderGit2
                      size={15}
                      className={isActive ? 'text-bodhi-accent' : 'text-bodhi-muted'}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold flex items-center gap-1.5 truncate">
                        <span>{rec.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-bodhi-accent/20 text-bodhi-accent font-mono border border-bodhi-accent/30">
                            active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-bodhi-muted font-mono truncate max-w-md">
                        {rec.path}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-bodhi-muted flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(rec.lastOpened).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentWorkspace(rec.path)
                      }}
                      title="Remove from recent list"
                      className="p-1 text-bodhi-muted hover:text-red-400 hover:bg-bodhi-bg rounded transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )
            })
          ) : isThemeMode ? (
            filteredThemes.map((theme, idx) => {
              const isActive = idx === selectedIndex
              const isCurrent = settings.theme === theme.id
              return (
                <div
                  key={theme.id}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 p-1 rounded bg-bodhi-bg border border-BODHI-border">
                      <span
                        style={{ backgroundColor: theme.preview.bg }}
                        className="w-3 h-3 rounded-full border border-BODHI-border"
                      />
                      <span
                        style={{ backgroundColor: theme.preview.accent }}
                        className="w-3 h-3 rounded-full shadow"
                      />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{theme.name}</span>
                        {isCurrent && <Check size={12} className="text-bodhi-accent" />}
                      </div>
                      <div className="text-[11px] text-bodhi-muted">{theme.description}</div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-bodhi-panel text-bodhi-muted border border-BODHI-border">
                    {theme.type}
                  </span>
                </div>
              )
            })
          ) : isAccentMode ? (
            filteredAccents.map((accent, idx) => {
              const isActive = idx === selectedIndex
              const isCurrent = settings.accentColor === accent.color
              return (
                <div
                  key={accent.id}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: accent.color }}
                      className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                    />
                    <span className="font-semibold">{accent.name}</span>
                    {isCurrent && <Check size={12} className="text-bodhi-accent" />}
                  </div>
                  <span className="font-mono text-[10px] text-bodhi-muted">{accent.color}</span>
                </div>
              )
            })
          ) : isCommandMode ? (
            filteredCommands.map((itemObj, idx) => {
              const isActive = idx === selectedIndex
              return (
                <div
                  key={itemObj.item.id}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-BODHI-border text-bodhi-muted">
                      {itemObj.item.category}
                    </span>
                    <span className="truncate">
                      <HighlightedText
                        text={itemObj.item.title}
                        matchedIndices={itemObj.matchedIndices}
                      />
                    </span>
                  </div>

                  {itemObj.item.shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded bg-bodhi-panel text-[10px] font-mono text-bodhi-accent border border-BODHI-border shrink-0 ml-2">
                      {itemObj.item.shortcut}
                    </kbd>
                  )}
                </div>
              )
            })
          ) : (
            filteredFiles.map((fileObj, idx) => {
              const isActive = idx === selectedIndex
              return (
                <div
                  key={fileObj.item.path}
                  data-active={isActive}
                  onClick={() => {
                    setSelectedIndex(idx)
                    executeSelected()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border-l-2 ${
                    isActive
                      ? 'bg-bodhi-surface text-white border-bodhi-accent font-medium shadow-sm'
                      : 'text-BODHI-text border-transparent hover:bg-bodhi-surface/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getFileIcon(fileObj.item.name)}
                    <span className="truncate font-medium">
                      <HighlightedText
                        text={fileObj.item.name}
                        matchedIndices={fileObj.matchedIndices
                          .filter(
                            (i) => i >= fileObj.item.relativePath.length - fileObj.item.name.length
                          )
                          .map(
                            (i) =>
                              i - (fileObj.item.relativePath.length - fileObj.item.name.length)
                          )}
                      />
                    </span>
                  </div>

                  <span className="text-[11px] text-bodhi-muted truncate max-w-[200px] ml-2 font-mono">
                    {fileObj.item.relativePath}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3.5 py-2 bg-bodhi-bg border-t border-BODHI-border flex items-center justify-between text-[11px] text-bodhi-muted select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUpDown size={11} className="text-bodhi-accent" />
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft size={11} className="text-bodhi-accent" />
              Select
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCommandMode &&
              !isThemeMode &&
              !isAccentMode &&
              !isFontMode &&
              !isRecentWorkspacesMode && (
                <span className="text-bodhi-muted">
                  Type <kbd className="px-1 py-0.2 rounded bg-bodhi-surface text-bodhi-accent border border-BODHI-border font-mono">&gt;</kbd> for commands
                </span>
              )}
            <span className="text-[10px]">
              {totalItemsCount}{' '}
              {isThemeMode
                ? 'themes'
                : isAccentMode
                ? 'accents'
                : isFontMode
                ? 'font vibes'
                : isRecentWorkspacesMode
                ? 'recent projects'
                : isCommandMode
                ? 'commands'
                : 'files'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

