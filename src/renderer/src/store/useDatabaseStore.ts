import { create } from 'zustand'
import {
  DbConnectionStatus,
  DbTestResult,
  CloudSnippet,
  CloudAIChat,
  EditorSettings
} from '@shared/types'
import { useAuthStore } from './useAuthStore'
import { useEditorStore } from './useEditorStore'

interface DatabaseState {
  status: DbConnectionStatus
  isTesting: boolean
  isConnecting: boolean
  isSyncing: boolean
  testResult: DbTestResult | null
  snippets: CloudSnippet[]
  conversations: CloudAIChat[]

  // Actions
  initDb: () => Promise<void>
  testConnection: (connectionString: string) => Promise<DbTestResult>
  connect: (connectionString: string) => Promise<DbConnectionStatus>
  disconnect: () => Promise<void>
  syncSettingsNow: () => Promise<boolean>
  loadCloudSettings: () => Promise<Partial<EditorSettings> | null>
  saveSnippet: (snippet: CloudSnippet) => Promise<boolean>
  fetchSnippets: () => Promise<void>
  saveAiChat: (chat: CloudAIChat) => Promise<boolean>
  fetchAiChats: () => Promise<void>
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  status: { connected: false },
  isTesting: false,
  isConnecting: false,
  isSyncing: false,
  testResult: null,
  snippets: [],
  conversations: [],

  initDb: async () => {
    if (!window.bodhiAPI?.dbGetStatus) return

    try {
      const initialStatus = await window.bodhiAPI.dbGetStatus()
      set({ status: initialStatus })

      window.bodhiAPI.onDbStatusChanged?.((newStatus) => {
        set({ status: newStatus })
      })

      if (initialStatus.connected) {
        get().fetchSnippets()
        get().fetchAiChats()
      }
    } catch (err) {
      console.error('Failed to init DB status in store:', err)
    }
  },

  testConnection: async (connectionString: string) => {
    if (!window.bodhiAPI?.dbTestConnection) {
      return { success: false, message: 'Database API not available.' }
    }
    set({ isTesting: true, testResult: null })
    try {
      const res = await window.bodhiAPI.dbTestConnection(connectionString.trim())
      set({ testResult: res, isTesting: false })
      return res
    } catch (err: any) {
      const res = { success: false, message: err.message || 'Connection test failed.' }
      set({ testResult: res, isTesting: false })
      return res
    }
  },

  connect: async (connectionString: string) => {
    if (!window.bodhiAPI?.dbConnect) {
      return { connected: false, error: 'Database API not available' }
    }
    set({ isConnecting: true, testResult: null })
    try {
      const newStatus = await window.bodhiAPI.dbConnect(connectionString.trim())
      set({ status: newStatus, isConnecting: false })

      if (newStatus.connected) {
        // Auto-sync current settings to cloud
        await get().syncSettingsNow()
        await get().fetchSnippets()
        await get().fetchAiChats()
      }
      return newStatus
    } catch (err: any) {
      const failed = { connected: false, error: err.message }
      set({ status: failed, isConnecting: false })
      return failed
    }
  },

  disconnect: async () => {
    if (!window.bodhiAPI?.dbDisconnect) return
    try {
      await window.bodhiAPI.dbDisconnect()
      set({
        status: { connected: false },
        testResult: null,
        snippets: [],
        conversations: []
      })
    } catch (err) {
      console.error('Failed to disconnect DB:', err)
    }
  },

  syncSettingsNow: async () => {
    const { status } = get()
    const user = useAuthStore.getState().user
    const settings = useEditorStore.getState().settings

    if (!status.connected || !window.bodhiAPI?.dbSyncSettings) return false

    // If user is not logged in via Google, use local anonymous profile key
    const userId = user?.id || 'local_user_default'
    set({ isSyncing: true })

    try {
      const success = await window.bodhiAPI.dbSyncSettings(userId, settings)
      set({ isSyncing: false })
      return success
    } catch (err) {
      console.error('Failed to sync settings to DB:', err)
      set({ isSyncing: false })
      return false
    }
  },

  loadCloudSettings: async () => {
    const { status } = get()
    const user = useAuthStore.getState().user

    if (!status.connected || !window.bodhiAPI?.dbGetSettings) return null
    const userId = user?.id || 'local_user_default'

    try {
      const cloudSettings = await window.bodhiAPI.dbGetSettings(userId)
      if (cloudSettings) {
        useEditorStore.getState().updateSettings(cloudSettings)
      }
      return cloudSettings
    } catch (err) {
      console.error('Failed to load cloud settings:', err)
      return null
    }
  },

  saveSnippet: async (snippet: CloudSnippet) => {
    const { status } = get()
    const user = useAuthStore.getState().user

    if (!status.connected || !window.bodhiAPI?.dbSaveSnippet) return false
    const userId = user?.id || 'local_user_default'

    try {
      const success = await window.bodhiAPI.dbSaveSnippet(userId, snippet)
      if (success) {
        await get().fetchSnippets()
      }
      return success
    } catch (err) {
      console.error('Failed to save snippet:', err)
      return false
    }
  },

  fetchSnippets: async () => {
    const { status } = get()
    const user = useAuthStore.getState().user

    if (!status.connected || !window.bodhiAPI?.dbGetSnippets) return
    const userId = user?.id || 'local_user_default'

    try {
      const list = await window.bodhiAPI.dbGetSnippets(userId)
      set({ snippets: list })
    } catch (err) {
      console.error('Failed to fetch snippets:', err)
    }
  },

  saveAiChat: async (chat: CloudAIChat) => {
    const { status } = get()
    const user = useAuthStore.getState().user

    if (!status.connected || !window.bodhiAPI?.dbSaveAiChat) return false
    const userId = user?.id || 'local_user_default'

    try {
      const success = await window.bodhiAPI.dbSaveAiChat(userId, chat)
      if (success) {
        await get().fetchAiChats()
      }
      return success
    } catch (err) {
      console.error('Failed to save AI chat:', err)
      return false
    }
  },

  fetchAiChats: async () => {
    const { status } = get()
    const user = useAuthStore.getState().user

    if (!status.connected || !window.bodhiAPI?.dbGetAiChats) return
    const userId = user?.id || 'local_user_default'

    try {
      const list = await window.bodhiAPI.dbGetAiChats(userId)
      set({ conversations: list })
    } catch (err) {
      console.error('Failed to fetch AI chats:', err)
    }
  }
}))
