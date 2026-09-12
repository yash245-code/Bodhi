import { create } from 'zustand'
import {
  GitFileStatus,
  GitFileStatusType,
  GitFileChurnResult,
  GitRemote,
  GitBranchInfo,
  GitSyncStatus,
  GitStashItem,
  GitCommitLogItem
} from '@shared/types'
import { useWorkspaceStore } from './useWorkspaceStore'

interface GitState {
  branch: string | null
  isGitRepo: boolean
  stagedFiles: GitFileStatus[]
  unstagedFiles: GitFileStatus[]
  untrackedFiles: GitFileStatus[]
  fileStatusMap: Record<string, GitFileStatusType>
  isLoading: boolean
  isCommitting: boolean
  isSyncing: boolean
  commitMessage: string
  fileChurnMap: Record<string, GitFileChurnResult>
  remotes: GitRemote[]
  branches: GitBranchInfo[]
  syncStatus: GitSyncStatus
  stashes: GitStashItem[]
  commitHistory: GitCommitLogItem[]
  isBranchModalOpen: boolean
  isPublishModalOpen: boolean
  gitError: string | null

  // Actions
  refreshGitStatus: () => Promise<void>
  refreshRemotes: () => Promise<void>
  refreshBranches: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  refreshStashes: () => Promise<void>
  refreshCommitHistory: (maxCount?: number) => Promise<void>
  initRepo: (defaultBranch?: string) => Promise<boolean>
  createGitignore: (templateType: string) => Promise<boolean>
  stageFile: (relativePath: string) => Promise<void>
  unstageFile: (relativePath: string) => Promise<void>
  stageAll: () => Promise<void>
  unstageAll: () => Promise<void>
  discardChanges: (relativePath: string, isUntracked?: boolean) => Promise<void>
  commitChanges: () => Promise<boolean>
  checkoutBranch: (branchName: string, createNew?: boolean) => Promise<boolean>
  createBranch: (branchName: string) => Promise<boolean>
  deleteBranch: (branchName: string, force?: boolean) => Promise<boolean>
  mergeBranch: (branchName: string) => Promise<{ success: boolean; message: string }>
  fetch: () => Promise<boolean>
  pull: () => Promise<{ success: boolean; message: string }>
  push: (setUpstream?: boolean) => Promise<{ success: boolean; message: string }>
  syncChanges: () => Promise<boolean>
  stashSave: (message?: string) => Promise<boolean>
  stashPop: (index?: number) => Promise<boolean>
  stashDrop: (index?: number) => Promise<boolean>
  undoLastCommit: () => Promise<boolean>
  setCommitMessage: (message: string) => void
  getFileStatus: (filePath: string) => GitFileStatusType | undefined
  getFileChurn: (relativePath: string) => Promise<GitFileChurnResult | null>
  clearChurnCache: () => void
  openBranchModal: () => void
  closeBranchModal: () => void
  openPublishModal: () => void
  closePublishModal: () => void
  setGitError: (err: string | null) => void
}

export const useGitStore = create<GitState>((set, get) => ({
  branch: null,
  isGitRepo: false,
  stagedFiles: [],
  unstagedFiles: [],
  untrackedFiles: [],
  fileStatusMap: {},
  isLoading: false,
  isCommitting: false,
  isSyncing: false,
  commitMessage: '',
  fileChurnMap: {},
  remotes: [],
  branches: [],
  syncStatus: {
    ahead: 0,
    behind: 0,
    hasRemote: false,
    upstream: null
  },
  stashes: [],
  commitHistory: [],
  isBranchModalOpen: false,
  isPublishModalOpen: false,
  gitError: null,

  openBranchModal: () => {
    set({ isBranchModalOpen: true })
    get().refreshBranches()
  },
  closeBranchModal: () => set({ isBranchModalOpen: false }),

  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),

  setGitError: (gitError: string | null) => set({ gitError }),

  refreshGitStatus: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitGetStatus) {
      set({
        branch: null,
        isGitRepo: false,
        stagedFiles: [],
        unstagedFiles: [],
        untrackedFiles: [],
        fileStatusMap: {},
        remotes: [],
        branches: [],
        syncStatus: { ahead: 0, behind: 0, hasRemote: false, upstream: null },
        stashes: [],
        commitHistory: []
      })
      return
    }

    set({ isLoading: true })

    try {
      const res = await window.bodhiAPI.gitGetStatus(rootPath)

      // Build fileStatusMap with multiple lookup keys for absolute & relative paths
      const statusMap: Record<string, GitFileStatusType> = {}

      const registerStatus = (f: GitFileStatus): void => {
        const normPath = f.path.replace(/\\/g, '/')
        const normRel = f.relativePath.replace(/\\/g, '/')
        const winPath = f.path.replace(/\//g, '\\')
        const winRel = f.relativePath.replace(/\//g, '\\')

        statusMap[normPath] = f.status
        statusMap[normRel] = f.status
        statusMap[winPath] = f.status
        statusMap[winRel] = f.status
      }

      res.staged.forEach(registerStatus)
      res.unstaged.forEach(registerStatus)
      res.untracked.forEach(registerStatus)

      set({
        isGitRepo: res.isRepo,
        branch: res.branch,
        stagedFiles: res.staged,
        unstagedFiles: res.unstaged,
        untrackedFiles: res.untracked,
        fileStatusMap: statusMap,
        isLoading: false
      })

      if (res.isRepo) {
        // Asynchronously update sync, remotes, branches, stashes in parallel
        get().refreshSyncStatus()
        get().refreshRemotes()
        get().refreshBranches()
        get().refreshStashes()
        get().refreshCommitHistory(10)
      }
    } catch (err) {
      console.error('Failed to refresh git status in store:', err)
      set({ isLoading: false })
    }
  },

  refreshRemotes: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitGetRemotes) return
    try {
      const remotes = await window.bodhiAPI.gitGetRemotes(rootPath)
      set({ remotes })
    } catch {
      // ignore
    }
  },

  refreshBranches: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitGetBranches) return
    try {
      const branches = await window.bodhiAPI.gitGetBranches(rootPath)
      set({ branches })
    } catch {
      // ignore
    }
  },

  refreshSyncStatus: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitGetSyncStatus) return
    try {
      const syncStatus = await window.bodhiAPI.gitGetSyncStatus(rootPath)
      set({ syncStatus })
    } catch {
      // ignore
    }
  },

  refreshStashes: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStashList) return
    try {
      const stashes = await window.bodhiAPI.gitStashList(rootPath)
      set({ stashes })
    } catch {
      // ignore
    }
  },

  refreshCommitHistory: async (maxCount = 15) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitGetCommitLog) return
    try {
      const commitHistory = await window.bodhiAPI.gitGetCommitLog(rootPath, maxCount)
      set({ commitHistory })
    } catch {
      // ignore
    }
  },

  initRepo: async (defaultBranch = 'main') => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitInit) return false
    set({ isLoading: true })
    try {
      const success = await window.bodhiAPI.gitInit(rootPath, defaultBranch)
      if (success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      set({ isLoading: false })
      return success
    } catch (err: any) {
      set({ isLoading: false, gitError: err.message })
      return false
    }
  },

  createGitignore: async (templateType: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitCreateGitignore) return false
    try {
      const success = await window.bodhiAPI.gitCreateGitignore(rootPath, templateType)
      if (success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      return success
    } catch {
      return false
    }
  },

  stageFile: async (relativePath: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStage) return
    try {
      await window.bodhiAPI.gitStage(rootPath, relativePath)
      await get().refreshGitStatus()
    } catch (err) {
      console.error('Failed to stage file:', err)
    }
  },

  unstageFile: async (relativePath: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitUnstage) return
    try {
      await window.bodhiAPI.gitUnstage(rootPath, relativePath)
      await get().refreshGitStatus()
    } catch (err) {
      console.error('Failed to unstage file:', err)
    }
  },

  stageAll: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStageAll) return
    try {
      await window.bodhiAPI.gitStageAll(rootPath)
      await get().refreshGitStatus()
    } catch (err) {
      console.error('Failed to stage all files:', err)
    }
  },

  unstageAll: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitUnstageAll) return
    try {
      await window.bodhiAPI.gitUnstageAll(rootPath)
      await get().refreshGitStatus()
    } catch (err) {
      console.error('Failed to unstage all files:', err)
    }
  },

  discardChanges: async (relativePath: string, isUntracked = false) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitDiscard) return
    try {
      await window.bodhiAPI.gitDiscard(rootPath, relativePath, isUntracked)
      await get().refreshGitStatus()
      await useWorkspaceStore.getState().refreshTree()
    } catch (err) {
      console.error('Failed to discard changes:', err)
    }
  },

  commitChanges: async () => {
    const { commitMessage, stagedFiles } = get()
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !commitMessage.trim() || !window.bodhiAPI?.gitCommit) return false

    // Auto-stage all changes if no files are specifically staged
    if (stagedFiles.length === 0) {
      await get().stageAll()
    }

    set({ isCommitting: true, gitError: null })

    try {
      const success = await window.bodhiAPI.gitCommit(rootPath, commitMessage.trim())
      if (success) {
        set({ commitMessage: '', fileChurnMap: {} })
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      set({ isCommitting: false })
      return success
    } catch (err: any) {
      console.error('Failed to commit changes:', err)
      set({ isCommitting: false, gitError: err.message })
      return false
    }
  },

  checkoutBranch: async (branchName: string, createNew = false) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !branchName || !window.bodhiAPI?.gitCheckoutBranch) return false
    set({ isLoading: true, gitError: null })
    try {
      const success = await window.bodhiAPI.gitCheckoutBranch(rootPath, branchName, createNew)
      if (success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      set({ isLoading: false })
      return success
    } catch (err: any) {
      set({ isLoading: false, gitError: err.message })
      return false
    }
  },

  createBranch: async (branchName: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !branchName || !window.bodhiAPI?.gitCreateBranch) return false
    try {
      const success = await window.bodhiAPI.gitCreateBranch(rootPath, branchName)
      if (success) {
        await get().refreshBranches()
      }
      return success
    } catch {
      return false
    }
  },

  deleteBranch: async (branchName: string, force = false) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !branchName || !window.bodhiAPI?.gitDeleteBranch) return false
    try {
      const success = await window.bodhiAPI.gitDeleteBranch(rootPath, branchName, force)
      if (success) {
        await get().refreshBranches()
      }
      return success
    } catch {
      return false
    }
  },

  mergeBranch: async (branchName: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !branchName || !window.bodhiAPI?.gitMergeBranch) {
      return { success: false, message: 'Invalid state' }
    }
    set({ isLoading: true })
    try {
      const res = await window.bodhiAPI.gitMergeBranch(rootPath, branchName)
      await get().refreshGitStatus()
      await useWorkspaceStore.getState().refreshTree()
      set({ isLoading: false })
      return res
    } catch (err: any) {
      set({ isLoading: false })
      return { success: false, message: err.message }
    }
  },

  fetch: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitFetch) return false
    try {
      const success = await window.bodhiAPI.gitFetch(rootPath)
      if (success) {
        await get().refreshSyncStatus()
        await get().refreshBranches()
      }
      return success
    } catch {
      return false
    }
  },

  pull: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitPull) {
      return { success: false, message: 'No active workspace' }
    }
    set({ isSyncing: true, gitError: null })
    try {
      const res = await window.bodhiAPI.gitPull(rootPath)
      if (res.success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      } else {
        set({ gitError: res.message })
      }
      set({ isSyncing: false })
      return res
    } catch (err: any) {
      set({ isSyncing: false, gitError: err.message })
      return { success: false, message: err.message }
    }
  },

  push: async (setUpstream = false) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitPush) {
      return { success: false, message: 'No active workspace' }
    }
    set({ isSyncing: true, gitError: null })
    try {
      const res = await window.bodhiAPI.gitPush(rootPath, 'origin', undefined, setUpstream)
      if (res.success) {
        await get().refreshGitStatus()
      } else {
        set({ gitError: res.message })
      }
      set({ isSyncing: false })
      return res
    } catch (err: any) {
      set({ isSyncing: false, gitError: err.message })
      return { success: false, message: err.message }
    }
  },

  syncChanges: async () => {
    const { syncStatus } = get()
    set({ isSyncing: true, gitError: null })
    try {
      // 1. Pull changes
      if (syncStatus.behind > 0) {
        const pullRes = await get().pull()
        if (!pullRes.success) {
          set({ isSyncing: false, gitError: pullRes.message })
          return false
        }
      }

      // 2. Push changes
      const pushRes = await get().push(!syncStatus.upstream)
      set({ isSyncing: false })
      return pushRes.success
    } catch (err: any) {
      set({ isSyncing: false, gitError: err.message })
      return false
    }
  },

  stashSave: async (message?: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStashSave) return false
    try {
      const success = await window.bodhiAPI.gitStashSave(rootPath, message)
      if (success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      return success
    } catch {
      return false
    }
  },

  stashPop: async (index = 0) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStashPop) return false
    try {
      const success = await window.bodhiAPI.gitStashPop(rootPath, index)
      if (success) {
        await get().refreshGitStatus()
        await useWorkspaceStore.getState().refreshTree()
      }
      return success
    } catch {
      return false
    }
  },

  stashDrop: async (index = 0) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitStashDrop) return false
    try {
      const success = await window.bodhiAPI.gitStashDrop(rootPath, index)
      if (success) {
        await get().refreshStashes()
      }
      return success
    } catch {
      return false
    }
  },

  undoLastCommit: async () => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !window.bodhiAPI?.gitUndoCommit) return false
    try {
      const success = await window.bodhiAPI.gitUndoCommit(rootPath)
      if (success) {
        await get().refreshGitStatus()
      }
      return success
    } catch {
      return false
    }
  },

  setCommitMessage: (commitMessage: string) => set({ commitMessage }),

  getFileStatus: (filePath: string) => {
    const { fileStatusMap } = get()
    if (!filePath) return undefined

    const norm = filePath.replace(/\\/g, '/')
    if (fileStatusMap[norm]) return fileStatusMap[norm]
    if (fileStatusMap[filePath]) return fileStatusMap[filePath]

    const rootPath = useWorkspaceStore.getState().rootPath
    if (rootPath) {
      const rel = filePath.replace(rootPath, '').replace(/^[/\\]/, '').replace(/\\/g, '/')
      if (fileStatusMap[rel]) return fileStatusMap[rel]
    }

    return undefined
  },

  getFileChurn: async (relativePath: string) => {
    const rootPath = useWorkspaceStore.getState().rootPath
    if (!rootPath || !relativePath || !window.bodhiAPI?.gitGetFileChurn) return null

    const normRel = relativePath.replace(/\\/g, '/')
    const { fileChurnMap } = get()
    if (fileChurnMap[normRel]) {
      return fileChurnMap[normRel]
    }

    try {
      const res = await window.bodhiAPI.gitGetFileChurn(rootPath, normRel)
      if (res) {
        set((state) => ({
          fileChurnMap: {
            ...state.fileChurnMap,
            [normRel]: res
          }
        }))
      }
      return res
    } catch (err) {
      console.error('Failed to get file churn in store:', err)
      return null
    }
  },

  clearChurnCache: () => set({ fileChurnMap: {} })
}))
