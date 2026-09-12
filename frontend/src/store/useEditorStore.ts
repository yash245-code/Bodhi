import { create } from 'zustand'
import { Tab, EditorSettings, TerminalSession, ShellType } from '@shared/types'
import { getLanguageForFile } from '@shared/constants'
import { useGitStore } from './useGitStore'
import { useWorkspaceStore } from './useWorkspaceStore'
import { applyThemeAndAccent } from '../theme/themeRegistry'

interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  cursorPosition: { line: number; col: number }
  targetEditorLocation: { path: string; line: number; col: number } | null
  settings: EditorSettings
  isTerminalOpen: boolean
  terminalHeight: number
  terminalSessions: TerminalSession[]
  activeTerminalId: string
  isSidebarOpen: boolean
  sidebarWidth: number
  activeSidebarView: 'explorer' | 'search' | 'git' | 'settings' | 'extensions' | 'ai' | null
  isPaletteOpen: boolean
  paletteMode: 'files' | 'commands' | 'themes' | 'accents' | 'recent-workspaces' | 'fonts'
  isAboutModalOpen: boolean
  isTermsModalOpen: boolean
  isWalkthroughOpen: boolean
  isSplitEditorOpen: boolean
  splitRatio: number
  pane2Tabs: Tab[]
  pane2ActiveTabId: string | null
  isMarkdownPreviewOpen: boolean
  diffViewMode: 'side-by-side' | 'inline'
  isTerminalSearchOpen: boolean

  // Actions
  setTermsModalOpen: (open: boolean) => void
  setWalkthroughOpen: (open: boolean) => void
  completeWalkthrough: () => void
  toggleDiffViewMode: () => void
  openDiffTab: (
    filePath: string,
    originalContent?: string,
    diffTitle?: string,
    pane?: 1 | 2
  ) => Promise<void>
  toggleDiffMode: (tabId?: string, pane?: 1 | 2) => Promise<void>
  openTab: (filePath: string, initialContent?: string) => Promise<void>
  openInPane2: (filePath: string, initialContent?: string) => Promise<void>
  openFileAtLocation: (filePath: string, line: number, col: number) => Promise<void>
  setTargetEditorLocation: (loc: { path: string; line: number; col: number } | null) => void
  closeTab: (tabId: string, pane?: 1 | 2) => void
  closeOtherTabs: (tabId: string, pane?: 1 | 2) => void
  closeAllTabs: (pane?: 1 | 2) => void
  setActiveTab: (tabId: string, pane?: 1 | 2) => void
  updateTabContent: (tabId: string, content: string) => void
  saveTab: (tabId: string) => Promise<boolean>
  saveActiveTab: () => Promise<boolean>
  saveAllTabs: () => Promise<void>
  reorderTabs: (startIndex: number, endIndex: number, pane?: 1 | 2) => void
  moveTabToPane: (tabId: string, targetPane: 1 | 2) => void
  setCursorPosition: (line: number, col: number) => void
  toggleTerminal: () => void
  setTerminalOpen: (open: boolean) => void
  setTerminalHeight: (height: number) => void
  addTerminalSession: (shell?: ShellType) => string
  removeTerminalSession: (id: string) => void
  splitTerminalSession: (sessionId: string, shell?: ShellType) => void
  closeSplitSession: (sessionId: string) => void
  setTerminalSplitRatio: (sessionId: string, ratio: number) => void
  setTerminalSearchOpen: (open: boolean) => void
  toggleTerminalSearch: () => void
  setActiveTerminalId: (id: string) => void
  restoreSession: (session: Partial<EditorState>) => void
  toggleSplitEditor: () => void
  setSplitEditorOpen: (open: boolean) => void
  setSplitRatio: (ratio: number) => void
  toggleMarkdownPreview: () => void
  setMarkdownPreviewOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleSidebarView: (view: 'explorer' | 'search' | 'git' | 'settings' | 'extensions' | 'ai') => void
  setActiveSidebarView: (view: 'explorer' | 'search' | 'git' | 'settings' | 'extensions' | 'ai' | null) => void
  setSidebarWidth: (width: number) => void
  openPalette: (
    mode?: 'files' | 'commands' | 'themes' | 'accents' | 'recent-workspaces' | 'fonts'
  ) => void
  closePalette: () => void
  togglePalette: (
    mode?: 'files' | 'commands' | 'themes' | 'accents' | 'recent-workspaces' | 'fonts'
  ) => void
  setAboutModalOpen: (open: boolean) => void
  openSettingsWindow: () => void
  initSettingsSync: () => () => void
  updateSettings: (partial: Partial<EditorSettings>) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleMinimap: () => void
  toggleWordWrap: () => void
  toggleAutoSave: () => void
  toggleSidebarPosition: () => void
  toggleChurnHeatmap: () => void
}

const initialTerminalSession: TerminalSession = {
  id: 'term-1',
  name: '1: powershell',
  shell: 'powershell'
}

const getDefaultSettings = (): EditorSettings => {
  const defaults: EditorSettings = {
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
    fontTheme: 'fira-code',
    fontLigatures: true,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    theme: 'bodhi-cyber',
    accentColor: '#5DD62C',
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

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('BODHI_editor_settings')
      const dedicatedAiKey = localStorage.getItem('BODHI_ai_api_key')
      if (saved) {
        const parsed = { ...defaults, ...JSON.parse(saved) }
        if (dedicatedAiKey && !parsed.aiApiKey) {
          parsed.aiApiKey = dedicatedAiKey
        }
        // Ensure theme exists
        if (parsed.theme === 'vs-dark') parsed.theme = 'bodhi-cyber'
        applyThemeAndAccent(parsed.theme, parsed.accentColor)
        return parsed
      } else if (dedicatedAiKey) {
        defaults.aiApiKey = dedicatedAiKey
      }
    } catch {
      // ignore
    }
    applyThemeAndAccent(defaults.theme, defaults.accentColor)
  }
  return defaults
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  cursorPosition: { line: 1, col: 1 },
  targetEditorLocation: null,
  settings: getDefaultSettings(),
  isTerminalOpen: false,
  terminalHeight: 240,
  terminalSessions: [initialTerminalSession],
  activeTerminalId: 'term-1',
  isSidebarOpen: true,
  sidebarWidth: 260,
  activeSidebarView: 'explorer',
  isPaletteOpen: false,
  paletteMode: 'files',
  isAboutModalOpen: false,
  isTermsModalOpen: false,
  isWalkthroughOpen: typeof window !== 'undefined' ? localStorage.getItem('BODHI_walkthrough_completed') !== 'true' : false,
  isSplitEditorOpen: false,
  splitRatio: 0.5,
  pane2Tabs: [],
  pane2ActiveTabId: null,
  isMarkdownPreviewOpen: false,
  diffViewMode: 'side-by-side',

  toggleDiffViewMode: () => {
    set((state) => ({
      diffViewMode: state.diffViewMode === 'side-by-side' ? 'inline' : 'side-by-side'
    }))
  },

  openDiffTab: async (
    filePath: string,
    originalContent?: string,
    diffTitle?: string,
    pane = 1
  ) => {
    const { tabs, pane2Tabs } = get()
    const currentTabs = pane === 1 ? tabs : pane2Tabs
    const diffTabId = `diff:${filePath}`
    const existing = currentTabs.find((t) => t.id === diffTabId)

    if (existing) {
      if (pane === 1) {
        set({ activeTabId: existing.id })
      } else {
        set({ pane2ActiveTabId: existing.id })
      }
      return
    }

    try {
      let content = ''
      const existingRegularTab = currentTabs.find((t) => t.path === filePath && !t.isDiff)
      if (existingRegularTab) {
        content = existingRegularTab.content
      } else {
        content = await window.bodhiAPI.readFile(filePath)
      }

      let original = originalContent
      if (original === undefined && window.bodhiAPI) {
        const { rootPath } = useWorkspaceStore.getState()
        if (rootPath) {
          const relativePath = filePath.startsWith(rootPath)
            ? filePath.slice(rootPath.length).replace(/^[/\\]+/, '')
            : filePath
          original = (await window.bodhiAPI.gitGetFileAtHead(rootPath, relativePath)) ?? ''
        }
      }

      const fileName = filePath.split(/[/\\]/).pop() || 'Untitled'
      const language = getLanguageForFile(fileName)

      const newTab: Tab = {
        id: diffTabId,
        path: filePath,
        name: `Diff: ${fileName}`,
        content,
        savedContent: content,
        isDirty: false,
        language,
        isDiff: true,
        originalContent: original ?? '',
        diffTitle: diffTitle || `${fileName} (Working Tree ↔ HEAD)`
      }

      if (pane === 1) {
        set({ tabs: [...tabs, newTab], activeTabId: newTab.id })
      } else {
        set({ pane2Tabs: [...pane2Tabs, newTab], pane2ActiveTabId: newTab.id })
      }
    } catch (err) {
      console.error(`Failed to open diff tab for ${filePath}:`, err)
    }
  },

  toggleDiffMode: async (tabId?: string, pane = 1) => {
    const { tabs, activeTabId, pane2Tabs, pane2ActiveTabId, openDiffTab } = get()
    const currentTabs = pane === 1 ? tabs : pane2Tabs
    const currentActiveId = tabId || (pane === 1 ? activeTabId : pane2ActiveTabId)
    const activeTab = currentTabs.find((t) => t.id === currentActiveId)
    if (!activeTab) return

    if (activeTab.isDiff) {
      const normalTab = currentTabs.find((t) => t.path === activeTab.path && !t.isDiff)
      if (normalTab) {
        if (pane === 1) set({ activeTabId: normalTab.id })
        else set({ pane2ActiveTabId: normalTab.id })
      } else {
        const fileName = activeTab.path.split(/[/\\]/).pop() || 'Untitled'
        const updated = currentTabs.map((t) =>
          t.id === activeTab.id ? { ...t, isDiff: false, name: fileName } : t
        )
        if (pane === 1) set({ tabs: updated })
        else set({ pane2Tabs: updated })
      }
    } else {
      await openDiffTab(activeTab.path, undefined, undefined, pane)
    }
  },

  openTab: async (filePath: string, initialContent?: string) => {
    const { tabs } = get()
    const existingTab = tabs.find((t) => t.path === filePath)

    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }

    try {
      const content =
        initialContent !== undefined ? initialContent : await window.bodhiAPI.readFile(filePath)
      const fileName = filePath.split(/[/\\]/).pop() || 'Untitled'
      const language = getLanguageForFile(fileName)

      const newTab: Tab = {
        id: filePath,
        path: filePath,
        name: fileName,
        content,
        savedContent: content,
        isDirty: false,
        language
      }

      set({
        tabs: [...tabs, newTab],
        activeTabId: newTab.id
      })
    } catch (err) {
      console.error(`Failed to open tab for ${filePath}:`, err)
    }
  },

  openInPane2: async (filePath: string, initialContent?: string) => {
    const { pane2Tabs } = get()
    const existingTab = pane2Tabs.find((t) => t.path === filePath)

    if (existingTab) {
      set({ pane2ActiveTabId: existingTab.id, isSplitEditorOpen: true })
      return
    }

    try {
      const content =
        initialContent !== undefined ? initialContent : await window.bodhiAPI.readFile(filePath)
      const fileName = filePath.split(/[/\\]/).pop() || 'Untitled'
      const language = getLanguageForFile(fileName)

      const newTab: Tab = {
        id: filePath,
        path: filePath,
        name: fileName,
        content,
        savedContent: content,
        isDirty: false,
        language
      }

      set({
        pane2Tabs: [...pane2Tabs, newTab],
        pane2ActiveTabId: newTab.id,
        isSplitEditorOpen: true
      })
    } catch (err) {
      console.error(`Failed to open tab in pane 2 for ${filePath}:`, err)
    }
  },

  closeTab: (tabId: string, pane = 1) => {
    const { tabs, activeTabId, pane2Tabs, pane2ActiveTabId } = get()

    if (pane === 1) {
      const targetIndex = tabs.findIndex((t) => t.id === tabId)
      if (targetIndex === -1) return

      const newTabs = tabs.filter((t) => t.id !== tabId)
      let nextActiveId = activeTabId

      if (activeTabId === tabId) {
        if (newTabs.length === 0) {
          nextActiveId = null
        } else if (targetIndex < newTabs.length) {
          nextActiveId = newTabs[targetIndex].id
        } else {
          nextActiveId = newTabs[newTabs.length - 1].id
        }
      }

      set({ tabs: newTabs, activeTabId: nextActiveId })
    } else {
      const targetIndex = pane2Tabs.findIndex((t) => t.id === tabId)
      if (targetIndex === -1) return

      const newTabs = pane2Tabs.filter((t) => t.id !== tabId)
      let nextActiveId = pane2ActiveTabId

      if (pane2ActiveTabId === tabId) {
        if (newTabs.length === 0) {
          nextActiveId = null
        } else if (targetIndex < newTabs.length) {
          nextActiveId = newTabs[targetIndex].id
        } else {
          nextActiveId = newTabs[newTabs.length - 1].id
        }
      }

      set({ pane2Tabs: newTabs, pane2ActiveTabId: nextActiveId })
    }
  },

  closeOtherTabs: (tabId: string, pane = 1) => {
    const { tabs, pane2Tabs } = get()
    if (pane === 1) {
      const targetTab = tabs.find((t) => t.id === tabId)
      if (targetTab) {
        set({ tabs: [targetTab], activeTabId: targetTab.id })
      }
    } else {
      const targetTab = pane2Tabs.find((t) => t.id === tabId)
      if (targetTab) {
        set({ pane2Tabs: [targetTab], pane2ActiveTabId: targetTab.id })
      }
    }
  },

  closeAllTabs: (pane) => {
    if (!pane) {
      set({
        tabs: [],
        activeTabId: null,
        pane2Tabs: [],
        pane2ActiveTabId: null,
        isSplitEditorOpen: false
      })
    } else if (pane === 1) {
      set({ tabs: [], activeTabId: null })
    } else {
      set({ pane2Tabs: [], pane2ActiveTabId: null, isSplitEditorOpen: false })
    }
  },

  setActiveTab: (tabId: string, pane = 1) => {
    if (pane === 1) {
      set({ activeTabId: tabId })
    } else {
      set({ pane2ActiveTabId: tabId })
    }
  },

  updateTabContent: (tabId: string, content: string) => {
    const { tabs, pane2Tabs } = get()
    const updateFn = (t: Tab): Tab =>
      t.id === tabId ? { ...t, content, isDirty: content !== t.savedContent } : t

    set({
      tabs: tabs.map(updateFn),
      pane2Tabs: pane2Tabs.map(updateFn)
    })
  },

  saveTab: async (tabId: string) => {
    const { tabs, pane2Tabs } = get()
    const tab = tabs.find((t) => t.id === tabId) || pane2Tabs.find((t) => t.id === tabId)
    if (!tab) return false

    try {
      await window.bodhiAPI.writeFile(tab.path, tab.content)
      const markSaved = (t: Tab): Tab =>
        t.id === tabId ? { ...t, savedContent: t.content, isDirty: false } : t

      set({
        tabs: tabs.map(markSaved),
        pane2Tabs: pane2Tabs.map(markSaved)
      })
      useGitStore.getState().refreshGitStatus()
      return true
    } catch (err) {
      console.error(`Failed to save tab ${tab.path}:`, err)
      return false
    }
  },

  saveActiveTab: async () => {
    const { activeTabId, pane2ActiveTabId, isSplitEditorOpen, saveTab } = get()
    let saved = false
    if (activeTabId) {
      saved = await saveTab(activeTabId)
    }
    if (isSplitEditorOpen && pane2ActiveTabId && pane2ActiveTabId !== activeTabId) {
      await saveTab(pane2ActiveTabId)
    }
    return saved
  },

  saveAllTabs: async () => {
    const { tabs, pane2Tabs, saveTab } = get()
    const all = [...tabs, ...pane2Tabs]
    for (const tab of all) {
      if (tab.isDirty) {
        await saveTab(tab.id)
      }
    }
  },

  reorderTabs: (startIndex: number, endIndex: number, pane = 1) => {
    const { tabs, pane2Tabs } = get()
    if (pane === 1) {
      const result = Array.from(tabs)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      set({ tabs: result })
    } else {
      const result = Array.from(pane2Tabs)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      set({ pane2Tabs: result })
    }
  },

  moveTabToPane: (tabId: string, targetPane: 1 | 2) => {
    const { tabs, activeTabId, pane2Tabs, pane2ActiveTabId } = get()
    if (targetPane === 2) {
      const tabToMove = tabs.find((t) => t.id === tabId)
      if (!tabToMove) return

      const newTabs = tabs.filter((t) => t.id !== tabId)
      const nextActiveId = activeTabId === tabId ? (newTabs[0]?.id || null) : activeTabId

      set({
        tabs: newTabs,
        activeTabId: nextActiveId,
        pane2Tabs: [...pane2Tabs, tabToMove],
        pane2ActiveTabId: tabToMove.id,
        isSplitEditorOpen: true
      })
    } else {
      const tabToMove = pane2Tabs.find((t) => t.id === tabId)
      if (!tabToMove) return

      const newPane2Tabs = pane2Tabs.filter((t) => t.id !== tabId)
      const nextPane2ActiveId =
        pane2ActiveTabId === tabId ? (newPane2Tabs[0]?.id || null) : pane2ActiveTabId

      set({
        pane2Tabs: newPane2Tabs,
        pane2ActiveTabId: nextPane2ActiveId,
        tabs: [...tabs, tabToMove],
        activeTabId: tabToMove.id
      })
    }
  },

  toggleSplitEditor: () => {
    const { isSplitEditorOpen, tabs, activeTabId, pane2Tabs } = get()
    if (isSplitEditorOpen) {
      // Close split: merge pane 2 tabs into pane 1 if not already there
      const mergedTabs = [...tabs]
      for (const p2Tab of pane2Tabs) {
        if (!mergedTabs.some((t) => t.id === p2Tab.id)) {
          mergedTabs.push(p2Tab)
        }
      }
      set({
        isSplitEditorOpen: false,
        tabs: mergedTabs
      })
    } else {
      // Open split: if pane2 is empty, copy active tab or open next tab into pane2
      let newPane2Tabs = [...pane2Tabs]
      let newPane2ActiveId = get().pane2ActiveTabId

      if (newPane2Tabs.length === 0 && tabs.length > 0) {
        const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
        newPane2Tabs = [activeTab]
        newPane2ActiveId = activeTab.id
      }

      set({
        isSplitEditorOpen: true,
        pane2Tabs: newPane2Tabs,
        pane2ActiveTabId: newPane2ActiveId
      })
    }
  },

  setSplitEditorOpen: (open: boolean) => set({ isSplitEditorOpen: open }),
  setSplitRatio: (ratio: number) =>
    set({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }),

  toggleMarkdownPreview: () =>
    set((state) => ({ isMarkdownPreviewOpen: !state.isMarkdownPreviewOpen })),
  setMarkdownPreviewOpen: (open: boolean) => set({ isMarkdownPreviewOpen: open }),

  openFileAtLocation: async (filePath: string, line: number, col: number) => {
    await get().openTab(filePath)
    set({
      targetEditorLocation: { path: filePath, line, col }
    })
  },

  setTargetEditorLocation: (loc) => set({ targetEditorLocation: loc }),

  setCursorPosition: (line: number, col: number) => {
    set({ cursorPosition: { line, col } })
  },

  toggleTerminal: () => {
    const state = get()
    const willOpen = !state.isTerminalOpen
    if (willOpen && state.terminalSessions.length === 0) {
      // Auto-create a default session when opening with none
      const id = `term-${Date.now()}`
      set({
        isTerminalOpen: true,
        terminalSessions: [{ id, name: '1: powershell', shell: 'powershell' }],
        activeTerminalId: id
      })
    } else {
      set({ isTerminalOpen: willOpen })
    }
  },
  setTerminalOpen: (open: boolean) => {
    const state = get()
    if (open && state.terminalSessions.length === 0) {
      const id = `term-${Date.now()}`
      set({
        isTerminalOpen: true,
        terminalSessions: [{ id, name: '1: powershell', shell: 'powershell' }],
        activeTerminalId: id
      })
    } else {
      set({ isTerminalOpen: open })
    }
  },
  setTerminalHeight: (height: number) =>
    set({ terminalHeight: Math.max(120, Math.min(height, window.innerHeight - 150)) }),

  addTerminalSession: (shell = 'powershell') => {
    const { terminalSessions } = get()
    const id = `term-${Date.now()}`
    const count = terminalSessions.length + 1
    const newSession: TerminalSession = {
      id,
      name: `${count}: ${shell}`,
      shell
    }

    set({
      terminalSessions: [...terminalSessions, newSession],
      activeTerminalId: id,
      isTerminalOpen: true
    })
    return id
  },

  removeTerminalSession: (id: string) => {
    const { terminalSessions, activeTerminalId } = get()
    if (window.bodhiAPI?.killTerminal) {
      window.bodhiAPI.killTerminal(id)
    }

    const remaining = terminalSessions.filter((s) => s.id !== id)
    if (remaining.length === 0) {
      // Close the terminal panel entirely — a fresh session is
      // created automatically next time the panel is opened
      set({
        terminalSessions: [],
        activeTerminalId: '',
        isTerminalOpen: false
      })
      return
    }

    let nextActiveId = activeTerminalId
    if (activeTerminalId === id) {
      nextActiveId = remaining[remaining.length - 1].id
    }

    set({
      terminalSessions: remaining,
      activeTerminalId: nextActiveId
    })
  },

  isTerminalSearchOpen: false,
  setTerminalSearchOpen: (open: boolean) => set({ isTerminalSearchOpen: open }),
  toggleTerminalSearch: () => set((state) => ({ isTerminalSearchOpen: !state.isTerminalSearchOpen })),

  splitTerminalSession: (sessionId: string, shell = 'powershell') => {
    const { terminalSessions } = get()
    const parentSession = terminalSessions.find((s) => s.id === sessionId)
    if (!parentSession) return

    // If already split, do nothing
    if (parentSession.splitSessionId) return

    const splitId = `term-split-${Date.now()}`
    const childSession: TerminalSession = {
      id: splitId,
      name: `${parentSession.name} (Split)`,
      shell: shell as ShellType
    }

    const updatedSessions = terminalSessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          splitSessionId: splitId,
          splitRatio: s.splitRatio || 0.5
        }
      }
      return s
    })

    set({
      terminalSessions: [...updatedSessions, childSession]
    })
  },

  closeSplitSession: (sessionId: string) => {
    const { terminalSessions } = get()
    const parentSession = terminalSessions.find((s) => s.id === sessionId)
    if (!parentSession || !parentSession.splitSessionId) return

    const splitId = parentSession.splitSessionId
    if (window.bodhiAPI?.killTerminal) {
      window.bodhiAPI.killTerminal(splitId)
    }

    const updatedSessions = terminalSessions
      .filter((s) => s.id !== splitId)
      .map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            splitSessionId: undefined
          }
        }
        return s
      })

    set({ terminalSessions: updatedSessions })
  },

  setTerminalSplitRatio: (sessionId: string, ratio: number) => {
    const { terminalSessions } = get()
    const updated = terminalSessions.map((s) => {
      if (s.id === sessionId) {
        return { ...s, splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }
      }
      return s
    })
    set({ terminalSessions: updated })
  },

  setActiveTerminalId: (id: string) => set({ activeTerminalId: id, isTerminalOpen: true }),

  restoreSession: (restored: Partial<EditorState>) => {
    set((state) => ({
      ...state,
      ...restored
    }))
  },

  toggleSidebar: () =>
    set((state) => {
      const willBeOpen = !state.isSidebarOpen
      return {
        isSidebarOpen: willBeOpen,
        activeSidebarView: willBeOpen ? state.activeSidebarView || 'explorer' : null
      }
    }),
  toggleSidebarView: (view: 'explorer' | 'search' | 'git' | 'settings' | 'extensions' | 'ai') =>
    set((state) => {
      if (state.isSidebarOpen && state.activeSidebarView === view) {
        return { isSidebarOpen: false, activeSidebarView: null }
      }
      return { isSidebarOpen: true, activeSidebarView: view }
    }),
  setActiveSidebarView: (view) =>
    set({
      activeSidebarView: view,
      isSidebarOpen: view !== null
    }),
  setSidebarWidth: (width: number) =>
    set({ sidebarWidth: Math.max(180, Math.min(width, 500)) }),

  openPalette: (mode = 'files') => set({ isPaletteOpen: true, paletteMode: mode }),
  closePalette: () => set({ isPaletteOpen: false }),
  togglePalette: (mode = 'files') =>
    set((state) => ({
      isPaletteOpen: !state.isPaletteOpen,
      paletteMode: mode
    })),

  setAboutModalOpen: (open: boolean) => set({ isAboutModalOpen: open }),

  setTermsModalOpen: (open: boolean) => set({ isTermsModalOpen: open }),

  setWalkthroughOpen: (open: boolean) => set({ isWalkthroughOpen: open }),

  completeWalkthrough: () => {
    try {
      localStorage.setItem('BODHI_walkthrough_completed', 'true')
    } catch {
      // ignore
    }
    set({ isWalkthroughOpen: false })
  },

  openSettingsWindow: () => {
    if (typeof window !== 'undefined' && window.bodhiAPI?.openSettingsWindow) {
      window.bodhiAPI.openSettingsWindow()
    }
  },

  initSettingsSync: () => {
    if (typeof window !== 'undefined' && window.bodhiAPI) {
      // 1. Initial sync from disk-backed main process settings.json
      if (window.bodhiAPI.getSettings) {
        window.bodhiAPI.getSettings().then((persisted) => {
          if (persisted && Object.keys(persisted).length > 0) {
            set((state) => {
              const next = { ...state.settings, ...persisted }
              try {
                localStorage.setItem('BODHI_editor_settings', JSON.stringify(next))
                if (next.aiApiKey) {
                  localStorage.setItem('BODHI_ai_api_key', next.aiApiKey)
                }
              } catch {
                // ignore
              }
              applyThemeAndAccent(next.theme, next.accentColor)
              return { settings: next }
            })
          }
        })
      }

      // 2. Real-time broadcast sync across all windows
      if (window.bodhiAPI.onSettingsChanged) {
        return window.bodhiAPI.onSettingsChanged((incomingSettings) => {
          set((state) => {
            const next = { ...state.settings, ...incomingSettings }
            try {
              localStorage.setItem('BODHI_editor_settings', JSON.stringify(next))
              if (next.aiApiKey) {
                localStorage.setItem('BODHI_ai_api_key', next.aiApiKey)
              }
            } catch {
              // ignore
            }
            applyThemeAndAccent(next.theme, next.accentColor)
            return { settings: next }
          })
        })
      }
    }
    return () => {}
  },

  updateSettings: (partial) => {
    set((state) => {
      const next = { ...state.settings, ...partial }
      try {
        localStorage.setItem('BODHI_editor_settings', JSON.stringify(next))
        if (partial.aiApiKey !== undefined) {
          if (partial.aiApiKey) {
            localStorage.setItem('BODHI_ai_api_key', partial.aiApiKey)
          } else {
            localStorage.removeItem('BODHI_ai_api_key')
          }
        }
      } catch {
        // ignore
      }
      applyThemeAndAccent(next.theme, next.accentColor)
      return { settings: next }
    })
    if (typeof window !== 'undefined' && window.bodhiAPI?.updateSettings) {
      window.bodhiAPI.updateSettings(partial)
    }
  },

  increaseFontSize: () => {
    get().updateSettings({
      fontSize: Math.min(32, get().settings.fontSize + 1)
    })
  },

  decreaseFontSize: () => {
    get().updateSettings({
      fontSize: Math.max(9, get().settings.fontSize - 1)
    })
  },

  toggleMinimap: () => {
    get().updateSettings({
      minimap: !get().settings.minimap
    })
  },

  toggleWordWrap: () => {
    get().updateSettings({
      wordWrap: get().settings.wordWrap === 'on' ? 'off' : 'on'
    })
  },

  toggleAutoSave: () => {
    get().updateSettings({
      autoSave: !get().settings.autoSave
    })
  },

  toggleSidebarPosition: () => {
    const current = get().settings.sidebarPosition || 'left'
    get().updateSettings({
      sidebarPosition: current === 'right' ? 'left' : 'right'
    })
  },

  toggleChurnHeatmap: () => {
    const current = get().settings.enableChurnHeatmap !== false
    get().updateSettings({
      enableChurnHeatmap: !current
    })
  }
}))

