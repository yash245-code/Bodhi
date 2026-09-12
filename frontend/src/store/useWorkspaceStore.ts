import { create } from 'zustand'
import { FileNode, RecentWorkspace } from '@shared/types'
import { useGitStore } from './useGitStore'
import { sessionService } from '../services/sessionService'

interface WorkspaceState {
  rootPath: string | null
  rootNode: FileNode | null
  selectedPath: string | null
  expandedPaths: Set<string>
  isLoading: boolean
  creatingItem: { parentPath: string; type: 'file' | 'directory' } | null
  renamingPath: string | null
  recentWorkspaces: RecentWorkspace[]

  // Actions
  openFolder: (dirPath?: string) => Promise<string | null>
  openFileDirectly: (filePath?: string) => Promise<string | null>
  refreshTree: () => Promise<void>
  setSelectedPath: (path: string | null) => void
  toggleExpand: (path: string) => void
  setExpanded: (path: string, expanded: boolean) => void
  setCreatingItem: (item: { parentPath: string; type: 'file' | 'directory' } | null) => void
  setRenamingPath: (path: string | null) => void
  createFile: (parentPath: string, fileName: string) => Promise<string | null>
  createFolder: (parentPath: string, folderName: string) => Promise<boolean>
  renameItem: (oldPath: string, newName: string) => Promise<string | null>
  deleteItem: (targetPath: string) => Promise<boolean>
  initWatcher: () => () => void
  loadRecentWorkspaces: () => void
  removeRecentWorkspace: (path: string) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  rootPath: null,
  rootNode: null,
  selectedPath: null,
  expandedPaths: new Set<string>(),
  isLoading: false,
  creatingItem: null,
  renamingPath: null,
  recentWorkspaces: sessionService.getRecentWorkspaces(),

  loadRecentWorkspaces: () => {
    set({ recentWorkspaces: sessionService.getRecentWorkspaces() })
  },

  removeRecentWorkspace: (path: string) => {
    const updated = sessionService.removeRecentWorkspace(path)
    set({ recentWorkspaces: updated })
  },

  openFolder: async (dirPath?: string) => {
    try {
      const targetDir = dirPath || (await window.bodhiAPI.openDirectoryDialog())
      if (!targetDir) return null

      set({ isLoading: true, rootPath: targetDir })

      const rootNode = await window.bodhiAPI.readDirectory(targetDir)
      await window.bodhiAPI.watchDirectory(targetDir)

      const expanded = new Set(get().expandedPaths)
      expanded.add(targetDir)

      const updatedRecents = sessionService.addRecentWorkspace(targetDir)

      set({
        rootNode,
        expandedPaths: expanded,
        isLoading: false,
        recentWorkspaces: updatedRecents
      })

      // Sync Git status for newly opened folder
      useGitStore.getState().refreshGitStatus()

      // Immediately persist folder to workspace session
      const existingSession = sessionService.loadSession()
      if (existingSession) {
        sessionService.saveSession({ ...existingSession, rootPath: targetDir })
      }

      return targetDir
    } catch (err) {
      console.error('Failed to open folder:', err)
      set({ isLoading: false })
      return null
    }
  },

  openFileDirectly: async (filePath?: string) => {
    try {
      const targetFile = filePath || (await window.bodhiAPI.openFileDialog())
      if (!targetFile) return null
      return targetFile
    } catch (err) {
      console.error('Failed to open file:', err)
      return null
    }
  },

  refreshTree: async () => {
    const { rootPath } = get()
    if (!rootPath) return
    try {
      const rootNode = await window.bodhiAPI.readDirectory(rootPath)
      set({ rootNode })
      useGitStore.getState().refreshGitStatus()
    } catch (err) {
      console.error('Failed to refresh tree:', err)
    }
  },

  setSelectedPath: (path: string | null) => set({ selectedPath: path }),

  toggleExpand: (path: string) => {
    const expanded = new Set(get().expandedPaths)
    if (expanded.has(path)) {
      expanded.delete(path)
    } else {
      expanded.add(path)
    }
    set({ expandedPaths: expanded })
  },

  setExpanded: (path: string, expand: boolean) => {
    const expanded = new Set(get().expandedPaths)
    if (expand) {
      expanded.add(path)
    } else {
      expanded.delete(path)
    }
    set({ expandedPaths: expanded })
  },

  setCreatingItem: (item) => set({ creatingItem: item }),
  setRenamingPath: (path) => set({ renamingPath: path }),

  createFile: async (parentPath: string, fileName: string) => {
    try {
      // Normalize path separator
      const separator = parentPath.includes('\\') ? '\\' : '/'
      const newFilePath = `${parentPath}${separator}${fileName}`
      await window.bodhiAPI.createFile(newFilePath)
      await get().refreshTree()
      get().setExpanded(parentPath, true)
      set({ creatingItem: null, selectedPath: newFilePath })
      useGitStore.getState().refreshGitStatus()
      return newFilePath
    } catch (err) {
      console.error('Failed to create file:', err)
      return null
    }
  },

  createFolder: async (parentPath: string, folderName: string) => {
    try {
      const separator = parentPath.includes('\\') ? '\\' : '/'
      const newDirPath = `${parentPath}${separator}${folderName}`
      await window.bodhiAPI.createDirectory(newDirPath)
      await get().refreshTree()
      get().setExpanded(parentPath, true)
      set({ creatingItem: null })
      useGitStore.getState().refreshGitStatus()
      return true
    } catch (err) {
      console.error('Failed to create folder:', err)
      return false
    }
  },

  renameItem: async (oldPath: string, newName: string) => {
    try {
      const isWindows = oldPath.includes('\\')
      const separator = isWindows ? '\\' : '/'
      const parts = oldPath.split(separator)
      parts.pop()
      const newPath = [...parts, newName].join(separator)

      await window.bodhiAPI.renamePath(oldPath, newPath)
      await get().refreshTree()
      set({ renamingPath: null, selectedPath: newPath })
      useGitStore.getState().refreshGitStatus()
      return newPath
    } catch (err) {
      console.error('Failed to rename item:', err)
      return null
    }
  },

  deleteItem: async (targetPath: string) => {
    if (!targetPath) return false
    try {
      const isSuccess = await window.bodhiAPI.deletePath(targetPath)
      if (!isSuccess) return false

      const normalizedTarget = targetPath.replace(/[/\\]+$/, '').toLowerCase()

      // 1. Close any open tabs matching this deleted file or folder
      try {
        const { useEditorStore } = await import('./useEditorStore')
        const { tabs, pane2Tabs, closeTab } = useEditorStore.getState()
        const isChildOrEqual = (tabPath: string): boolean => {
          const norm = tabPath.replace(/[/\\]+$/, '').toLowerCase()
          return (
            norm === normalizedTarget ||
            norm.startsWith(normalizedTarget + '/') ||
            norm.startsWith(normalizedTarget + '\\')
          )
        }

        for (const tab of tabs) {
          if (isChildOrEqual(tab.path)) {
            closeTab(tab.id, 1)
          }
        }
        for (const tab of pane2Tabs) {
          if (isChildOrEqual(tab.path)) {
            closeTab(tab.id, 2)
          }
        }
      } catch {
        // ignore tab close error
      }

      // 2. Clear selectedPath if deleted
      const currentSelected = get().selectedPath
      if (currentSelected) {
        const normSelected = currentSelected.replace(/[/\\]+$/, '').toLowerCase()
        if (
          normSelected === normalizedTarget ||
          normSelected.startsWith(normalizedTarget + '/') ||
          normSelected.startsWith(normalizedTarget + '\\')
        ) {
          set({ selectedPath: null })
        }
      }

      // 3. Clean up expandedPaths
      const expanded = new Set(get().expandedPaths)
      for (const p of expanded) {
        const normP = p.replace(/[/\\]+$/, '').toLowerCase()
        if (
          normP === normalizedTarget ||
          normP.startsWith(normalizedTarget + '/') ||
          normP.startsWith(normalizedTarget + '\\')
        ) {
          expanded.delete(p)
        }
      }
      set({ expandedPaths: expanded })

      // 4. If root workspace itself was deleted
      const currentRoot = get().rootPath
      if (currentRoot && currentRoot.replace(/[/\\]+$/, '').toLowerCase() === normalizedTarget) {
        set({ rootPath: null, rootNode: null })
      } else {
        await get().refreshTree()
      }

      useGitStore.getState().refreshGitStatus()
      return true
    } catch (err) {
      console.error('Failed to delete item:', err)
      return false
    }
  },

  initWatcher: () => {
    return window.bodhiAPI.onFileChange((event) => {
      // Auto-close tabs if files are deleted from external terminal or explorer
      if (event.type === 'unlink' || event.type === 'unlinkDir') {
        const normalizedTarget = event.path.replace(/[/\\]+$/, '').toLowerCase()
        import('./useEditorStore').then(({ useEditorStore }) => {
          const { tabs, pane2Tabs, closeTab } = useEditorStore.getState()
          const isChildOrEqual = (tabPath: string): boolean => {
            const norm = tabPath.replace(/[/\\]+$/, '').toLowerCase()
            return (
              norm === normalizedTarget ||
              norm.startsWith(normalizedTarget + '/') ||
              norm.startsWith(normalizedTarget + '\\')
            )
          }
          for (const tab of tabs) {
            if (!tab.isDirty && isChildOrEqual(tab.path)) {
              closeTab(tab.id, 1)
            }
          }
          for (const tab of pane2Tabs) {
            if (!tab.isDirty && isChildOrEqual(tab.path)) {
              closeTab(tab.id, 2)
            }
          }
        })
      }

      // Refresh file tree & git on watcher change
      get().refreshTree()
    })
  }
}))

