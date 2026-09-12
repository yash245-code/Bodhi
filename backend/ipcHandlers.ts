import { ipcMain, BrowserWindow, app } from 'electron'
import * as path from 'path'
import * as fsSync from 'fs'
import * as fs from 'fs/promises'
import { IPC_CHANNELS } from '../shared/constants'
import { fileService } from './services/fileService'
import { terminalService } from './services/terminalService'
import { SearchService } from './services/searchService'
import { gitService } from './services/gitService'
import { githubService } from './services/githubService'
import { authService } from './services/authService'
import { postgresService } from './services/postgresService'
import { extensionService } from './services/extensionService'
import { aiService } from './services/aiService'
import {
  SearchOptions,
  MarketplaceExtension,
  AICompletionRequest,
  AIEditRequest,
  AIChatRequest,
  GitHubPublishOptions
} from '../shared/types'

const searchService = new SearchService()

function getSettingsFilePath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

function loadPersistedSettings(): Record<string, unknown> {
  try {
    const filePath = getSettingsFilePath()
    if (fsSync.existsSync(filePath)) {
      const raw = fsSync.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn('[IPC] Failed to read persisted settings.json:', err)
  }
  return {}
}

async function savePersistedSettings(settings: Record<string, unknown>): Promise<void> {
  try {
    const filePath = getSettingsFilePath()
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (err) {
    console.error('[IPC] Failed to save settings.json:', err)
  }
}

let storedSettings: Record<string, unknown> = loadPersistedSettings()

export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  openSettingsWindow?: () => BrowserWindow,
  openExtensionsWindow?: () => BrowserWindow
): void {
  fileService.setMainWindow(mainWindow)
  terminalService.setMainWindow(mainWindow)

  // Window Controls (Target the specific sender window)
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow
    if (win && !win.isDestroyed()) {
      win.minimize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow
    if (win && !win.isDestroyed()) {
      win.close()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow
    return win && !win.isDestroyed() ? win.isMaximized() : false
  })

  // Settings Handlers
  ipcMain.handle(IPC_CHANNELS.SETTINGS_OPEN, () => {
    if (openSettingsWindow) {
      openSettingsWindow()
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return storedSettings
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_, partialSettings: Record<string, unknown>) => {
    storedSettings = { ...storedSettings, ...partialSettings }
    await savePersistedSettings(storedSettings)
    // Broadcast to all windows
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, partialSettings)
      }
    })
  })

  // Native Dialogs
  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async () => {
    return await fileService.openFileDialog()
  })

  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY, async () => {
    return await fileService.openDirectoryDialog()
  })

  // File Operations
  ipcMain.handle(IPC_CHANNELS.FS_READ_DIRECTORY, async (_, dirPath: string) => {
    return await fileService.readDirectory(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_, filePath: string) => {
    return await fileService.readFile(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_, filePath: string, content: string) => {
    return await fileService.writeFile(filePath, content)
  })

  ipcMain.handle(IPC_CHANNELS.FS_CREATE_FILE, async (_, filePath: string) => {
    return await fileService.createFile(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.FS_CREATE_DIRECTORY, async (_, dirPath: string) => {
    return await fileService.createDirectory(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.FS_RENAME_PATH, async (_, oldPath: string, newPath: string) => {
    return await fileService.renamePath(oldPath, newPath)
  })

  ipcMain.handle(IPC_CHANNELS.FS_DELETE_PATH, async (_, targetPath: string) => {
    return await fileService.deletePath(targetPath)
  })

  // File Watcher
  ipcMain.handle(IPC_CHANNELS.WATCHER_START, async (_, dirPath: string) => {
    fileService.startWatcher(dirPath)
  })

  ipcMain.handle(IPC_CHANNELS.WATCHER_STOP, async () => {
    fileService.stopWatcher()
  })

  // Terminal PTY
  ipcMain.handle(
    IPC_CHANNELS.TERMINAL_CREATE,
    async (_, id: string, cwd?: string, shellType?: string) => {
      return await terminalService.createTerminal(id, cwd, shellType)
    }
  )

  ipcMain.handle(IPC_CHANNELS.TERMINAL_WRITE, (_, id: string, data: string) => {
    terminalService.writeTerminal(id, data)
  })

  ipcMain.handle(IPC_CHANNELS.TERMINAL_RESIZE, (_, id: string, cols: number, rows: number) => {
    terminalService.resizeTerminal(id, cols, rows)
  })

  ipcMain.handle(IPC_CHANNELS.TERMINAL_KILL, (_, id: string) => {
    terminalService.killTerminal(id)
  })

  ipcMain.handle(IPC_CHANNELS.TERMINAL_GET_AVAILABLE_SHELLS, () => {
    return terminalService.getAvailableShells()
  })

  // Workspace Search & Replace
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_WORKSPACE,
    async (_, workspacePath: string, query: string, options?: SearchOptions) => {
      return await searchService.searchWorkspace(workspacePath, query, options)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SEARCH_REPLACE_FILE,
    async (
      _,
      filePath: string,
      query: string,
      replaceText: string,
      options?: SearchOptions
    ) => {
      return await searchService.replaceInFile(filePath, query, replaceText, options)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SEARCH_REPLACE_ALL,
    async (
      _,
      workspacePath: string,
      query: string,
      replaceText: string,
      options?: SearchOptions
    ) => {
      return await searchService.replaceAll(workspacePath, query, replaceText, options)
    }
  )

  // Git Handlers
  ipcMain.handle(IPC_CHANNELS.GIT_STATUS, async (_, workspacePath: string) => {
    return await gitService.getStatus(workspacePath)
  })

  ipcMain.handle(IPC_CHANNELS.GIT_BRANCH, async (_, workspacePath: string) => {
    return await gitService.getBranch(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_GET_FILE_AT_HEAD,
    async (_, workspacePath: string, relativePath: string) => {
      return await gitService.getFileAtHead(workspacePath, relativePath)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_GET_DIFF,
    async (_, workspacePath: string, relativePath: string, staged?: boolean) => {
      return await gitService.getDiff(workspacePath, relativePath, staged)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_STAGE,
    async (_, workspacePath: string, relativePath: string) => {
      return await gitService.stageFile(workspacePath, relativePath)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE,
    async (_, workspacePath: string, relativePath: string) => {
      return await gitService.unstageFile(workspacePath, relativePath)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_STAGE_ALL, async (_, workspacePath: string) => {
    return await gitService.stageAll(workspacePath)
  })

  ipcMain.handle(IPC_CHANNELS.GIT_UNSTAGE_ALL, async (_, workspacePath: string) => {
    return await gitService.unstageAll(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_DISCARD,
    async (_, workspacePath: string, relativePath: string, isUntracked?: boolean) => {
      return await gitService.discardFile(workspacePath, relativePath, isUntracked)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_COMMIT,
    async (_, workspacePath: string, message: string) => {
      return await gitService.commit(workspacePath, message)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_GET_FILE_CHURN,
    async (_, workspacePath: string, relativePath: string) => {
      return await gitService.getFileChurn(workspacePath, relativePath)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_INIT,
    async (_, workspacePath: string, defaultBranch?: string) => {
      return await gitService.initRepo(workspacePath, defaultBranch)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_CREATE_GITIGNORE,
    async (_, workspacePath: string, templateType: string) => {
      return await gitService.createGitignore(workspacePath, templateType)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_GET_REMOTES, async (_, workspacePath: string) => {
    return await gitService.getRemotes(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_ADD_REMOTE,
    async (_, workspacePath: string, name: string, url: string) => {
      return await gitService.addRemote(workspacePath, name, url)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_REMOVE_REMOTE,
    async (_, workspacePath: string, name: string) => {
      return await gitService.removeRemote(workspacePath, name)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_SET_REMOTE_URL,
    async (_, workspacePath: string, name: string, url: string) => {
      return await gitService.setRemoteUrl(workspacePath, name, url)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCHES, async (_, workspacePath: string) => {
    return await gitService.getBranches(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_CHECKOUT_BRANCH,
    async (_, workspacePath: string, branchName: string, createNew?: boolean) => {
      return await gitService.checkoutBranch(workspacePath, branchName, createNew)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_CREATE_BRANCH,
    async (_, workspacePath: string, branchName: string) => {
      return await gitService.createBranch(workspacePath, branchName)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_DELETE_BRANCH,
    async (_, workspacePath: string, branchName: string, force?: boolean) => {
      return await gitService.deleteBranch(workspacePath, branchName, force)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_MERGE_BRANCH,
    async (_, workspacePath: string, branchName: string) => {
      return await gitService.mergeBranch(workspacePath, branchName)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_FETCH,
    async (_, workspacePath: string, remote?: string) => {
      return await gitService.fetch(workspacePath, remote)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_PULL,
    async (_, workspacePath: string, remote?: string, branch?: string) => {
      return await gitService.pull(workspacePath, remote, branch)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_PUSH,
    async (_, workspacePath: string, remote?: string, branch?: string, setUpstream?: boolean) => {
      return await gitService.push(workspacePath, remote, branch, setUpstream)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_GET_SYNC_STATUS, async (_, workspacePath: string) => {
    return await gitService.getSyncStatus(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_SAVE,
    async (_, workspacePath: string, message?: string) => {
      return await gitService.stashSave(workspacePath, message)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_POP,
    async (_, workspacePath: string, index?: number) => {
      return await gitService.stashPop(workspacePath, index)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_STASH_LIST, async (_, workspacePath: string) => {
    return await gitService.stashList(workspacePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_DROP,
    async (_, workspacePath: string, index?: number) => {
      return await gitService.stashDrop(workspacePath, index)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.GIT_GET_COMMIT_LOG,
    async (_, workspacePath: string, maxCount?: number) => {
      return await gitService.getCommitLog(workspacePath, maxCount)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GIT_UNDO_COMMIT, async (_, workspacePath: string) => {
    return await gitService.undoLastCommit(workspacePath)
  })

  // GitHub Handlers
  ipcMain.handle(IPC_CHANNELS.GITHUB_VALIDATE_TOKEN, async (_, token: string) => {
    return await githubService.validateToken(token)
  })

  ipcMain.handle(
    IPC_CHANNELS.GITHUB_PUBLISH_REPO,
    async (_, workspacePath: string, options: GitHubPublishOptions, token?: string) => {
      return await githubService.publishRepository(workspacePath, options, token)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GITHUB_GET_USER_REPOS, async (_, token?: string) => {
    return await githubService.getUserRepositories(token)
  })

  ipcMain.handle(IPC_CHANNELS.GITHUB_GET_STORED_TOKEN, async () => {
    return await githubService.getStoredToken()
  })

  ipcMain.handle(IPC_CHANNELS.GITHUB_SET_STORED_TOKEN, async (_, token: string) => {
    return await githubService.setStoredToken(token)
  })

  ipcMain.handle(IPC_CHANNELS.GITHUB_CLEAR_STORED_TOKEN, async () => {
    return await githubService.clearStoredToken()
  })

  // Auth Handlers
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN_GOOGLE, async () => {
    return await authService.loginWithGoogle()
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, async () => {
    return await authService.logout()
  })

  ipcMain.handle(IPC_CHANNELS.AUTH_GET_CURRENT_USER, async () => {
    return await authService.getCurrentUser()
  })

  // PostgreSQL Database Handlers
  ipcMain.handle(IPC_CHANNELS.DB_TEST_CONNECTION, async (_, connectionString: string) => {
    return await postgresService.testConnection(connectionString)
  })

  ipcMain.handle(IPC_CHANNELS.DB_CONNECT, async (_, connectionString: string) => {
    return await postgresService.connect(connectionString)
  })

  ipcMain.handle(IPC_CHANNELS.DB_DISCONNECT, async () => {
    return await postgresService.disconnect()
  })

  ipcMain.handle(IPC_CHANNELS.DB_GET_STATUS, async () => {
    return postgresService.getStatus()
  })

  ipcMain.handle(
    IPC_CHANNELS.DB_SYNC_SETTINGS,
    async (_, userId: string, settings: any) => {
      return await postgresService.syncSettings(userId, settings)
    }
  )

  ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async (_, userId: string) => {
    return await postgresService.getSettings(userId)
  })

  ipcMain.handle(
    IPC_CHANNELS.DB_SAVE_SNIPPET,
    async (_, userId: string, snippet: any) => {
      return await postgresService.saveSnippet(userId, snippet)
    }
  )

  ipcMain.handle(IPC_CHANNELS.DB_GET_SNIPPETS, async (_, userId: string) => {
    return await postgresService.getSnippets(userId)
  })

  ipcMain.handle(
    IPC_CHANNELS.DB_SAVE_AI_CHAT,
    async (_, userId: string, chat: any) => {
      return await postgresService.saveAIChat(userId, chat)
    }
  )

  ipcMain.handle(IPC_CHANNELS.DB_GET_AI_CHATS, async (_, userId: string) => {
    return await postgresService.getAIChats(userId)
  })

  // Extensions Handlers
  ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_INSTALLED, async () => {
    return await extensionService.getInstalledExtensions()
  })

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_SEARCH_MARKETPLACE,
    async (_, query: string, category?: string) => {
      return await extensionService.searchMarketplace(query, category)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_MARKETPLACE,
    async (_, extension: MarketplaceExtension) => {
      return await extensionService.installFromMarketplace(extension)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_VSIX,
    async (_, filePath?: string) => {
      return await extensionService.installFromVsix(filePath)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_UNINSTALL,
    async (_, extensionId: string) => {
      return await extensionService.uninstallExtension(extensionId)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_TOGGLE_ENABLE,
    async (_, extensionId: string, enabled: boolean) => {
      return await extensionService.toggleExtension(extensionId, enabled)
    }
  )

  ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_SNIPPETS, async () => {
    return await extensionService.getExtensionSnippets()
  })

  ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_THEMES, async () => {
    return await extensionService.getExtensionThemes()
  })

  ipcMain.handle(IPC_CHANNELS.EXTENSIONS_OPEN_VSIX_DIALOG, async () => {
    return await extensionService.openVsixDialog()
  })

  ipcMain.handle(IPC_CHANNELS.EXTENSIONS_OPEN_WINDOW, () => {
    if (openExtensionsWindow) {
      openExtensionsWindow()
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_GET_README,
    async (_, extensionId: string, namespace?: string, name?: string) => {
      return await extensionService.getReadme(extensionId, namespace, name)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_GET_EXT_SNIPPETS,
    async (_, extensionId: string) => {
      return await extensionService.getExtensionSnippetsForExt(extensionId)
    }
  )

  // AI Intelligence Handlers
  ipcMain.handle(
    IPC_CHANNELS.AI_GENERATE_COMPLETION,
    async (_, req: AICompletionRequest) => {
      const mergedReq: AICompletionRequest = {
        ...req,
        settings: { ...(storedSettings as any), ...req.settings }
      }
      return await aiService.generateCompletion(mergedReq)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.AI_GENERATE_EDIT,
    async (_, req: AIEditRequest) => {
      const mergedReq: AIEditRequest = {
        ...req,
        settings: { ...(storedSettings as any), ...req.settings }
      }
      return await aiService.generateEdit(mergedReq)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.AI_CHAT,
    async (_, req: AIChatRequest) => {
      const mergedReq: AIChatRequest = {
        ...req,
        settings: { ...(storedSettings as any), ...req.settings }
      }
      return await aiService.chat(mergedReq)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.AI_TEST_CONNECTION,
    async (_, provider?: string, apiKey?: string) => {
      const resolvedProvider = provider || (storedSettings.aiModelProvider as string)
      const resolvedKey = apiKey || (storedSettings.aiApiKey as string)
      return await aiService.testConnection(resolvedProvider, resolvedKey)
    }
  )
}

