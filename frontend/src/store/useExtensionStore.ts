import { create } from 'zustand'
import { InstalledExtension, MarketplaceExtension } from '@shared/types'
import { extensionLoaderService } from '../services/extensionLoaderService'

export type ExtensionFilterTab = 'installed' | 'marketplace' | 'recommended'

// Popular curated snippet packs on Open VSX ready for one-click installation
export const RECOMMENDED_EXTENSIONS: MarketplaceExtension[] = [
  {
    id: 'dsznajder.es7-react-js-snippets',
    name: 'es7-react-js-snippets',
    namespace: 'dsznajder',
    displayName: 'ES7+ React/Redux/React-Native Snippets',
    version: '4.4.3',
    description: 'Extensions for React, Redux, and React-Native with ES7+ syntax and graphic symbols.',
    downloadUrl: 'https://open-vsx.org/api/dsznajder/es7-react-js-snippets/4.4.3/file/dsznajder.es7-react-js-snippets-4.4.3.vsix',
    icon: 'https://open-vsx.org/api/dsznajder/es7-react-js-snippets/4.4.3/file/icon.png',
    downloadCount: 1200000,
    categories: ['Snippets'],
    isInstalled: false
  },
  {
    id: 'xabikos.JavaScriptSnippets',
    name: 'JavaScriptSnippets',
    namespace: 'xabikos',
    displayName: 'JavaScript (ES6) Code Snippets',
    version: '1.8.0',
    description: 'Code snippets for JavaScript in ES6 syntax with support for TypeScript, JSX, and TSX.',
    downloadUrl: 'https://open-vsx.org/api/xabikos/JavaScriptSnippets/1.8.0/file/xabikos.JavaScriptSnippets-1.8.0.vsix',
    icon: 'https://open-vsx.org/api/xabikos/JavaScriptSnippets/1.8.0/file/icon.png',
    downloadCount: 950000,
    categories: ['Snippets'],
    isInstalled: false
  },
  {
    id: 'AlDuncanson.react-hooks-snippets',
    name: 'react-hooks-snippets',
    namespace: 'AlDuncanson',
    displayName: 'React Hooks Snippets',
    version: '3.1.3',
    description: 'A complete snippet collection for every React hook (useState, useEffect, useMemo, custom hooks).',
    downloadUrl: 'https://open-vsx.org/api/AlDuncanson/react-hooks-snippets/3.1.3/file/AlDuncanson.react-hooks-snippets-3.1.3.vsix',
    icon: 'https://open-vsx.org/api/AlDuncanson/react-hooks-snippets/3.1.3/file/icon.png',
    downloadCount: 15400,
    categories: ['Snippets'],
    isInstalled: false
  },
  {
    id: 'EricSia.pythonsnippets3',
    name: 'pythonsnippets3',
    namespace: 'EricSia',
    displayName: 'Python Snippets 3',
    version: '3.3.18',
    description: 'Code snippets for Python: control flow, OOP, functions, data structures, and comprehensions.',
    downloadUrl: 'https://open-vsx.org/api/EricSia/pythonsnippets3/3.3.18/file/EricSia.pythonsnippets3-3.3.18.vsix',
    icon: 'https://open-vsx.org/api/EricSia/pythonsnippets3/3.3.18/file/icon.png',
    downloadCount: 42000,
    categories: ['Snippets'],
    isInstalled: false
  },
  {
    id: 'dewdewsnippets.dewdew-snippets',
    name: 'dewdew-snippets',
    namespace: 'dewdewsnippets',
    displayName: 'Frontend Snippets (React, Next.js, Vue)',
    version: '1.2511.1',
    description: 'High-productivity snippets for React, Next.js, Tailwind, Vue, and modern web development.',
    downloadUrl: 'https://open-vsx.org/api/dewdewsnippets/dewdew-snippets/1.2511.1/file/dewdewsnippets.dewdew-snippets-1.2511.1.vsix',
    icon: 'https://open-vsx.org/api/dewdewsnippets/dewdew-snippets/1.2511.1/file/icon.png',
    downloadCount: 8900,
    categories: ['Snippets'],
    isInstalled: false
  }
]


interface ExtensionState {
  installedExtensions: InstalledExtension[]
  marketplaceExtensions: MarketplaceExtension[]
  isLoadingInstalled: boolean
  isSearching: boolean
  installingIds: string[]
  searchQuery: string
  filterTab: ExtensionFilterTab
  errorMessage: string | null

  // Actions
  loadInstalled: () => Promise<void>
  searchMarketplace: (query: string, category?: string) => Promise<void>
  installFromMarketplace: (extension: MarketplaceExtension) => Promise<boolean>
  installFromVsix: (filePath?: string) => Promise<boolean>
  uninstallExtension: (extensionId: string) => Promise<boolean>
  toggleExtension: (extensionId: string, enabled: boolean) => Promise<boolean>
  setSearchQuery: (query: string) => void
  setFilterTab: (tab: ExtensionFilterTab) => void
  clearError: () => void
}

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  installedExtensions: [],
  marketplaceExtensions: [],
  isLoadingInstalled: false,
  isSearching: false,
  installingIds: [],
  searchQuery: '',
  filterTab: 'marketplace',
  errorMessage: null,

  loadInstalled: async () => {
    set({ isLoadingInstalled: true, errorMessage: null })
    try {
      const list = await window.bodhiAPI.extensionsGetInstalled()
      set({ installedExtensions: list || [], isLoadingInstalled: false })
      await extensionLoaderService.reloadSnippets()
      await extensionLoaderService.reloadThemes()
    } catch (err: any) {
      console.error('Failed to load installed extensions:', err)
      set({ isLoadingInstalled: false, errorMessage: err?.message || 'Failed to load extensions' })
    }
  },

  searchMarketplace: async (query: string, category?: string) => {
    set({ isSearching: true, errorMessage: null })
    try {
      const results = await window.bodhiAPI.extensionsSearchMarketplace(query, category)
      const installedSet = new Set(get().installedExtensions.map((e) => e.id))

      const mapped = (results || []).map((ext) => ({
        ...ext,
        isInstalled: installedSet.has(ext.id)
      }))

      set({ marketplaceExtensions: mapped, isSearching: false })
    } catch (err: any) {
      console.error('Failed to search marketplace:', err)
      set({ isSearching: false, errorMessage: err?.message || 'Marketplace search failed' })
    }
  },

  installFromMarketplace: async (extension: MarketplaceExtension) => {
    const { installingIds } = get()
    if (installingIds.includes(extension.id)) return false

    set({ installingIds: [...installingIds, extension.id], errorMessage: null })
    try {
      await window.bodhiAPI.extensionsInstallFromMarketplace(extension)
      await get().loadInstalled()

      // Update isInstalled flag in marketplace results
      set((state) => ({
        marketplaceExtensions: state.marketplaceExtensions.map((m) =>
          m.id === extension.id ? { ...m, isInstalled: true } : m
        ),
        installingIds: state.installingIds.filter((id) => id !== extension.id)
      }))

      return true
    } catch (err: any) {
      console.error(`Failed to install ${extension.displayName}:`, err)
      set((state) => ({
        installingIds: state.installingIds.filter((id) => id !== extension.id),
        errorMessage: `Installation failed: ${err?.message || 'Unknown error'}`
      }))
      return false
    }
  },

  installFromVsix: async (filePath?: string) => {
    set({ errorMessage: null })
    try {
      const installed = await window.bodhiAPI.extensionsInstallFromVsix(filePath)
      if (installed) {
        await get().loadInstalled()
        return true
      }
      return false
    } catch (err: any) {
      console.error('Failed to install VSIX:', err)
      set({ errorMessage: `VSIX install failed: ${err?.message || 'Unknown error'}` })
      return false
    }
  },

  uninstallExtension: async (extensionId: string) => {
    try {
      await window.bodhiAPI.extensionsUninstall(extensionId)
      await get().loadInstalled()

      // Update isInstalled in marketplace results
      set((state) => ({
        marketplaceExtensions: state.marketplaceExtensions.map((m) =>
          m.id === extensionId ? { ...m, isInstalled: false } : m
        )
      }))
      return true
    } catch (err: any) {
      console.error(`Failed to uninstall ${extensionId}:`, err)
      set({ errorMessage: `Uninstall failed: ${err?.message || 'Unknown error'}` })
      return false
    }
  },

  toggleExtension: async (extensionId: string, enabled: boolean) => {
    try {
      await window.bodhiAPI.extensionsToggleEnable(extensionId, enabled)
      await get().loadInstalled()
      return true
    } catch (err: any) {
      console.error(`Failed to toggle extension ${extensionId}:`, err)
      return false
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterTab: (tab: ExtensionFilterTab) => set({ filterTab: tab }),
  clearError: () => set({ errorMessage: null })
}))

