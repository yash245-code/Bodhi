export type NodeType = 'file' | 'directory'

export interface FileNode {
  id: string
  name: string
  path: string
  type: NodeType
  extension?: string
  children?: FileNode[]
  size?: number
  updatedAt?: number
}

export interface Tab {
  id: string
  path: string
  name: string
  content: string
  savedContent: string
  isDirty: boolean
  language: string
  isDiff?: boolean
  originalContent?: string
  diffTitle?: string
}

export interface TerminalDataPayload {
  id: string
  data: string
}

export interface TerminalResizePayload {
  id: string
  cols: number
  rows: number
}

export interface FileChangeEvent {
  type: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'
  path: string
}

export interface EditorSettings {
  fontSize: number
  fontFamily: string
  fontTheme?: string
  fontLigatures?: boolean
  tabSize: number
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded'
  minimap: boolean
  theme: string
  accentColor?: string
  sidebarPosition?: 'left' | 'right'
  autoSave: boolean
  autoSaveDelay: number
  lineHeight?: number
  cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
  cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin'
  bracketPairColorization?: boolean
  formatOnSave?: boolean
  terminalFontSize?: number
  terminalFontFamily?: string
  terminalCursorStyle?: 'block' | 'underline' | 'bar'
  terminalDefaultShell?: ShellType
  aiModelProvider?: string
  aiApiKey?: string
  aiTemperature?: number
  aiMaxTokens?: number
  enableChurnHeatmap?: boolean
}

export type ShellType = 'powershell' | 'cmd' | 'bash' | 'wsl' | 'default'

export interface ShellProfile {
  id: string
  name: string
  shell: ShellType
  path: string
  description: string
  iconType: 'powershell' | 'cmd' | 'bash' | 'wsl' | 'default'
}

export interface TerminalSession {
  id: string
  name: string
  shell: ShellType
  splitSessionId?: string
  splitRatio?: number
}

export interface RecentWorkspace {
  path: string
  name: string
  lastOpened: number
}

export interface WorkspaceSession {
  rootPath: string | null
  tabs: Tab[]
  activeTabId: string | null
  pane2Tabs: Tab[]
  pane2ActiveTabId: string | null
  isSplitEditorOpen: boolean
  splitRatio: number
  isTerminalOpen: boolean
  terminalHeight: number
  terminalSessions: TerminalSession[]
  activeTerminalId: string
  cursorPosition?: { line: number; col: number }
}

export interface SearchOptions {
  isRegex?: boolean
  matchCase?: boolean
  matchWholeWord?: boolean
  includePattern?: string
  excludePattern?: string
  maxResults?: number
}

export interface SearchMatch {
  filePath: string
  relativePath: string
  fileName: string
  line: number
  column: number
  lineContent: string
  matchLength: number
}

export interface SearchResultGroup {
  filePath: string
  relativePath: string
  fileName: string
  matches: SearchMatch[]
}

export interface ReplaceResult {
  totalReplacements: number
  filesModified: number
}

export type GitFileStatusType = 'M' | 'U' | 'A' | 'D' | 'R' | 'C' | '??'

export interface GitFileStatus {
  path: string
  relativePath: string
  fileName: string
  status: GitFileStatusType
  staged: boolean
}

export interface GitStatusResult {
  isRepo: boolean
  branch: string | null
  staged: GitFileStatus[]
  unstaged: GitFileStatus[]
  untracked: GitFileStatus[]
}

export interface GitLineChurn {
  lineNumber: number
  commitHash: string
  shortHash: string
  author: string
  authorEmail: string
  authorTime: number
  dateStr: string
  relativeTime: string
  summary: string
  heatLevel: 1 | 2 | 3 | 4 | 5
  heatScore: number
}

export interface GitFileChurnResult {
  filePath: string
  totalCommits: number
  uniqueAuthors: string[]
  lines: GitLineChurn[]
  lastModified: number
  oldestModified: number
}

export interface GitRemote {
  name: string
  fetchUrl: string
  pushUrl: string
}

export interface GitBranchInfo {
  name: string
  current: boolean
  remote: boolean
  upstream?: string
  ahead?: number
  behind?: number
}

export interface GitSyncStatus {
  ahead: number
  behind: number
  hasRemote: boolean
  upstream?: string | null
}

export interface GitStashItem {
  index: number
  message: string
  date: string
  hash: string
}

export interface GitCommitLogItem {
  hash: string
  shortHash: string
  author: string
  email: string
  date: string
  relativeTime: string
  message: string
}

export interface GitHubUser {
  login: string
  name: string
  avatarUrl: string
  bio?: string
  publicRepos: number
  htmlUrl: string
}

export interface GitHubPublishOptions {
  repoName: string
  description?: string
  isPrivate: boolean
  org?: string
}

export interface GitHubPublishResult {
  success: boolean
  cloneUrl?: string
  htmlUrl?: string
  error?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  picture: string
  provider: 'google'
  lastLogin: number
}

export interface AuthResult {
  success: boolean
  user?: UserProfile
  error?: string
}

export interface DbConnectionStatus {
  connected: boolean
  host?: string
  database?: string
  serverVersion?: string
  latencyMs?: number
  lastSyncTime?: number
  error?: string
}

export interface DbTestResult {
  success: boolean
  message: string
  latencyMs?: number
  serverVersion?: string
}

export interface CloudSnippet {
  id?: string
  title: string
  prefix: string
  language: string
  code: string
  createdAt?: number
}

export interface CloudAIChat {
  id?: string
  title: string
  messages: Array<{ role: string; content: string }>
  model?: string
  updatedAt?: number
}

export interface BodhiAPI {
  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isMaximized: () => Promise<boolean>
  zoomIn: () => Promise<number>
  zoomOut: () => Promise<number>
  resetZoom: () => Promise<number>
  getZoomFactor: () => Promise<number>

  // Dialogs
  openFileDialog: () => Promise<string | null>
  openDirectoryDialog: () => Promise<string | null>

  // File system
  readDirectory: (dirPath: string) => Promise<FileNode>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  createFile: (filePath: string) => Promise<boolean>
  createDirectory: (dirPath: string) => Promise<boolean>
  renamePath: (oldPath: string, newPath: string) => Promise<boolean>
  deletePath: (targetPath: string) => Promise<boolean>

  // Watcher
  watchDirectory: (dirPath: string) => Promise<void>
  unwatchDirectory: () => Promise<void>
  onFileChange: (callback: (event: FileChangeEvent) => void) => () => void

  // Terminal
  createTerminal: (id: string, cwd?: string, shellType?: string) => Promise<boolean>
  writeTerminal: (id: string, data: string) => Promise<void>
  resizeTerminal: (id: string, cols: number, rows: number) => Promise<void>
  killTerminal: (id: string) => Promise<void>
  onTerminalData: (callback: (payload: TerminalDataPayload) => void) => () => void
  onTerminalExit: (callback: (payload: { id: string; exitCode: number }) => void) => () => void
  terminalGetAvailableShells: () => Promise<ShellProfile[]>

  // Search & Replace
  searchWorkspace: (
    workspacePath: string,
    query: string,
    options?: SearchOptions
  ) => Promise<SearchResultGroup[]>
  replaceInFile: (
    filePath: string,
    query: string,
    replaceText: string,
    options?: SearchOptions
  ) => Promise<number>
  replaceAll: (
    workspacePath: string,
    query: string,
    replaceText: string,
    options?: SearchOptions
  ) => Promise<ReplaceResult>

  // Settings
  openSettingsWindow: () => Promise<void>
  getSettings: () => Promise<Partial<EditorSettings>>
  updateSettings: (settings: Partial<EditorSettings>) => Promise<void>
  onSettingsChanged: (callback: (settings: Partial<EditorSettings>) => void) => () => void

  // Git Source Control
  gitGetStatus: (workspacePath: string) => Promise<GitStatusResult>
  gitGetBranch: (workspacePath: string) => Promise<string | null>
  gitGetFileAtHead: (workspacePath: string, relativePath: string) => Promise<string | null>
  gitGetDiff: (workspacePath: string, relativePath: string, staged?: boolean) => Promise<string>
  gitStage: (workspacePath: string, relativePath: string) => Promise<boolean>
  gitUnstage: (workspacePath: string, relativePath: string) => Promise<boolean>
  gitStageAll: (workspacePath: string) => Promise<boolean>
  gitUnstageAll: (workspacePath: string) => Promise<boolean>
  gitDiscard: (workspacePath: string, relativePath: string, isUntracked?: boolean) => Promise<boolean>
  gitCommit: (workspacePath: string, message: string) => Promise<boolean>
  gitGetFileChurn: (workspacePath: string, relativePath: string) => Promise<GitFileChurnResult | null>
  gitInit: (workspacePath: string, defaultBranch?: string) => Promise<boolean>
  gitCreateGitignore: (workspacePath: string, templateType: string) => Promise<boolean>
  gitGetRemotes: (workspacePath: string) => Promise<GitRemote[]>
  gitAddRemote: (workspacePath: string, name: string, url: string) => Promise<boolean>
  gitRemoveRemote: (workspacePath: string, name: string) => Promise<boolean>
  gitSetRemoteUrl: (workspacePath: string, name: string, url: string) => Promise<boolean>
  gitGetBranches: (workspacePath: string) => Promise<GitBranchInfo[]>
  gitCheckoutBranch: (workspacePath: string, branchName: string, createNew?: boolean) => Promise<boolean>
  gitCreateBranch: (workspacePath: string, branchName: string) => Promise<boolean>
  gitDeleteBranch: (workspacePath: string, branchName: string, force?: boolean) => Promise<boolean>
  gitMergeBranch: (workspacePath: string, branchName: string) => Promise<{ success: boolean; message: string }>
  gitFetch: (workspacePath: string, remote?: string) => Promise<boolean>
  gitPull: (workspacePath: string, remote?: string, branch?: string) => Promise<{ success: boolean; message: string }>
  gitPush: (workspacePath: string, remote?: string, branch?: string, setUpstream?: boolean) => Promise<{ success: boolean; message: string }>
  gitGetSyncStatus: (workspacePath: string) => Promise<GitSyncStatus>
  gitStashSave: (workspacePath: string, message?: string) => Promise<boolean>
  gitStashPop: (workspacePath: string, index?: number) => Promise<boolean>
  gitStashList: (workspacePath: string) => Promise<GitStashItem[]>
  gitStashDrop: (workspacePath: string, index?: number) => Promise<boolean>
  gitGetCommitLog: (workspacePath: string, maxCount?: number) => Promise<GitCommitLogItem[]>
  gitUndoCommit: (workspacePath: string) => Promise<boolean>

  // GitHub Integration
  githubValidateToken: (token: string) => Promise<GitHubUser | null>
  githubPublishRepo: (workspacePath: string, options: GitHubPublishOptions, token?: string) => Promise<GitHubPublishResult>
  githubGetUserRepos: (token?: string) => Promise<Array<{ id: number; name: string; fullName: string; isPrivate: boolean; htmlUrl: string; cloneUrl: string; description: string | null }>>
  githubGetStoredToken: () => Promise<string | null>
  githubSetStoredToken: (token: string) => Promise<boolean>
  githubClearStoredToken: () => Promise<boolean>

  // User Authentication (Google OAuth & Profile)
  authLoginGoogle: () => Promise<AuthResult>
  authLogout: () => Promise<boolean>
  authGetCurrentUser: () => Promise<UserProfile | null>
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => () => void

  // Extensions
  extensionsGetInstalled: () => Promise<InstalledExtension[]>
  extensionsSearchMarketplace: (
    query: string,
    category?: string
  ) => Promise<MarketplaceExtension[]>
  extensionsInstallFromMarketplace: (
    extension: MarketplaceExtension
  ) => Promise<InstalledExtension>
  extensionsInstallFromVsix: (filePath?: string) => Promise<InstalledExtension | null>
  extensionsUninstall: (extensionId: string) => Promise<boolean>
  extensionsToggleEnable: (extensionId: string, enabled: boolean) => Promise<boolean>
  extensionsGetSnippets: () => Promise<ExtensionSnippetItem[]>
  extensionsGetThemes: () => Promise<ExtensionThemeItem[]>
  extensionsOpenVsixDialog: () => Promise<string | null>
  openExtensionsWindow: () => Promise<void>
  extensionsGetReadme: (
    extensionId: string,
    namespace?: string,
    name?: string
  ) => Promise<string>
  extensionsGetSnippetsForExt: (
    extensionId: string
  ) => Promise<ExtensionSnippetItem[]>
  aiGenerateCompletion: (req: AICompletionRequest) => Promise<AIResponse>
  aiGenerateEdit: (req: AIEditRequest) => Promise<AIResponse>
  aiChat: (req: AIChatRequest) => Promise<AIResponse>
  aiTestConnection: (provider?: string, apiKey?: string) => Promise<AITestResult>

  // PostgreSQL Database & Cloud Sync
  dbTestConnection: (connectionString: string) => Promise<DbTestResult>
  dbConnect: (connectionString: string) => Promise<DbConnectionStatus>
  dbDisconnect: () => Promise<boolean>
  dbGetStatus: () => Promise<DbConnectionStatus>
  dbSyncSettings: (userId: string, settings: Partial<EditorSettings>) => Promise<boolean>
  dbGetSettings: (userId: string) => Promise<Partial<EditorSettings> | null>
  dbSaveSnippet: (userId: string, snippet: CloudSnippet) => Promise<boolean>
  dbGetSnippets: (userId: string) => Promise<CloudSnippet[]>
  dbSaveAiChat: (userId: string, chat: CloudAIChat) => Promise<boolean>
  dbGetAiChats: (userId: string) => Promise<CloudAIChat[]>
  onDbStatusChanged: (callback: (status: DbConnectionStatus) => void) => () => void
}

export interface AITestResult {
  success: boolean
  message: string
  detectedProvider?: string
  modelUsed?: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionRequest {
  prefix: string
  suffix?: string
  language?: string
  settings?: EditorSettings
}

export interface AIEditRequest {
  code: string
  prompt: string
  language?: string
  context?: string
  settings?: EditorSettings
}

export interface AIChatRequest {
  messages: AIChatMessage[]
  contextFile?: {
    name: string
    language?: string
    content: string
  }
  settings?: EditorSettings
}

export interface AIResponse {
  text: string
  error?: string
}

export interface ExtensionSnippetItem {
  language: string
  name: string
  prefix: string | string[]
  body: string | string[]
  description?: string
  scope?: string
  sourceExtensionId: string
  sourceExtensionName: string
}

export interface ExtensionThemeItem {
  id: string
  label: string
  uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'
  path: string
  sourceExtensionId: string
  themeData?: any
}

export interface InstalledExtension {
  id: string
  name: string
  displayName: string
  publisher: string
  version: string
  description: string
  icon?: string
  enabled: boolean
  installDate: number
  snippetsCount: number
  themesCount: number
  contributes: {
    snippets?: Array<{ language?: string; path: string }>
    themes?: Array<{ label: string; uiTheme: string; path: string }>
  }
}

export interface MarketplaceExtension {
  id: string
  name: string
  namespace: string
  displayName: string
  version: string
  description: string
  icon?: string
  downloadUrl: string
  downloadCount?: number
  averageRating?: number
  reviewCount?: number
  timestamp?: string
  isInstalled?: boolean
  categories?: string[]
}

