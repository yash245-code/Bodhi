"use strict";
const electron = require("electron");
const IPC_CHANNELS = {
  // Window
  WINDOW_MINIMIZE: "BODHI:window:minimize",
  WINDOW_MAXIMIZE: "BODHI:window:maximize",
  WINDOW_CLOSE: "BODHI:window:close",
  WINDOW_IS_MAXIMIZED: "BODHI:window:isMaximized",
  // Dialogs
  DIALOG_OPEN_FILE: "BODHI:dialog:openFile",
  DIALOG_OPEN_DIRECTORY: "BODHI:dialog:openDirectory",
  // File system
  FS_READ_DIRECTORY: "BODHI:fs:readDirectory",
  FS_READ_FILE: "BODHI:fs:readFile",
  FS_WRITE_FILE: "BODHI:fs:writeFile",
  FS_CREATE_FILE: "BODHI:fs:createFile",
  FS_CREATE_DIRECTORY: "BODHI:fs:createDirectory",
  FS_RENAME_PATH: "BODHI:fs:renamePath",
  FS_DELETE_PATH: "BODHI:fs:deletePath",
  // Watcher
  WATCHER_START: "BODHI:watcher:start",
  WATCHER_STOP: "BODHI:watcher:stop",
  WATCHER_CHANGE: "BODHI:watcher:change",
  // Terminal
  TERMINAL_CREATE: "BODHI:terminal:create",
  TERMINAL_WRITE: "BODHI:terminal:write",
  TERMINAL_RESIZE: "BODHI:terminal:resize",
  TERMINAL_KILL: "BODHI:terminal:kill",
  TERMINAL_DATA: "BODHI:terminal:data",
  TERMINAL_EXIT: "BODHI:terminal:exit",
  TERMINAL_GET_AVAILABLE_SHELLS: "BODHI:terminal:getAvailableShells",
  // Search & Replace
  SEARCH_WORKSPACE: "BODHI:search:workspace",
  SEARCH_REPLACE_FILE: "BODHI:search:replaceFile",
  SEARCH_REPLACE_ALL: "BODHI:search:replaceAll",
  // Settings
  SETTINGS_OPEN: "BODHI:settings:open",
  SETTINGS_GET: "BODHI:settings:get",
  SETTINGS_UPDATE: "BODHI:settings:update",
  SETTINGS_CHANGED: "BODHI:settings:changed",
  // Git
  GIT_STATUS: "BODHI:git:status",
  GIT_BRANCH: "BODHI:git:branch",
  GIT_GET_FILE_AT_HEAD: "BODHI:git:getFileAtHead",
  GIT_GET_DIFF: "BODHI:git:getDiff",
  GIT_STAGE: "BODHI:git:stage",
  GIT_UNSTAGE: "BODHI:git:unstage",
  GIT_STAGE_ALL: "BODHI:git:stageAll",
  GIT_UNSTAGE_ALL: "BODHI:git:unstageAll",
  GIT_DISCARD: "BODHI:git:discard",
  GIT_COMMIT: "BODHI:git:commit",
  GIT_GET_FILE_CHURN: "BODHI:git:getFileChurn",
  GIT_INIT: "BODHI:git:init",
  GIT_CREATE_GITIGNORE: "BODHI:git:createGitignore",
  GIT_GET_REMOTES: "BODHI:git:getRemotes",
  GIT_ADD_REMOTE: "BODHI:git:addRemote",
  GIT_REMOVE_REMOTE: "BODHI:git:removeRemote",
  GIT_SET_REMOTE_URL: "BODHI:git:setRemoteUrl",
  GIT_GET_BRANCHES: "BODHI:git:getBranches",
  GIT_CHECKOUT_BRANCH: "BODHI:git:checkoutBranch",
  GIT_CREATE_BRANCH: "BODHI:git:createBranch",
  GIT_DELETE_BRANCH: "BODHI:git:deleteBranch",
  GIT_MERGE_BRANCH: "BODHI:git:mergeBranch",
  GIT_FETCH: "BODHI:git:fetch",
  GIT_PULL: "BODHI:git:pull",
  GIT_PUSH: "BODHI:git:push",
  GIT_GET_SYNC_STATUS: "BODHI:git:getSyncStatus",
  GIT_STASH_SAVE: "BODHI:git:stashSave",
  GIT_STASH_POP: "BODHI:git:stashPop",
  GIT_STASH_LIST: "BODHI:git:stashList",
  GIT_STASH_DROP: "BODHI:git:stashDrop",
  GIT_GET_COMMIT_LOG: "BODHI:git:getCommitLog",
  GIT_UNDO_COMMIT: "BODHI:git:undoCommit",
  // GitHub Integration & Cloud Publishing
  GITHUB_VALIDATE_TOKEN: "BODHI:github:validateToken",
  GITHUB_PUBLISH_REPO: "BODHI:github:publishRepo",
  GITHUB_GET_USER_REPOS: "BODHI:github:getUserRepos",
  GITHUB_GET_STORED_TOKEN: "BODHI:github:getStoredToken",
  GITHUB_SET_STORED_TOKEN: "BODHI:github:setStoredToken",
  GITHUB_CLEAR_STORED_TOKEN: "BODHI:github:clearStoredToken",
  // User Authentication (Google OAuth & Profile)
  AUTH_LOGIN_GOOGLE: "BODHI:auth:loginGoogle",
  AUTH_LOGOUT: "BODHI:auth:logout",
  AUTH_GET_CURRENT_USER: "BODHI:auth:getCurrentUser",
  AUTH_STATE_CHANGED: "BODHI:auth:stateChanged",
  // Extensions
  EXTENSIONS_GET_INSTALLED: "BODHI:extensions:getInstalled",
  EXTENSIONS_SEARCH_MARKETPLACE: "BODHI:extensions:searchMarketplace",
  EXTENSIONS_INSTALL_FROM_MARKETPLACE: "BODHI:extensions:installFromMarketplace",
  EXTENSIONS_INSTALL_FROM_VSIX: "BODHI:extensions:installFromVsix",
  EXTENSIONS_UNINSTALL: "BODHI:extensions:uninstall",
  EXTENSIONS_TOGGLE_ENABLE: "BODHI:extensions:toggleEnable",
  EXTENSIONS_GET_SNIPPETS: "BODHI:extensions:getSnippets",
  EXTENSIONS_GET_THEMES: "BODHI:extensions:getThemes",
  EXTENSIONS_OPEN_VSIX_DIALOG: "BODHI:extensions:openVsixDialog",
  EXTENSIONS_OPEN_WINDOW: "BODHI:extensions:openWindow",
  EXTENSIONS_GET_README: "BODHI:extensions:getReadme",
  EXTENSIONS_GET_EXT_SNIPPETS: "BODHI:extensions:getExtSnippets",
  // AI Intelligence
  AI_GENERATE_COMPLETION: "BODHI:ai:generateCompletion",
  AI_GENERATE_EDIT: "BODHI:ai:generateEdit",
  AI_CHAT: "BODHI:ai:chat",
  AI_TEST_CONNECTION: "BODHI:ai:testConnection",
  // PostgreSQL Database & Cloud Sync
  DB_TEST_CONNECTION: "BODHI:db:testConnection",
  DB_CONNECT: "BODHI:db:connect",
  DB_DISCONNECT: "BODHI:db:disconnect",
  DB_GET_STATUS: "BODHI:db:getStatus",
  DB_SYNC_SETTINGS: "BODHI:db:syncSettings",
  DB_GET_SETTINGS: "BODHI:db:getSettings",
  DB_SAVE_SNIPPET: "BODHI:db:saveSnippet",
  DB_GET_SNIPPETS: "BODHI:db:getSnippets",
  DB_SAVE_AI_CHAT: "BODHI:db:saveAiChat",
  DB_GET_AI_CHATS: "BODHI:db:getAiChats",
  DB_STATUS_CHANGED: "BODHI:db:statusChanged"
};
const api = {
  // Window controls
  minimizeWindow: () => electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => electron.ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  zoomIn: async () => {
    const current = electron.webFrame.getZoomFactor();
    const next = Math.min(2.5, Math.round((current + 0.1) * 10) / 10);
    electron.webFrame.setZoomFactor(next);
    return next;
  },
  zoomOut: async () => {
    const current = electron.webFrame.getZoomFactor();
    const next = Math.max(0.5, Math.round((current - 0.1) * 10) / 10);
    electron.webFrame.setZoomFactor(next);
    return next;
  },
  resetZoom: async () => {
    electron.webFrame.setZoomFactor(1);
    return 1;
  },
  getZoomFactor: async () => {
    return electron.webFrame.getZoomFactor();
  },
  // Dialogs
  openFileDialog: () => electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE),
  openDirectoryDialog: () => electron.ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY),
  // File operations
  readDirectory: (dirPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIRECTORY, dirPath),
  readFile: (filePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath),
  writeFile: (filePath, content) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),
  createFile: (filePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, filePath),
  createDirectory: (dirPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_DIRECTORY, dirPath),
  renamePath: (oldPath, newPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME_PATH, oldPath, newPath),
  deletePath: (targetPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE_PATH, targetPath),
  // File Watcher
  watchDirectory: (dirPath) => electron.ipcRenderer.invoke(IPC_CHANNELS.WATCHER_START, dirPath),
  unwatchDirectory: () => electron.ipcRenderer.invoke(IPC_CHANNELS.WATCHER_STOP),
  onFileChange: (callback) => {
    const subscription = (_event, changeEvent) => {
      callback(changeEvent);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.WATCHER_CHANGE, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.WATCHER_CHANGE, subscription);
    };
  },
  // Terminal
  createTerminal: (id, cwd, shellType) => electron.ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, id, cwd, shellType),
  writeTerminal: (id, data) => electron.ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_WRITE, id, data),
  resizeTerminal: (id, cols, rows) => electron.ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_RESIZE, id, cols, rows),
  killTerminal: (id) => electron.ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_KILL, id),
  onTerminalData: (callback) => {
    const subscription = (_event, payload) => {
      callback(payload);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.TERMINAL_DATA, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_DATA, subscription);
    };
  },
  onTerminalExit: (callback) => {
    const subscription = (_event, payload) => {
      callback(payload);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.TERMINAL_EXIT, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_EXIT, subscription);
    };
  },
  terminalGetAvailableShells: () => electron.ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_GET_AVAILABLE_SHELLS),
  // Search & Replace
  searchWorkspace: (workspacePath, query, options) => electron.ipcRenderer.invoke(IPC_CHANNELS.SEARCH_WORKSPACE, workspacePath, query, options),
  replaceInFile: (filePath, query, replaceText, options) => electron.ipcRenderer.invoke(
    IPC_CHANNELS.SEARCH_REPLACE_FILE,
    filePath,
    query,
    replaceText,
    options
  ),
  replaceAll: (workspacePath, query, replaceText, options) => electron.ipcRenderer.invoke(
    IPC_CHANNELS.SEARCH_REPLACE_ALL,
    workspacePath,
    query,
    replaceText,
    options
  ),
  // Settings
  openSettingsWindow: () => electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_OPEN),
  getSettings: () => electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  updateSettings: (settings) => electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, settings),
  onSettingsChanged: (callback) => {
    const subscription = (_event, updatedSettings) => {
      callback(updatedSettings);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.SETTINGS_CHANGED, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_CHANGED, subscription);
    };
  },
  // Git Source Control
  gitGetStatus: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STATUS, workspacePath),
  gitGetBranch: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_BRANCH, workspacePath),
  gitGetFileAtHead: (workspacePath, relativePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_FILE_AT_HEAD, workspacePath, relativePath),
  gitGetDiff: (workspacePath, relativePath, staged) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_DIFF, workspacePath, relativePath, staged),
  gitStage: (workspacePath, relativePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STAGE, workspacePath, relativePath),
  gitUnstage: (workspacePath, relativePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_UNSTAGE, workspacePath, relativePath),
  gitStageAll: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STAGE_ALL, workspacePath),
  gitUnstageAll: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_UNSTAGE_ALL, workspacePath),
  gitDiscard: (workspacePath, relativePath, isUntracked) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_DISCARD, workspacePath, relativePath, isUntracked),
  gitCommit: (workspacePath, message) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, workspacePath, message),
  gitGetFileChurn: (workspacePath, relativePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_FILE_CHURN, workspacePath, relativePath),
  gitInit: (workspacePath, defaultBranch) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_INIT, workspacePath, defaultBranch),
  gitCreateGitignore: (workspacePath, templateType) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_GITIGNORE, workspacePath, templateType),
  gitGetRemotes: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_REMOTES, workspacePath),
  gitAddRemote: (workspacePath, name, url) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_ADD_REMOTE, workspacePath, name, url),
  gitRemoveRemote: (workspacePath, name) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_REMOVE_REMOTE, workspacePath, name),
  gitSetRemoteUrl: (workspacePath, name, url) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_SET_REMOTE_URL, workspacePath, name, url),
  gitGetBranches: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_BRANCHES, workspacePath),
  gitCheckoutBranch: (workspacePath, branchName, createNew) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_CHECKOUT_BRANCH, workspacePath, branchName, createNew),
  gitCreateBranch: (workspacePath, branchName) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_BRANCH, workspacePath, branchName),
  gitDeleteBranch: (workspacePath, branchName, force) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_DELETE_BRANCH, workspacePath, branchName, force),
  gitMergeBranch: (workspacePath, branchName) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_MERGE_BRANCH, workspacePath, branchName),
  gitFetch: (workspacePath, remote) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_FETCH, workspacePath, remote),
  gitPull: (workspacePath, remote, branch) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_PULL, workspacePath, remote, branch),
  gitPush: (workspacePath, remote, branch, setUpstream) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_PUSH, workspacePath, remote, branch, setUpstream),
  gitGetSyncStatus: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_SYNC_STATUS, workspacePath),
  gitStashSave: (workspacePath, message) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_SAVE, workspacePath, message),
  gitStashPop: (workspacePath, index) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_POP, workspacePath, index),
  gitStashList: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_LIST, workspacePath),
  gitStashDrop: (workspacePath, index) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_STASH_DROP, workspacePath, index),
  gitGetCommitLog: (workspacePath, maxCount) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_COMMIT_LOG, workspacePath, maxCount),
  gitUndoCommit: (workspacePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.GIT_UNDO_COMMIT, workspacePath),
  // GitHub Integration
  githubValidateToken: (token) => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_VALIDATE_TOKEN, token),
  githubPublishRepo: (workspacePath, options, token) => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_PUBLISH_REPO, workspacePath, options, token),
  githubGetUserRepos: (token) => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_GET_USER_REPOS, token),
  githubGetStoredToken: () => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_GET_STORED_TOKEN),
  githubSetStoredToken: (token) => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_SET_STORED_TOKEN, token),
  githubClearStoredToken: () => electron.ipcRenderer.invoke(IPC_CHANNELS.GITHUB_CLEAR_STORED_TOKEN),
  // User Authentication
  authLoginGoogle: () => electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN_GOOGLE),
  authLogout: () => electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
  authGetCurrentUser: () => electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_CURRENT_USER),
  onAuthStateChanged: (callback) => {
    const subscription = (_event, user) => {
      callback(user);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.AUTH_STATE_CHANGED, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.AUTH_STATE_CHANGED, subscription);
    };
  },
  // Extensions
  extensionsGetInstalled: () => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_INSTALLED),
  extensionsSearchMarketplace: (query, category) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_SEARCH_MARKETPLACE, query, category),
  extensionsInstallFromMarketplace: (extension) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_MARKETPLACE, extension),
  extensionsInstallFromVsix: (filePath) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_VSIX, filePath),
  extensionsUninstall: (extensionId) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_UNINSTALL, extensionId),
  extensionsToggleEnable: (extensionId, enabled) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_TOGGLE_ENABLE, extensionId, enabled),
  extensionsGetSnippets: () => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_SNIPPETS),
  extensionsGetThemes: () => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_THEMES),
  extensionsOpenVsixDialog: () => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_OPEN_VSIX_DIALOG),
  openExtensionsWindow: () => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_OPEN_WINDOW),
  extensionsGetReadme: (extensionId, namespace, name) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_README, extensionId, namespace, name),
  extensionsGetSnippetsForExt: (extensionId) => electron.ipcRenderer.invoke(IPC_CHANNELS.EXTENSIONS_GET_EXT_SNIPPETS, extensionId),
  // AI Intelligence
  aiGenerateCompletion: (req) => electron.ipcRenderer.invoke(IPC_CHANNELS.AI_GENERATE_COMPLETION, req),
  aiGenerateEdit: (req) => electron.ipcRenderer.invoke(IPC_CHANNELS.AI_GENERATE_EDIT, req),
  aiChat: (req) => electron.ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT, req),
  aiTestConnection: (provider, apiKey) => electron.ipcRenderer.invoke(IPC_CHANNELS.AI_TEST_CONNECTION, provider, apiKey),
  // PostgreSQL Database & Cloud Sync
  dbTestConnection: (connectionString) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_TEST_CONNECTION, connectionString),
  dbConnect: (connectionString) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_CONNECT, connectionString),
  dbDisconnect: () => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_DISCONNECT),
  dbGetStatus: () => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_GET_STATUS),
  dbSyncSettings: (userId, settings) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_SYNC_SETTINGS, userId, settings),
  dbGetSettings: (userId) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SETTINGS, userId),
  dbSaveSnippet: (userId, snippet) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SNIPPET, userId, snippet),
  dbGetSnippets: (userId) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SNIPPETS, userId),
  dbSaveAiChat: (userId, chat) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_AI_CHAT, userId, chat),
  dbGetAiChats: (userId) => electron.ipcRenderer.invoke(IPC_CHANNELS.DB_GET_AI_CHATS, userId),
  onDbStatusChanged: (callback) => {
    const subscription = (_event, status) => {
      callback(status);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.DB_STATUS_CHANGED, subscription);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.DB_STATUS_CHANGED, subscription);
    };
  }
};
try {
  electron.contextBridge.exposeInMainWorld("bodhiAPI", api);
} catch (error) {
  console.error("Failed to expose bodhiAPI via contextBridge", error);
}
