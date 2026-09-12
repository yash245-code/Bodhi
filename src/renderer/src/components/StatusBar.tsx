import {
  GitBranch,
  Terminal,
  FileCode,
  CheckCircle2,
  Columns,
  Flame,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Database
} from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import { useGitStore } from '../store/useGitStore'
import { useDatabaseStore } from '../store/useDatabaseStore'

export const StatusBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    cursorPosition,
    settings,
    isTerminalOpen,
    toggleTerminal,
    toggleSidebar,
    toggleChurnHeatmap,
    openSettingsWindow
  } = useEditorStore()

  const { status: dbStatus } = useDatabaseStore()

  const { rootPath } = useWorkspaceStore()
  const {
    branch,
    isGitRepo,
    stagedFiles,
    unstagedFiles,
    untrackedFiles,
    syncStatus,
    isSyncing,
    openBranchModal,
    syncChanges
  } = useGitStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  const totalChanges = stagedFiles.length + unstagedFiles.length + untrackedFiles.length

  return (
    <div className="h-6 w-full bg-bodhi-panel border-t border-BODHI-border flex items-center justify-between px-3 text-[11px] select-none text-bodhi-muted shrink-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <Columns size={12} />
        </button>

        {isGitRepo && branch ? (
          <div className="flex items-center gap-1">
            <button
              onClick={openBranchModal}
              title={`Branch: ${branch} - Click to switch or create branch`}
              className="flex items-center gap-1.5 text-bodhi-accent font-medium hover:brightness-125 transition-all cursor-pointer"
            >
              <GitBranch size={12} />
              <span>{branch}</span>
              {totalChanges > 0 && (
                <span className="px-1 py-0.2 rounded bg-bodhi-surface text-bodhi-accent font-mono text-[9px] border border-BODHI-border">
                  {totalChanges}*
                </span>
              )}
            </button>

            {/* Sync indicator */}
            {syncStatus.hasRemote && (
              <button
                onClick={syncChanges}
                disabled={isSyncing}
                title={`Sync Changes: ${syncStatus.ahead} outgoing, ${syncStatus.behind} incoming`}
                className="flex items-center gap-0.5 px-1 py-0.2 ml-1 rounded hover:bg-bodhi-surface text-bodhi-muted hover:text-white font-mono text-[10px] transition-colors"
              >
                <RefreshCw size={10} className={isSyncing ? 'animate-spin text-bodhi-accent' : ''} />
                {syncStatus.behind > 0 && (
                  <span className="text-emerald-400 flex items-center">
                    <ArrowDown size={9} />
                    {syncStatus.behind}
                  </span>
                )}
                {syncStatus.ahead > 0 && (
                  <span className="text-bodhi-accent flex items-center">
                    <ArrowUp size={9} />
                    {syncStatus.ahead}
                  </span>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-bodhi-muted">
            <GitBranch size={12} />
            <span>no repo</span>
          </div>
        )}

        {isGitRepo && (
          <button
            onClick={toggleChurnHeatmap}
            title={`Gutter Churn Heatmap: ${settings.enableChurnHeatmap !== false ? 'Enabled' : 'Disabled'} (Click to toggle)`}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer select-none ${
              settings.enableChurnHeatmap !== false
                ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/20 shadow-xs'
                : 'text-bodhi-muted hover:text-white bg-transparent border border-transparent'
            }`}
          >
            <Flame size={12} className={settings.enableChurnHeatmap !== false ? 'text-rose-500 fill-rose-500/20' : ''} />
            <span className="font-mono text-[10px]">
              {settings.enableChurnHeatmap !== false ? 'Heatmap' : 'Heatmap Off'}
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 text-bodhi-accent">
          <CheckCircle2 size={12} />
          <span>Ready</span>
        </div>

        {rootPath && (
          <span className="hidden md:inline text-bodhi-muted">
            {tabs.length} open {tabs.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <div className="hover:text-white cursor-pointer transition-colors">
              Ln {cursorPosition.line}, Col {cursorPosition.col}
            </div>

            <div className="hover:text-white cursor-pointer transition-colors">
              Spaces: {settings.tabSize}
            </div>

            <div className="hover:text-white cursor-pointer transition-colors">
              UTF-8
            </div>

            <div className="flex items-center gap-1 text-bodhi-accent font-medium hover:text-white cursor-pointer transition-colors uppercase">
              <FileCode size={12} />
              <span>{activeTab.language}</span>
            </div>
          </>
        )}

        <button
          onClick={openSettingsWindow}
          className={`flex items-center gap-1 transition-colors cursor-pointer ${
            dbStatus.connected ? 'text-emerald-400 font-medium' : 'text-bodhi-muted hover:text-white'
          }`}
          title={
            dbStatus.connected
              ? `PostgreSQL: Connected (${dbStatus.host}/${dbStatus.database} - ${dbStatus.latencyMs}ms)`
              : 'PostgreSQL: Disconnected (Click to configure in Settings)'
          }
        >
          <Database size={11} className={dbStatus.connected ? 'text-emerald-400' : ''} />
          <span>{dbStatus.connected ? 'Postgres' : 'Postgres Off'}</span>
        </button>

        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1 transition-colors ${
            isTerminalOpen ? 'text-bodhi-accent font-medium' : 'hover:text-white'
          }`}
          title="Toggle Terminal"
        >
          <Terminal size={12} />
          <span>Terminal</span>
        </button>
      </div>
    </div>
  )
}
