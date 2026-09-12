import React, { useState, useEffect, useMemo } from 'react'
import {
  Sliders,
  Eye,
  AlignLeft,
  Save,
  Terminal,
  Palette,
  Sparkles,
  Keyboard,
  Minus,
  X,
  Search,
  RotateCcw,
  Check,
  Code2,
  Lock,
  ChevronRight,
  PanelLeft,
  PanelRight,
  Layout,
  Type,
  RefreshCw,
  AlertCircle,
  Flame,
  Database,
  Server,
  CheckCircle2
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useDatabaseStore } from '../../store/useDatabaseStore'
import { EditorSettings, ShellType } from '@shared/types'
import { THEMES, ACCENT_COLORS, getAccentsForTheme } from '../../theme/themeRegistry'
import { FONT_THEMES } from '../../theme/fontRegistry'

type SettingsCategory =
  | 'editor'
  | 'appearance'
  | 'terminal'
  | 'files'
  | 'ai'
  | 'database'
  | 'shortcuts'

export const SettingsWindow: React.FC = () => {
  const { settings, updateSettings, initSettingsSync } = useEditorStore()
  const {
    status: dbStatus,
    isTesting: isDbTesting,
    isConnecting: isDbConnecting,
    isSyncing: isDbSyncing,
    testResult: dbTestResult,
    testConnection: testDbConnection,
    connect: connectDb,
    disconnect: disconnectDb,
    syncSettingsNow,
    initDb
  } = useDatabaseStore()

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('editor')
  const [searchQuery, setSearchQuery] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [isTestingAiKey, setIsTestingAiKey] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbUrlInput, setDbUrlInput] = useState('')

  // Listen to cross-window sync and set window title
  useEffect(() => {
    document.title = 'Settings - Bodhi'
    initDb()
    const unsub = initSettingsSync()
    return () => {
      unsub()
    }
  }, [initSettingsSync, initDb])

  const handleMinimize = (): void => {
    window.bodhiAPI?.minimizeWindow?.()
  }

  const handleClose = (): void => {
    window.bodhiAPI?.closeWindow?.()
  }

  const handleSettingChange = (partial: Partial<EditorSettings>): void => {
    updateSettings(partial)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1200)
    setAiTestResult(null)
  }

  const handleTestAiKey = async (): Promise<void> => {
    if (!settings.aiApiKey?.trim()) return
    setIsTestingAiKey(true)
    setAiTestResult(null)
    try {
      const res = await window.bodhiAPI?.aiTestConnection?.(
        settings.aiModelProvider,
        settings.aiApiKey
      )
      setAiTestResult(res || { success: false, message: 'No response from AI service.' })
    } catch (err: any) {
      setAiTestResult({ success: false, message: err.message || 'Test failed' })
    } finally {
      setIsTestingAiKey(false)
    }
  }

  const resetDefaults = (): void => {
    const defaults: EditorSettings = {
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
      tabSize: 2,
      wordWrap: 'on',
      minimap: true,
      theme: 'vs-dark',
      sidebarPosition: 'left',
      autoSave: true,
      autoSaveDelay: 5000,
      lineHeight: 22,
      cursorBlinking: 'smooth',
      cursorStyle: 'line',
      bracketPairColorization: true,
      formatOnSave: true,
      terminalFontSize: 13,
      terminalFontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      terminalCursorStyle: 'block',
      terminalDefaultShell: 'powershell',
      aiModelProvider: 'google-gemini',
      aiApiKey: '',
      aiTemperature: 0.7,
      aiMaxTokens: 4096,
      enableChurnHeatmap: true
    }
    updateSettings(defaults)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  const categories = [
    { id: 'editor', label: 'Editor', icon: <Code2 size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={16} /> },
    { id: 'files', label: 'Files & Save', icon: <Save size={16} /> },
    { id: 'ai', label: 'AI & Intelligence', icon: <Sparkles size={16} /> },
    { id: 'database', label: 'Cloud & Database', icon: <Database size={16} /> },
    { id: 'shortcuts', label: 'Keybindings', icon: <Keyboard size={16} /> }
  ] as const

  const shortcutsList = [
    { label: 'Command Palette / Quick Open', keys: ['Ctrl', 'P'] },
    { label: 'Commands Mode', keys: ['Ctrl', 'Shift', 'P'] },
    { label: 'Open Settings Window', keys: ['Ctrl', ','] },
    { label: 'Save Current File', keys: ['Ctrl', 'S'] },
    { label: 'Save All Files', keys: ['Ctrl', 'Shift', 'S'] },
    { label: 'Toggle Sidebar', keys: ['Ctrl', 'B'] },
    { label: 'Toggle Integrated Terminal', keys: ['Ctrl', '`'] },
    { label: 'Global Search in Workspace', keys: ['Ctrl', 'Shift', 'F'] },
    { label: 'Split Editor Panes', keys: ['Ctrl', '\\'] },
    { label: 'Zoom In / Out', keys: ['Ctrl', '+ / -'] },
    { label: 'Reset Zoom Level', keys: ['Ctrl', '0'] },
    { label: 'Close Active Tab', keys: ['Ctrl', 'W'] }
  ]

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return shortcutsList
    const q = searchQuery.toLowerCase()
    return shortcutsList.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keys.some((k) => k.toLowerCase().includes(q))
    )
  }, [searchQuery])

  return (
    <div className="h-screen w-screen flex flex-col bg-cortex-bg text-cortex-text select-none overflow-hidden font-sans border border-cortex-border/60">
      {/* Frameless Draggable TitleBar */}
      <header
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="h-10 bg-cortex-sidebar border-b border-cortex-border flex items-center justify-between px-3 shrink-0 select-none z-30"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-cortex-accent/20 border border-cortex-accent/50 flex items-center justify-center text-cortex-accent shadow-[0_0_8px_var(--cortex-accent-glow)]">
            <Sliders size={12} />
          </div>
          <span className="text-xs font-semibold tracking-wide text-cortex-text">
            Bodhi Settings
          </span>
          <span className="text-[10px] text-cortex-muted bg-cortex-surface px-1.5 py-0.5 rounded font-mono">
            v1.0
          </span>
        </div>

        {/* Search & Actions */}
        <div
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center gap-3"
        >
          {justSaved && (
            <div className="flex items-center gap-1 text-[11px] text-cortex-accent font-medium animate-fade-in">
              <Check size={12} />
              <span>Synced</span>
            </div>
          )}

          {/* Window controls */}
          <div className="flex items-center">
            <button
              onClick={handleMinimize}
              title="Minimize"
              className="w-8 h-8 flex items-center justify-center text-cortex-muted hover:text-white hover:bg-cortex-surface rounded transition-colors"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleClose}
              title="Close Settings"
              className="w-8 h-8 flex items-center justify-center text-cortex-muted hover:text-white hover:bg-red-600 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Settings Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-48 bg-cortex-sidebar border-r border-cortex-border flex flex-col p-2 gap-1 shrink-0">
          <div className="relative mb-2 px-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cortex-muted"
            />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cortex-panel text-xs text-cortex-text pl-7 pr-2 py-1.5 rounded border border-cortex-border focus:border-cortex-accent focus:outline-none placeholder:text-cortex-muted"
            />
          </div>

          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as SettingsCategory)
                    setSearchQuery('')
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cortex-accent/15 text-cortex-accent border border-cortex-accent/30 shadow-sm font-semibold'
                      : 'text-cortex-muted hover:text-white hover:bg-cortex-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-cortex-accent' : 'text-cortex-muted'}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </div>
                  {isActive && <ChevronRight size={12} className="text-cortex-accent" />}
                </button>
              )
            })}
          </div>

          {/* Reset button at bottom of sidebar */}
          <div className="pt-2 border-t border-cortex-border">
            <button
              onClick={resetDefaults}
              title="Reset all settings to default values"
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[11px] text-cortex-muted hover:text-white hover:bg-cortex-surface border border-transparent hover:border-cortex-border transition-colors"
            >
              <RotateCcw size={11} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </aside>

        {/* Right Settings Content */}
        <main className="flex-1 bg-cortex-bg overflow-y-auto p-5 text-xs space-y-6">
          {searchQuery ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-cortex-text flex items-center gap-2 pb-2 border-b border-cortex-border">
                <Search size={14} className="text-cortex-accent" />
                <span>Search Results for "{searchQuery}"</span>
              </h2>

              {/* Matching Settings */}
              {(searchQuery.toLowerCase().includes('side') ||
                searchQuery.toLowerCase().includes('bar') ||
                searchQuery.toLowerCase().includes('pos') ||
                searchQuery.toLowerCase().includes('left') ||
                searchQuery.toLowerCase().includes('right') ||
                searchQuery.toLowerCase().includes('layout')) && (
                <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                        <Layout size={14} className="text-cortex-accent" />
                        <span>Side Bar Location</span>
                      </div>
                      <div className="text-[11px] text-cortex-muted mt-0.5">
                        Controls whether the primary side bar (Explorer, Search, Git) appears on the left or right.
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border text-cortex-accent font-semibold uppercase">
                      {settings.sidebarPosition || 'left'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSettingChange({ sidebarPosition: 'left' })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                        (settings.sidebarPosition || 'left') === 'left'
                          ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(93,214,44,0.2))]'
                          : 'border-cortex-border bg-cortex-surface/40 hover:border-cortex-muted hover:bg-cortex-surface'
                      }`}
                    >
                      <PanelLeft size={13} className="text-cortex-accent" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs text-cortex-text">Left Side</span>
                        <div className="text-[10px] text-cortex-muted">Standard default layout</div>
                      </div>
                      {(settings.sidebarPosition || 'left') === 'left' && (
                        <Check size={13} className="text-cortex-accent font-bold" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingChange({ sidebarPosition: 'right' })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                        settings.sidebarPosition === 'right'
                          ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(93,214,44,0.2))]'
                          : 'border-cortex-border bg-cortex-surface/40 hover:border-cortex-muted hover:bg-cortex-surface'
                      }`}
                    >
                      <PanelRight size={13} className="text-cortex-accent" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs text-cortex-text">Right Side</span>
                        <div className="text-[10px] text-cortex-muted">Docked to right edge</div>
                      </div>
                      {settings.sidebarPosition === 'right' && (
                        <Check size={13} className="text-cortex-accent font-bold" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Filtered shortcuts */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cortex-muted">
                  Matching Keybindings
                </span>
                <div className="space-y-1.5">
                  {filteredShortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-cortex-panel border border-cortex-border"
                    >
                      <span className="text-cortex-text">{sc.label}</span>
                      <div className="flex items-center gap-1">
                        {sc.keys.map((k, kidx) => (
                          <kbd
                            key={kidx}
                            className="px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border font-mono text-[11px] text-cortex-accent shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category: EDITOR */}
              {activeCategory === 'editor' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">Editor Settings</h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      Customizes font, formatting & Monaco behavior
                    </span>
                  </div>

                  {/* Font Size */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-cortex-text">Font Size</div>
                        <div className="text-[11px] text-cortex-muted">
                          Controls the font size in pixels for all open editor buffers.
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-cortex-surface text-cortex-accent font-mono font-bold text-xs border border-cortex-border">
                        {settings.fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-cortex-muted">10px</span>
                      <input
                        type="range"
                        min="10"
                        max="32"
                        value={settings.fontSize}
                        onChange={(e) =>
                          handleSettingChange({ fontSize: Number(e.target.value) })
                        }
                        style={{ accentColor: settings.accentColor || 'var(--bodhi-accent, #5DD62C)' }}
                        className="flex-1 cursor-pointer"
                      />
                      <span className="text-[10px] text-cortex-muted">32px</span>
                    </div>
                  </div>

                  {/* Editor Font Themes & Vibes */}
                  <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                          <Type size={14} className="text-cortex-accent" />
                          <span>Editor Font Theme & Vibe</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-0.5">
                          Curated typography themes with distinct personalities (applies strictly to the code editor area).
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border text-cortex-accent font-semibold uppercase">
                        {settings.fontTheme || 'fira-code'}
                      </span>
                    </div>

                    {/* Font Theme Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {Object.values(FONT_THEMES).map((font) => {
                        const isCurrent = (settings.fontTheme || 'fira-code') === font.id
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => handleSettingChange({ fontTheme: font.id })}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-1.5 text-left ${
                              isCurrent
                                ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(93,214,44,0.2))]'
                                : 'border-cortex-border bg-cortex-surface/40 hover:border-cortex-muted hover:bg-cortex-surface'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-cortex-text">
                                  {font.name}
                                </span>
                                {font.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cortex-panel text-cortex-accent border border-cortex-border font-mono font-medium">
                                    {font.badge}
                                  </span>
                                )}
                              </div>
                              {isCurrent && (
                                <Check size={13} className="text-cortex-accent font-bold shrink-0" />
                              )}
                            </div>

                            <div className="text-[10px] text-cortex-muted">{font.vibe}</div>

                            <div
                              style={{ fontFamily: font.fontFamily }}
                              className="mt-1 px-2 py-1 rounded bg-cortex-bg border border-cortex-border/70 text-[10px] text-emerald-400 font-mono overflow-hidden truncate w-full"
                            >
                              {font.sampleCode}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Custom Font Family Override (when custom selected) */}
                    {settings.fontTheme === 'custom' && (
                      <div className="pt-2 border-t border-cortex-border space-y-1.5">
                        <div className="font-medium text-xs text-cortex-text">Custom Font Family Chain</div>
                        <input
                          type="text"
                          value={settings.fontFamily}
                          onChange={(e) => handleSettingChange({ fontFamily: e.target.value })}
                          placeholder="e.g. 'Fira Code', Consolas, monospace"
                          className="w-full bg-cortex-surface text-xs font-mono text-cortex-text px-3 py-1.5 rounded border border-cortex-border focus:border-cortex-accent focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Font Ligatures Toggle */}
                    <div className="pt-2 border-t border-cortex-border flex items-center justify-between">
                      <div>
                        <div className="font-medium text-xs text-cortex-text">Programming Ligatures</div>
                        <div className="text-[10px] text-cortex-muted">
                          Renders special multi-character symbol ligatures like <code className="text-cortex-accent font-mono">=&gt;</code>, <code className="text-cortex-accent font-mono">!==</code>, <code className="text-cortex-accent font-mono">&lt;!--</code>.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleSettingChange({ fontLigatures: !(settings.fontLigatures !== false) })
                        }
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          settings.fontLigatures !== false
                            ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 shadow-sm'
                            : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                        }`}
                      >
                        {settings.fontLigatures !== false ? 'Ligatures: ON' : 'Ligatures: OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Tab Size */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cortex-text">Tab Indentation</div>
                      <div className="text-[11px] text-cortex-muted">
                        Number of spaces per indentation level.
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cortex-surface p-1 rounded-md border border-cortex-border">
                      {[2, 4, 8].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSettingChange({ tabSize: size })}
                          className={`px-3 py-1 rounded text-xs transition-all ${
                            settings.tabSize === size
                              ? 'bg-cortex-accent text-black font-bold shadow-sm'
                              : 'text-cortex-muted hover:text-white'
                          }`}
                        >
                          {size} spaces
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minimap & Word Wrap Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Minimap */}
                    <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-cortex-text">
                          <Eye size={14} className="text-cortex-muted" />
                          <span>Editor Minimap</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-1">
                          Shows an overview scrollbar map on the right.
                        </div>
                      </div>
                      <button
                        onClick={() => handleSettingChange({ minimap: !settings.minimap })}
                        className={`w-full py-1.5 rounded text-xs font-semibold transition-all ${
                          settings.minimap
                            ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 shadow-sm'
                            : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                        }`}
                      >
                        {settings.minimap ? 'Minimap: Enabled' : 'Minimap: Disabled'}
                      </button>
                    </div>

                    {/* Word Wrap */}
                    <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-cortex-text">
                          <AlignLeft size={14} className="text-cortex-muted" />
                          <span>Word Wrap</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-1">
                          Wraps long lines exceeding viewport width.
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleSettingChange({
                            wordWrap: settings.wordWrap === 'on' ? 'off' : 'on'
                          })
                        }
                        className={`w-full py-1.5 rounded text-xs font-semibold transition-all ${
                          settings.wordWrap === 'on'
                            ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 shadow-sm'
                            : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                        }`}
                      >
                        {settings.wordWrap === 'on' ? 'Wrap: On' : 'Wrap: Off'}
                      </button>
                    </div>

                    {/* Git Gutter Churn Heatmap */}
                    <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border flex flex-col justify-between gap-3 col-span-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-cortex-text">
                            <Flame size={14} className="text-amber-400" />
                            <span>Git Gutter Churn Heatmap</span>
                          </div>
                          <div className="text-[11px] text-cortex-muted mt-1">
                            Projects commit recency, historical line churn, and blame insights directly into the editor gutter and minimap overview ruler.
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleSettingChange({
                              enableChurnHeatmap: settings.enableChurnHeatmap === false ? true : false
                            })
                          }
                          className={`px-4 py-1.5 rounded text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            settings.enableChurnHeatmap !== false
                              ? 'bg-cortex-accent/20 text-cortex-accent border border-cortex-accent/40 shadow-sm'
                              : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                          }`}
                        >
                          {settings.enableChurnHeatmap !== false ? 'Heatmap: Enabled' : 'Heatmap: Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Mini Preview Box */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-cortex-muted">
                      <span>Live Preview</span>
                      <span className="font-mono">preview.ts</span>
                    </div>
                    <div
                      style={{
                        fontFamily: settings.fontFamily,
                        fontSize: `${settings.fontSize}px`
                      }}
                      className="p-3 bg-[#0F0F0F] rounded border border-cortex-border font-mono text-cortex-text overflow-x-auto leading-relaxed"
                    >
                      <span className="text-cortex-accent">const</span>{' '}
                      <span className="text-[#F8F8F8]">cortex</span> = {'{\n'}
                      {'  '}status: <span className="text-[#A3E635]">'ultra-fast'</span>,{'\n'}
                      {'  '}tabSize: <span className="text-[#86EFAC]">{settings.tabSize}</span>
                      {'\n}'}
                    </div>
                  </div>
                </div>
              )}

              {/* Category: APPEARANCE */}
              {activeCategory === 'appearance' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        Appearance & Theme Suite
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      Customizable color themes, typography & dynamic accent highlights
                    </span>
                  </div>

                  {/* Accent Color Customizer */}
                  <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                          <Sparkles size={14} className="text-cortex-accent" />
                          <span>Accent Color Customizer</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-0.5">
                          Highlights cursor, active lines, badges, buttons, and status indicators.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: settings.accentColor || '#5DD62C' }}
                          className="w-4 h-4 rounded-full border border-white/20 shadow"
                        />
                        <span className="font-mono text-xs text-cortex-accent font-semibold">
                          {settings.accentColor || '#5DD62C'}
                        </span>
                      </div>
                    </div>

                    {/* Curated Theme Accents (at least 5 per theme) */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold text-cortex-text flex items-center justify-between">
                        <span>
                          Curated for {THEMES[settings.theme || 'cortex-cyber']?.name || 'Current Theme'} ({getAccentsForTheme(settings.theme).length} Accents)
                        </span>
                        <span className="text-cortex-muted font-normal text-[9px]">Recommended</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {getAccentsForTheme(settings.theme).map((acc) => {
                          const isSelected = (settings.accentColor || '#5DD62C').toLowerCase() === acc.color.toLowerCase()
                          return (
                            <button
                              key={acc.id}
                              onClick={() => handleSettingChange({ accentColor: acc.color })}
                              title={`${acc.name} (${acc.color})`}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-cortex-surface border-cortex-accent shadow-md scale-105'
                                  : 'bg-cortex-surface/40 border-cortex-border hover:border-cortex-muted hover:bg-cortex-surface'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: acc.color }}
                                className="w-5 h-5 rounded-full shadow border border-white/20 flex items-center justify-center text-black"
                              >
                                {isSelected && <Check size={10} strokeWidth={3} className="text-black drop-shadow-sm" />}
                              </span>
                              <span className="text-[10px] font-medium text-cortex-muted truncate max-w-[65px]">
                                {acc.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* All Global Accent Colors */}
                    <div className="space-y-1.5 pt-2 border-t border-cortex-border">
                      <div className="text-[10px] font-semibold text-cortex-muted">
                        All Global Accents
                      </div>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                        {ACCENT_COLORS.map((acc) => {
                          const isSelected = (settings.accentColor || '#5DD62C').toLowerCase() === acc.color.toLowerCase()
                          return (
                            <button
                              key={acc.id}
                              onClick={() => handleSettingChange({ accentColor: acc.color })}
                              title={`${acc.name} (${acc.color})`}
                              className={`flex flex-col items-center gap-1 p-1.5 rounded-md border transition-all ${
                                isSelected
                                  ? 'bg-cortex-surface border-cortex-accent shadow-sm'
                                  : 'bg-cortex-surface/30 border-cortex-border hover:border-cortex-muted'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: acc.color }}
                                className="w-4 h-4 rounded-full shadow border border-white/20 flex items-center justify-center text-black"
                              >
                                {isSelected && <Check size={8} strokeWidth={3} className="text-black drop-shadow-sm" />}
                              </span>
                              <span className="text-[8px] font-medium text-cortex-muted truncate max-w-[45px]">
                                {acc.name.split(' ')[0]}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Theme Suite Gallery */}
                  <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                          <Palette size={14} className="text-cortex-accent" />
                          <span>Editor & UI Theme Palette</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-0.5">
                          Synchronizes Monaco editor tokens, TitleBar, Sidebar, and Panels.
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border text-cortex-muted">
                        {Object.keys(THEMES).length} themes available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {Object.values(THEMES).map((theme) => {
                        const isSelected = (settings.theme || 'cortex-cyber') === theme.id
                        return (
                          <div
                            key={theme.id}
                            onClick={() => handleSettingChange({ theme: theme.id })}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(142,182,155,0.2))]'
                                : 'border-cortex-border bg-cortex-surface/50 hover:border-cortex-muted hover:bg-cortex-surface'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                                  <span>{theme.name}</span>
                                  {isSelected && (
                                    <Check size={13} className="text-cortex-accent font-bold" />
                                  )}
                                </div>
                                <div className="text-[10px] text-cortex-muted mt-0.5 line-clamp-2">
                                  {theme.description}
                                </div>
                              </div>

                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cortex-panel text-cortex-muted border border-cortex-border shrink-0">
                                {theme.type}
                              </span>
                            </div>

                            {/* Color Palette Swatches & Theme Curated Accents */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-cortex-bg/80 border border-cortex-border">
                                <span
                                  style={{ backgroundColor: theme.previewColors.bg }}
                                  title="Background"
                                  className="w-4 h-4 rounded border border-white/10 shadow-sm"
                                />
                                <span
                                  style={{ backgroundColor: theme.previewColors.sidebar }}
                                  title="Sidebar"
                                  className="w-4 h-4 rounded border border-white/10 shadow-sm"
                                />
                                <span
                                  style={{ backgroundColor: theme.previewColors.panel }}
                                  title="Panel"
                                  className="w-4 h-4 rounded border border-white/10 shadow-sm"
                                />
                                <span
                                  style={{ backgroundColor: theme.previewColors.text }}
                                  title="Text Foreground"
                                  className="w-4 h-4 rounded border border-white/10 shadow-sm"
                                />
                                <span
                                  style={{ backgroundColor: theme.previewColors.accent }}
                                  title="Default Accent"
                                  className="w-4 h-4 rounded shadow-sm ml-auto"
                                />
                              </div>

                              {/* 5+ Curated Accents Preview */}
                              <div className="flex items-center gap-1 px-1">
                                <span className="text-[9px] text-cortex-muted mr-1 font-mono">
                                  {theme.accentOptions.length} accents:
                                </span>
                                {theme.accentOptions.map((acc) => (
                                  <span
                                    key={acc.id}
                                    style={{ backgroundColor: acc.color }}
                                    title={acc.name}
                                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Side Bar Location */}
                  <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                          <Layout size={14} className="text-cortex-accent" />
                          <span>Side Bar Location</span>
                        </div>
                        <div className="text-[11px] text-cortex-muted mt-0.5">
                          Controls whether the primary side bar (Explorer, Search, Git) appears on the left or right.
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border text-cortex-accent font-semibold uppercase">
                        {settings.sidebarPosition || 'left'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Left Option */}
                      <button
                        type="button"
                        onClick={() => handleSettingChange({ sidebarPosition: 'left' })}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                          (settings.sidebarPosition || 'left') === 'left'
                            ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(93,214,44,0.2))]'
                            : 'border-cortex-border bg-cortex-surface/40 hover:border-cortex-muted hover:bg-cortex-surface'
                        }`}
                      >
                        <div className="w-12 h-10 rounded-lg bg-cortex-bg border border-cortex-border flex overflow-hidden shrink-0 shadow-inner">
                          <div className="w-3.5 h-full bg-cortex-accent/40 border-r border-cortex-accent/60 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-cortex-accent" />
                          </div>
                          <div className="flex-1 h-full bg-cortex-sidebar/60 flex flex-col p-1 gap-0.5">
                            <div className="w-full h-1 bg-cortex-border rounded" />
                            <div className="w-2/3 h-1 bg-cortex-border rounded" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                            <PanelLeft size={13} className="text-cortex-accent" />
                            <span>Left Side</span>
                            {(settings.sidebarPosition || 'left') === 'left' && (
                              <Check size={13} className="text-cortex-accent ml-auto font-bold" />
                            )}
                          </div>
                          <div className="text-[10px] text-cortex-muted mt-0.5">
                            Standard default layout (Left)
                          </div>
                        </div>
                      </button>

                      {/* Right Option */}
                      <button
                        type="button"
                        onClick={() => handleSettingChange({ sidebarPosition: 'right' })}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                          settings.sidebarPosition === 'right'
                            ? 'border-cortex-accent bg-cortex-surface shadow-[0_0_16px_var(--cortex-accent-glow,rgba(93,214,44,0.2))]'
                            : 'border-cortex-border bg-cortex-surface/40 hover:border-cortex-muted hover:bg-cortex-surface'
                        }`}
                      >
                        <div className="w-12 h-10 rounded-lg bg-cortex-bg border border-cortex-border flex flex-row-reverse overflow-hidden shrink-0 shadow-inner">
                          <div className="w-3.5 h-full bg-cortex-accent/40 border-l border-cortex-accent/60 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-cortex-accent" />
                          </div>
                          <div className="flex-1 h-full bg-cortex-sidebar/60 flex flex-col p-1 gap-0.5">
                            <div className="w-full h-1 bg-cortex-border rounded" />
                            <div className="w-2/3 h-1 bg-cortex-border rounded" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-cortex-text flex items-center gap-1.5">
                            <PanelRight size={13} className="text-cortex-accent" />
                            <span>Right Side</span>
                            {settings.sidebarPosition === 'right' && (
                              <Check size={13} className="text-cortex-accent ml-auto font-bold" />
                            )}
                          </div>
                          <div className="text-[10px] text-cortex-muted mt-0.5">
                            Docked to the right edge
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* UI Scale / Zoom */}
                  <div className="p-3.5 rounded-xl bg-cortex-panel border border-cortex-border flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-cortex-text">Zoom Controls</div>
                      <div className="text-[11px] text-cortex-muted">
                        Adjust global UI scale factor (`Ctrl++` / `Ctrl+-`).
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => window.bodhiAPI?.zoomOut?.()}
                        className="px-2.5 py-1 rounded bg-cortex-surface hover:bg-cortex-border text-xs text-cortex-text transition-colors"
                      >
                        Zoom -
                      </button>
                      <button
                        onClick={() => window.bodhiAPI?.resetZoom?.()}
                        className="px-2.5 py-1 rounded bg-cortex-surface hover:bg-cortex-border text-xs text-cortex-text transition-colors"
                      >
                        Reset (100%)
                      </button>
                      <button
                        onClick={() => window.bodhiAPI?.zoomIn?.()}
                        className="px-2.5 py-1 rounded bg-cortex-surface hover:bg-cortex-border text-xs text-cortex-text transition-colors"
                      >
                        Zoom +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category: TERMINAL */}
              {activeCategory === 'terminal' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        Integrated Terminal
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      PTY execution and xterm configuration
                    </span>
                  </div>

                  {/* Default Shell */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="font-medium text-cortex-text">Default Shell</div>
                    <div className="text-[11px] text-cortex-muted">
                      The shell executable launched for new terminal sessions.
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {(['powershell', 'cmd', 'bash', 'wsl'] as ShellType[]).map((sh) => (
                        <button
                          key={sh}
                          onClick={() =>
                            handleSettingChange({ terminalDefaultShell: sh })
                          }
                          className={`py-2 px-3 rounded-md text-xs font-mono capitalize transition-all ${
                            (settings.terminalDefaultShell || 'powershell') === sh
                              ? 'bg-cortex-accent text-black font-bold shadow-sm'
                              : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                          }`}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Font Size */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-cortex-text">Terminal Font Size</div>
                        <div className="text-[11px] text-cortex-muted">
                          Controls the render font size inside xterm.js instances.
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-cortex-surface text-cortex-accent font-mono font-bold text-xs border border-cortex-border">
                        {settings.terminalFontSize || 13}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-cortex-muted">10px</span>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={settings.terminalFontSize || 13}
                        onChange={(e) =>
                          handleSettingChange({ terminalFontSize: Number(e.target.value) })
                        }
                        style={{ accentColor: settings.accentColor || 'var(--bodhi-accent, #5DD62C)' }}
                        className="flex-1 cursor-pointer"
                      />
                      <span className="text-[10px] text-cortex-muted">24px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category: FILES & AUTOSAVE */}
              {activeCategory === 'files' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Save size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        Files & Auto Save
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      File persistence, intervals, and formats
                    </span>
                  </div>

                  {/* Auto Save Toggle */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cortex-text">Auto Save</div>
                      <div className="text-[11px] text-cortex-muted">
                        Automatically writes modified dirty tabs to disk at set intervals.
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange({ autoSave: !settings.autoSave })}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                        settings.autoSave
                          ? 'bg-cortex-accent text-black font-bold shadow-sm'
                          : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                      }`}
                    >
                      {settings.autoSave ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Auto Save Delay */}
                  {settings.autoSave && (
                    <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-cortex-text">Auto Save Delay</div>
                          <div className="text-[11px] text-cortex-muted">
                            Delay before dirty tabs are saved to disk.
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-cortex-surface text-cortex-accent font-mono font-bold text-xs border border-cortex-border">
                          {(settings.autoSaveDelay || 5000) / 1000}s
                        </span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-cortex-muted">1s</span>
                        <input
                          type="range"
                          min="1000"
                          max="15000"
                          step="1000"
                          value={settings.autoSaveDelay || 5000}
                          onChange={(e) =>
                            handleSettingChange({ autoSaveDelay: Number(e.target.value) })
                          }
                          style={{ accentColor: settings.accentColor || 'var(--bodhi-accent, #5DD62C)' }}
                          className="flex-1 cursor-pointer"
                        />
                        <span className="text-[10px] text-cortex-muted">15s</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Category: AI & INTELLIGENCE */}
              {activeCategory === 'ai' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        AI & Model Configuration
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      LLM provider and reasoning configurations
                    </span>
                  </div>

                  {/* AI Provider */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="font-medium text-cortex-text">AI Model Provider</div>
                    <div className="text-[11px] text-cortex-muted">
                      Select your preferred LLM provider for inline code generation.
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { id: 'google-gemini', label: 'Google Gemini' },
                        { id: 'openai', label: 'OpenAI GPT-4' },
                        { id: 'anthropic', label: 'Claude 3.5' }
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          onClick={() =>
                            handleSettingChange({ aiModelProvider: prov.id })
                          }
                          className={`py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                            (settings.aiModelProvider || 'google-gemini') === prov.id
                              ? 'bg-cortex-accent text-black font-bold shadow-sm'
                              : 'bg-cortex-surface text-cortex-muted hover:text-white border border-cortex-border'
                          }`}
                        >
                          {prov.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-cortex-text flex items-center gap-1.5">
                        <Lock size={13} className="text-cortex-muted" />
                        <span>API Key</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-[11px] text-cortex-accent hover:underline"
                        >
                          {showApiKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Paste your API key here (saved locally on your machine)"
                        value={settings.aiApiKey || ''}
                        onChange={(e) => handleSettingChange({ aiApiKey: e.target.value })}
                        className="flex-1 bg-cortex-surface text-xs font-mono text-cortex-text px-3 py-1.5 rounded border border-cortex-border focus:border-cortex-accent focus:outline-none"
                      />
                      <button
                        onClick={handleTestAiKey}
                        disabled={isTestingAiKey || !settings.aiApiKey?.trim()}
                        className={`py-1.5 px-3 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                          isTestingAiKey || !settings.aiApiKey?.trim()
                            ? 'bg-cortex-surface text-cortex-muted cursor-not-allowed border border-cortex-border'
                            : 'bg-cortex-accent text-black font-bold hover:brightness-110 active:scale-95'
                        }`}
                      >
                        {isTestingAiKey ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Testing...</span>
                          </>
                        ) : (
                          <span>Test Key</span>
                        )}
                      </button>
                    </div>

                    {/* Key Format Auto-Detection & Provider Mismatch Alert */}
                    {(() => {
                      const k = (settings.aiApiKey || '').trim()
                      if (!k) return null
                      const isSk = (k.startsWith('sk-') || k.startsWith('org-')) && !k.startsWith('sk-ant-')
                      const isAnt = k.startsWith('sk-ant-')
                      const isGemini = k.startsWith('AIzaSy') || k.startsWith('AQ.')
                      const currentProv = settings.aiModelProvider || 'google-gemini'

                      if (isSk && currentProv !== 'openai') {
                        return (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                            <span>G��n+� This looks like an <strong>OpenAI</strong> key (starts with <code className="text-white">sk-</code>), but provider is set to <strong>{currentProv}</strong>.</span>
                            <button
                              onClick={() => handleSettingChange({ aiModelProvider: 'openai' })}
                              className="px-2 py-1 rounded bg-amber-500 text-black font-bold text-[10px] hover:brightness-110 shrink-0"
                            >
                              Switch to OpenAI
                            </button>
                          </div>
                        )
                      }

                      if (isAnt && currentProv !== 'anthropic') {
                        return (
                          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between gap-2">
                            <span>G��n+� This looks like an <strong>Anthropic</strong> key (starts with <code className="text-white">sk-ant-</code>), but provider is set to <strong>{currentProv}</strong>.</span>
                            <button
                              onClick={() => handleSettingChange({ aiModelProvider: 'anthropic' })}
                              className="px-2 py-1 rounded bg-purple-500 text-white font-bold text-[10px] hover:brightness-110 shrink-0"
                            >
                              Switch to Claude
                            </button>
                          </div>
                        )
                      }

                      if (isGemini && currentProv !== 'google-gemini') {
                        return (
                          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between gap-2">
                            <span>G�n+� This looks like a <strong>Google Gemini</strong> key (starts with <code className="text-white">AIzaSy</code>).</span>
                            <button
                              onClick={() => handleSettingChange({ aiModelProvider: 'google-gemini' })}
                              className="px-2 py-1 rounded bg-blue-500 text-white font-bold text-[10px] hover:brightness-110 shrink-0"
                            >
                              Switch to Gemini
                            </button>
                          </div>
                        )
                      }

                      return null
                    })()}

                    {/* Test Key Feedback Result */}
                    {aiTestResult && (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                          aiTestResult.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {aiTestResult.success ? (
                          <Check size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                        ) : (
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                        )}
                        <span className="leading-relaxed">{aiTestResult.message}</span>
                      </div>
                    )}

                    {/* Helpful Provider Key Links */}
                    <div className="text-[11px] text-cortex-muted pt-1">
                      {(settings.aiModelProvider || 'google-gemini') === 'google-gemini' && (
                        <span>
                          Get a free Gemini API key at{' '}
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cortex-accent underline hover:brightness-110"
                          >
                            aistudio.google.com/app/apikey
                          </a>
                        </span>
                      )}
                      {settings.aiModelProvider === 'openai' && (
                        <span>
                          Get an OpenAI API key at{' '}
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cortex-accent underline hover:brightness-110"
                          >
                            platform.openai.com/api-keys
                          </a>
                        </span>
                      )}
                      {settings.aiModelProvider === 'anthropic' && (
                        <span>
                          Get an Anthropic API key at{' '}
                          <a
                            href="https://console.anthropic.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cortex-accent underline hover:brightness-110"
                          >
                            console.anthropic.com
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="p-3.5 rounded-lg bg-cortex-panel border border-cortex-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-cortex-text">Creativity (Temperature)</div>
                        <div className="text-[11px] text-cortex-muted">
                          Lower is more deterministic, higher is more exploratory.
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-cortex-surface text-cortex-accent font-mono font-bold text-xs border border-cortex-border">
                        {settings.aiTemperature ?? 0.7}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-cortex-muted">0.0 (Precise)</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.aiTemperature ?? 0.7}
                        onChange={(e) =>
                          handleSettingChange({ aiTemperature: Number(e.target.value) })
                        }
                        style={{ accentColor: settings.accentColor || 'var(--bodhi-accent, #5DD62C)' }}
                        className="flex-1 cursor-pointer"
                      />
                      <span className="text-[10px] text-cortex-muted">1.0 (Creative)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category: POSTGRESQL & CLOUD DATABASE */}
              {activeCategory === 'database' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        PostgreSQL Database & Cloud Sync
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      Cloud persistence for editor settings, snippets & chat
                    </span>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      dbStatus.connected
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-cortex-panel border-cortex-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          dbStatus.connected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-cortex-surface text-cortex-muted'
                        }`}
                      >
                        <Server size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {dbStatus.connected ? 'Connected to PostgreSQL' : 'Database Offline'}
                          </span>
                          {dbStatus.connected && (
                            <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                              <CheckCircle2 size={10} />
                              Active ({dbStatus.latencyMs}ms)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-cortex-muted mt-0.5">
                          {dbStatus.connected
                            ? `${dbStatus.host} / ${dbStatus.database} — ${dbStatus.serverVersion?.slice(0, 30)}`
                            : 'Connect to PostgreSQL to enable cross-device cloud sync and persistence.'}
                        </p>
                      </div>
                    </div>

                    {dbStatus.connected ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => syncSettingsNow()}
                          disabled={isDbSyncing}
                          className="px-3 py-1.5 rounded-lg bg-cortex-surface hover:bg-cortex-border text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw
                            size={12}
                            className={isDbSyncing ? 'animate-spin text-cortex-accent' : ''}
                          />
                          <span>{isDbSyncing ? 'Syncing...' : 'Sync Now'}</span>
                        </button>
                        <button
                          onClick={() => disconnectDb()}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* Connection String Form */}
                  <div className="p-4 rounded-xl bg-cortex-panel border border-cortex-border space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white flex items-center justify-between">
                        <span>PostgreSQL Connection URI</span>
                        <span className="text-[10px] text-cortex-muted">
                          Encrypted with Electron safeStorage
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="postgresql://user:password@db.example.com:5432/postgres?sslmode=require"
                        value={dbUrlInput}
                        onChange={(e) => setDbUrlInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-cortex-surface border border-cortex-border text-xs text-white placeholder:text-cortex-muted/60 focus:outline-none focus:border-cortex-accent font-mono"
                      />
                    </div>

                    {/* Quick presets */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-cortex-muted">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDbUrlInput('postgresql://postgres:postgres@localhost:5432/bodhi')
                        }
                        className="px-2 py-0.5 rounded bg-cortex-surface hover:bg-cortex-border text-[10px] text-cortex-muted hover:text-white font-mono transition-colors"
                      >
                        Localhost (5432)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDbUrlInput(
                            'postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-cortex-surface hover:bg-cortex-border text-[10px] text-cortex-muted hover:text-white font-mono transition-colors"
                      >
                        Supabase / AWS
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDbUrlInput(
                            'postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-cortex-surface hover:bg-cortex-border text-[10px] text-cortex-muted hover:text-white font-mono transition-colors"
                      >
                        Neon Serverless
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => testDbConnection(dbUrlInput)}
                        disabled={!dbUrlInput.trim() || isDbTesting}
                        className="px-3.5 py-2 rounded-lg bg-cortex-surface hover:bg-cortex-border text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isDbTesting ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>Test Connection</span>
                      </button>

                      <button
                        onClick={() => connectDb(dbUrlInput)}
                        disabled={!dbUrlInput.trim() || isDbConnecting}
                        className="px-4 py-2 rounded-lg bg-cortex-accent text-black text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 shadow-sm"
                      >
                        {isDbConnecting ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Database size={13} />
                        )}
                        <span>Connect & Initialize</span>
                      </button>
                    </div>

                    {/* Test result display */}
                    {dbTestResult && (
                      <div
                        className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                          dbTestResult.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {dbTestResult.success ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <AlertCircle size={15} />
                          )}
                          <span className="truncate">{dbTestResult.message}</span>
                        </div>
                        {dbTestResult.latencyMs && (
                          <span className="font-mono text-[11px] opacity-80 shrink-0">
                            Latency: {dbTestResult.latencyMs}ms
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Schema Info Card */}
                  <div className="p-4 rounded-xl bg-cortex-panel/60 border border-cortex-border space-y-2">
                    <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-cortex-accent" />
                      <span>Automatic Schema Migrations</span>
                    </h3>
                    <p className="text-[11px] text-cortex-muted leading-relaxed">
                      Connecting to PostgreSQL automatically provisions and verifies 5 relational tables:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                      <div className="p-2 rounded bg-cortex-surface border border-cortex-border text-cortex-text">
                        <span className="text-cortex-accent">user_profiles</span>: Google identity & accounts
                      </div>
                      <div className="p-2 rounded bg-cortex-surface border border-cortex-border text-cortex-text">
                        <span className="text-cortex-accent">user_settings</span>: JSONB configs & themes
                      </div>
                      <div className="p-2 rounded bg-cortex-surface border border-cortex-border text-cortex-text">
                        <span className="text-cortex-accent">user_snippets</span>: Custom reusable code snippets
                      </div>
                      <div className="p-2 rounded bg-cortex-surface border border-cortex-border text-cortex-text">
                        <span className="text-cortex-accent">ai_conversations</span>: Persistent AI chats
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category: KEYBINDINGS */}
              {activeCategory === 'shortcuts' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cortex-border">
                    <div className="flex items-center gap-2">
                      <Keyboard size={16} className="text-cortex-accent" />
                      <h2 className="text-sm font-semibold text-cortex-text">
                        Keybindings Reference
                      </h2>
                    </div>
                    <span className="text-[11px] text-cortex-muted">
                      Default keyboard shortcuts
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {shortcutsList.map((sc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-cortex-panel border border-cortex-border hover:border-cortex-border/80 transition-colors"
                      >
                        <span className="text-cortex-text font-medium">{sc.label}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k, kidx) => (
                            <kbd
                              key={kidx}
                              className="px-2 py-0.5 rounded bg-cortex-surface border border-cortex-border font-mono text-[11px] text-cortex-accent shadow-sm font-semibold"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default SettingsWindow



