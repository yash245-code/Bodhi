export const IPC_CHANNELS = {
  // Window
  WINDOW_MINIMIZE: 'BODHI:window:minimize',
  WINDOW_MAXIMIZE: 'BODHI:window:maximize',
  WINDOW_CLOSE: 'BODHI:window:close',
  WINDOW_IS_MAXIMIZED: 'BODHI:window:isMaximized',

  // Dialogs
  DIALOG_OPEN_FILE: 'BODHI:dialog:openFile',
  DIALOG_OPEN_DIRECTORY: 'BODHI:dialog:openDirectory',

  // File system
  FS_READ_DIRECTORY: 'BODHI:fs:readDirectory',
  FS_READ_FILE: 'BODHI:fs:readFile',
  FS_WRITE_FILE: 'BODHI:fs:writeFile',
  FS_CREATE_FILE: 'BODHI:fs:createFile',
  FS_CREATE_DIRECTORY: 'BODHI:fs:createDirectory',
  FS_RENAME_PATH: 'BODHI:fs:renamePath',
  FS_DELETE_PATH: 'BODHI:fs:deletePath',

  // Watcher
  WATCHER_START: 'BODHI:watcher:start',
  WATCHER_STOP: 'BODHI:watcher:stop',
  WATCHER_CHANGE: 'BODHI:watcher:change',

  // Terminal
  TERMINAL_CREATE: 'BODHI:terminal:create',
  TERMINAL_WRITE: 'BODHI:terminal:write',
  TERMINAL_RESIZE: 'BODHI:terminal:resize',
  TERMINAL_KILL: 'BODHI:terminal:kill',
  TERMINAL_DATA: 'BODHI:terminal:data',
  TERMINAL_EXIT: 'BODHI:terminal:exit',
  TERMINAL_GET_AVAILABLE_SHELLS: 'BODHI:terminal:getAvailableShells',

  // Search & Replace
  SEARCH_WORKSPACE: 'BODHI:search:workspace',
  SEARCH_REPLACE_FILE: 'BODHI:search:replaceFile',
  SEARCH_REPLACE_ALL: 'BODHI:search:replaceAll',

  // Settings
  SETTINGS_OPEN: 'BODHI:settings:open',
  SETTINGS_GET: 'BODHI:settings:get',
  SETTINGS_UPDATE: 'BODHI:settings:update',
  SETTINGS_CHANGED: 'BODHI:settings:changed',

  // Git
  GIT_STATUS: 'BODHI:git:status',
  GIT_BRANCH: 'BODHI:git:branch',
  GIT_GET_FILE_AT_HEAD: 'BODHI:git:getFileAtHead',
  GIT_GET_DIFF: 'BODHI:git:getDiff',
  GIT_STAGE: 'BODHI:git:stage',
  GIT_UNSTAGE: 'BODHI:git:unstage',
  GIT_STAGE_ALL: 'BODHI:git:stageAll',
  GIT_UNSTAGE_ALL: 'BODHI:git:unstageAll',
  GIT_DISCARD: 'BODHI:git:discard',
  GIT_COMMIT: 'BODHI:git:commit',
  GIT_GET_FILE_CHURN: 'BODHI:git:getFileChurn',
  GIT_INIT: 'BODHI:git:init',
  GIT_CREATE_GITIGNORE: 'BODHI:git:createGitignore',
  GIT_GET_REMOTES: 'BODHI:git:getRemotes',
  GIT_ADD_REMOTE: 'BODHI:git:addRemote',
  GIT_REMOVE_REMOTE: 'BODHI:git:removeRemote',
  GIT_SET_REMOTE_URL: 'BODHI:git:setRemoteUrl',
  GIT_GET_BRANCHES: 'BODHI:git:getBranches',
  GIT_CHECKOUT_BRANCH: 'BODHI:git:checkoutBranch',
  GIT_CREATE_BRANCH: 'BODHI:git:createBranch',
  GIT_DELETE_BRANCH: 'BODHI:git:deleteBranch',
  GIT_MERGE_BRANCH: 'BODHI:git:mergeBranch',
  GIT_FETCH: 'BODHI:git:fetch',
  GIT_PULL: 'BODHI:git:pull',
  GIT_PUSH: 'BODHI:git:push',
  GIT_GET_SYNC_STATUS: 'BODHI:git:getSyncStatus',
  GIT_STASH_SAVE: 'BODHI:git:stashSave',
  GIT_STASH_POP: 'BODHI:git:stashPop',
  GIT_STASH_LIST: 'BODHI:git:stashList',
  GIT_STASH_DROP: 'BODHI:git:stashDrop',
  GIT_GET_COMMIT_LOG: 'BODHI:git:getCommitLog',
  GIT_UNDO_COMMIT: 'BODHI:git:undoCommit',

  // GitHub Integration & Cloud Publishing
  GITHUB_VALIDATE_TOKEN: 'BODHI:github:validateToken',
  GITHUB_PUBLISH_REPO: 'BODHI:github:publishRepo',
  GITHUB_GET_USER_REPOS: 'BODHI:github:getUserRepos',
  GITHUB_GET_STORED_TOKEN: 'BODHI:github:getStoredToken',
  GITHUB_SET_STORED_TOKEN: 'BODHI:github:setStoredToken',
  GITHUB_CLEAR_STORED_TOKEN: 'BODHI:github:clearStoredToken',

  // User Authentication (Google OAuth & Profile)
  AUTH_LOGIN_GOOGLE: 'BODHI:auth:loginGoogle',
  AUTH_LOGOUT: 'BODHI:auth:logout',
  AUTH_GET_CURRENT_USER: 'BODHI:auth:getCurrentUser',
  AUTH_STATE_CHANGED: 'BODHI:auth:stateChanged',

  // Extensions
  EXTENSIONS_GET_INSTALLED: 'BODHI:extensions:getInstalled',
  EXTENSIONS_SEARCH_MARKETPLACE: 'BODHI:extensions:searchMarketplace',
  EXTENSIONS_INSTALL_FROM_MARKETPLACE: 'BODHI:extensions:installFromMarketplace',
  EXTENSIONS_INSTALL_FROM_VSIX: 'BODHI:extensions:installFromVsix',
  EXTENSIONS_UNINSTALL: 'BODHI:extensions:uninstall',
  EXTENSIONS_TOGGLE_ENABLE: 'BODHI:extensions:toggleEnable',
  EXTENSIONS_GET_SNIPPETS: 'BODHI:extensions:getSnippets',
  EXTENSIONS_GET_THEMES: 'BODHI:extensions:getThemes',
  EXTENSIONS_OPEN_VSIX_DIALOG: 'BODHI:extensions:openVsixDialog',
  EXTENSIONS_OPEN_WINDOW: 'BODHI:extensions:openWindow',
  EXTENSIONS_GET_README: 'BODHI:extensions:getReadme',
  EXTENSIONS_GET_EXT_SNIPPETS: 'BODHI:extensions:getExtSnippets',

  // AI Intelligence
  AI_GENERATE_COMPLETION: 'BODHI:ai:generateCompletion',
  AI_GENERATE_EDIT: 'BODHI:ai:generateEdit',
  AI_CHAT: 'BODHI:ai:chat',
  AI_TEST_CONNECTION: 'BODHI:ai:testConnection',

  // PostgreSQL Database & Cloud Sync
  DB_TEST_CONNECTION: 'BODHI:db:testConnection',
  DB_CONNECT: 'BODHI:db:connect',
  DB_DISCONNECT: 'BODHI:db:disconnect',
  DB_GET_STATUS: 'BODHI:db:getStatus',
  DB_SYNC_SETTINGS: 'BODHI:db:syncSettings',
  DB_GET_SETTINGS: 'BODHI:db:getSettings',
  DB_SAVE_SNIPPET: 'BODHI:db:saveSnippet',
  DB_GET_SNIPPETS: 'BODHI:db:getSnippets',
  DB_SAVE_AI_CHAT: 'BODHI:db:saveAiChat',
  DB_GET_AI_CHATS: 'BODHI:db:getAiChats',
  DB_STATUS_CHANGED: 'BODHI:db:statusChanged'
} as const

export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  md: 'markdown',
  markdown: 'markdown',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  ps1: 'powershell',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  svg: 'xml',
  toml: 'ini',
  ini: 'ini',
  env: 'ini',
  dockerfile: 'dockerfile'
}

export function getLanguageForFile(filename: string): string {
  const parts = filename.split('.')
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || ''
    if (EXTENSION_TO_LANGUAGE[ext]) {
      return EXTENSION_TO_LANGUAGE[ext]
    }
  }
  const lower = filename.toLowerCase()
  if (lower === 'dockerfile') return 'dockerfile'
  if (lower.startsWith('.env')) return 'ini'
  return 'plaintext'
}
