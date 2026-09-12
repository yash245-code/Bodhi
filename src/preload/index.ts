import { contextBridge, ipcRenderer, IpcRendererEvent, webFrame } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import {
  BodhiAPI,
  FileChangeEvent,
  FileNode,
  TerminalDataPayload,
  ShellProfile
} from '../shared/types'

const api: BodhiAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  zoomIn: async (): Promise<number> => {
    const current = webFrame.getZoomFactor()
    const next = Math.min(2.5, Math.round((current + 0.1) * 10) / 10)
    webFrame.setZoomFactor(next)
    return next
  },
  zoomOut: async (): Promise<number> => {
    const current = webFrame.getZoomFactor()
    const next = Math.max(0.5, Math.round((current - 0.1) * 10) / 10)
    webFrame.setZoomFactor(next)
    return next
  },
  resetZoom: async (): Promise<number> => {
    webFrame.setZoomFactor(1.0)
    return 1.0
  },
  getZoomFactor: async (): Promise<number> => {
    return webFrame.getZoomFactor()
  },

  // Dialogs
  openFileDialog: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE),
  openDirectoryDialog: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY),

  // File operations
  readDirectory: (dirPath: string): Promise<FileNode> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIRECTORY, dirPath),
  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath),
  writeFile: (filePath: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),
  createFile: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, filePath),
  createDirectory: (dirPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_DIRECTORY, dirPath),
  renamePath: (oldPath: string, newPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME_PATH, oldPath, newPath),
  deletePath: (targetPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE_PATH, targetPath),

  // File Watcher
  watchDirectory: (dirPath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WATCHER_START, dirPath),
  unwatchDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.WATCHER_STOP),
  onFileChange: (callback: (event: FileChangeEvent) => void) => {
    const subscription = (_event: IpcRendererEvent, changeEvent: FileChangeEvent): void => {
      callback(changeEvent)
    }
    ipcRenderer.on(IPC_CHANNELS.WATCHER_CHANGE, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WATCHER_CHANGE, subscription)
    }
  },

  // Terminal
  createTerminal: (id: string, cwd?: string, shellType?: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, id, cwd, shellType),
  writeTerminal: (id: string, data: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_WRITE, id, data),
  resizeTerminal: (id: string, cols: number, rows: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_RESIZE, id, cols, rows),
  killTerminal: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_KILL, id),
  onTerminalData: (callback: (payload: TerminalDataPayload) => void) => {
    const subscription = (_event: IpcRendererEvent, payload: TerminalDataPayload): void => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.TERMINAL_DATA, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_DATA, subscription)
    }
  },
  onTerminalExit: (callback: (payload: { id: string; exitCode: number }) => void) => {
    const subscription = (
      _event: IpcRendererEvent,
      payload: { id: string; exitCode: number }
    ): void => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.TERMINAL_EXIT, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_EXIT, subscription)
    }
  },
  terminalGetAvailableShells: (): Promise<ShellProfile[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_GET_AVAILABLE_SHELLS),

  // Search & Replace
  searchWorkspace: (workspacePath, query, options) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEARCH_WORKSPACE, workspacePath, query, options),
  replaceInFile: (filePath, query, replaceText, options) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SEARCH_REPLACE_FILE,
      filePath,
      query,
      replaceText,
      options
    ),
  replaceAll: (workspacePath, query, replaceText, options) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SEARCH_REPLACE_ALL,
      workspacePath,
      query,
      replaceText,
      options
    ),

  // Settings
  openSettingsWindow: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_OPEN),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  updateSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, settings),
  onSettingsChanged: (callback) => {
    const subscription = (_event: IpcRendererEvent, updatedSettings: any): void => {
      callback(updatedSettings)
    }
    ipcRenderer.on(IPC_CHANNELS.SETTINGS_CHANGED, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_CHANGED, subscription)
    }
  },

  // Git Source Control
  gitGetStatus: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STATUS, workspacePath),
  gitGetBranch: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_BRANCH, workspacePath),
  gitGetFileAtHead: (workspacePath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_FILE_AT_HEAD, workspacePath, relativePath),
  gitGetDiff: (workspacePath: string, relativePath: string, staged?: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_DIFF, workspacePath, relativePath, staged),
  gitStage: (workspacePath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STAGE, workspacePath, relativePath),
  gitUnstage: (workspacePath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_UNSTAGE, workspacePath, relativePath),
  gitStageAll: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STAGE_ALL, workspacePath),
  gitUnstageAll: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_UNSTAGE_ALL, workspacePath),
  gitDiscard: (workspacePath: string, relativePath: string, isUntracked?: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_DISCARD, workspacePath, relativePath, isUntracked),
  gitCommit: (workspacePath: string, message: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, workspacePath, message),
  gitGetFileChurn: (workspacePath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_FILE_CHURN, workspacePath, relativePath),
  gitInit: (workspacePath: string, defaultBranch?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_INIT, workspacePath, defaultBranch),
  gitCreateGitignore: (workspacePath: string, templateType: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_GITIGNORE, workspacePath, templateType),
  gitGetRemotes: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_REMOTES, workspacePath),
  gitAddRemote: (workspacePath: string, name: string, url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_ADD_REMOTE, workspacePath, name, url),
  gitRemoveRemote: (workspacePath: string, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_REMOVE_REMOTE, workspacePath, name),
  gitSetRemoteUrl: (workspacePath: string, name: string, url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_SET_REMOTE_URL, workspacePath, name, url),
  gitGetBranches: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_BRANCHES, workspacePath),
  gitCheckoutBranch: (workspacePath: string, branchName: string, createNew?: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_CHECKOUT_BRANCH, workspacePath, branchName, createNew),
  gitCreateBranch: (workspacePath: string, branchName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_BRANCH, workspacePath, branchName),
  gitDeleteBranch: (workspacePath: string, branchName: string, force?: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_DELETE_BRANCH, workspacePath, branchName, force),
  gitMergeBranch: (workspacePath: string, branchName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_MERGE_BRANCH, workspacePath, branchName),
  gitFetch: (workspacePath: string, remote?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_FETCH, workspacePath, remote),
  gitPull: (workspacePath: string, remote?: string, branch?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_PULL, workspacePath, remote, branch),
  gitPush: (workspacePath: string, remote?: string, branch?: string, setUpstream?: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_PUSH, workspacePath, remote, branch, setUpstream),
  gitGetSyncStatus: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_SYNC_STATUS, workspacePath),
  gitStashSave: (workspacePath: string, message?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_SAVE, workspacePath, message),
  gitStashPop: (workspacePath: string, index?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_POP, workspacePath, index),
  gitStashList: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_LIST, workspacePath),
  gitStashDrop: (workspacePath: string, index?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_DROP, workspacePath, index),
  gitGetCommitLog: (workspacePath: string, maxCount?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_COMMIT_LOG, workspacePath, maxCount),
  gitUndoCommit: (workspacePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GIT_UNDO_COMMIT, workspacePath),

  // GitHub Integration
  githubValidateToken: (token: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_VALIDATE_TOKEN, token),
  githubPublishRepo: (workspacePath, options, token) =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_PUBLISH_REPO, workspacePath, options, token),
  githubGetUserRepos: (token) =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_GET_USER_REPOS, token),
  githubGetStoredToken: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_GET_STORED_TOKEN),
  githubSetStoredToken: (token: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_SET_STORED_TOKEN, token),
  githubClearStoredToken: () =>
    ipcRenderer.invoke(IPC_CHANNELS.GITHUB_CLEAR_STORED_TOKEN),

  // User Authentication
  authLoginGoogle: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN_GOOGLE),
  authLogout: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
  authGetCurrentUser: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_CURRENT_USER),
  onAuthStateChanged: (callback) => {
    const subscription = (_event: IpcRendererEvent, user: any): void => {
      callback(user)
    }
    ipcRenderer.on(IPC_CHANNELS.AUTH_STATE_CHANGED, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.AUTH_STATE_CHANGED, subscription)
    }
  },

  // Extensions
  extensionsGetInstalled: () =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_INSTALLED),
  extensionsSearchMarketplace: (query, category) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_SEARCH_MARKETPLACE, query, category),
  extensionsInstallFromMarketplace: (extension) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_MARKETPLACE, extension),
  extensionsInstallFromVsix: (filePath) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_VSIX, filePath),
  extensionsUninstall: (extensionId) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_UNINSTALL, extensionId),
  extensionsToggleEnable: (extensionId, enabled) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_TOGGLE_ENABLE, extensionId, enabled),
  extensionsGetSnippets: () =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_SNIPPETS),
  extensionsGetThemes: () =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_THEMES),
  extensionsOpenVsixDialog: () =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_OPEN_VSIX_DIALOG),
  openExtensionsWindow: () =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_OPEN_WINDOW),
  extensionsGetReadme: (extensionId, namespace, name) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_README, extensionId, namespace, name),
  extensionsGetSnippetsForExt: (extensionId) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_EXT_SNIPPETS, extensionId),

  // AI Intelligence
  aiGenerateCompletion: (req) =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_GENERATE_COMPLETION, req),
  aiGenerateEdit: (req) =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_GENERATE_EDIT, req),
  aiChat: (req) =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT, req),
  aiTestConnection: (provider, apiKey) =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_TEST_CONNECTION, provider, apiKey),

  // PostgreSQL Database & Cloud Sync
  dbTestConnection: (connectionString: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_TEST_CONNECTION, connectionString),
  dbConnect: (connectionString: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_CONNECT, connectionString),
  dbDisconnect: () =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_DISCONNECT),
  dbGetStatus: () =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_GET_STATUS),
  dbSyncSettings: (userId: string, settings: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_SYNC_SETTINGS, userId, settings),
  dbGetSettings: (userId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SETTINGS, userId),
  dbSaveSnippet: (userId: string, snippet: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SNIPPET, userId, snippet),
  dbGetSnippets: (userId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SNIPPETS, userId),
  dbSaveAiChat: (userId: string, chat: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_AI_CHAT, userId, chat),
  dbGetAiChats: (userId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_GET_AI_CHATS, userId),
  onDbStatusChanged: (callback) => {
    const subscription = (_event: IpcRendererEvent, status: any): void => {
      callback(status)
    }
    ipcRenderer.on(IPC_CHANNELS.DB_STATUS_CHANGED, subscription)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.DB_STATUS_CHANGED, subscription)
    }
  }
}

try {
  contextBridge.exposeInMainWorld('bodhiAPI', api)
} catch (error) {
  console.error('Failed to expose bodhiAPI via contextBridge', error)
}

