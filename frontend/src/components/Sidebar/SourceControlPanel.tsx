import React, { useState, useEffect } from 'react'
import {
  GitBranch,
  RefreshCw,
  Plus,
  Minus,
  RotateCcw,
  File,
  ChevronDown,
  ChevronRight,
  GitCommit,
  CheckCircle2,
  GitCompare,
  UploadCloud,
  ArrowDown,
  ArrowUp,
  Archive,
  History,
  Undo2,
  Trash2,
  Play
} from 'lucide-react'
import { useGitStore } from '../../store/useGitStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useEditorStore } from '../../store/useEditorStore'
import { GitFileStatus, GitFileStatusType } from '@shared/types'
import { PublishToGitHubModal } from './PublishToGitHubModal'
import { BranchSwitcherModal } from './BranchSwitcherModal'

function getStatusBadge(status: GitFileStatusType): { text: string; color: string; bg: string } {
  switch (status) {
    case 'M':
      return { text: 'M', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' }
    case 'U':
    case '??':
      return { text: 'U', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' }
    case 'A':
      return { text: 'A', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
    case 'D':
      return { text: 'D', color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/30' }
    case 'R':
      return { text: 'R', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' }
    default:
      return { text: status, color: 'text-bodhi-muted', bg: 'bg-bodhi-surface border-BODHI-border' }
  }
}

export const SourceControlPanel: React.FC = () => {
  const {
    branch,
    isGitRepo,
    stagedFiles,
    unstagedFiles,
    untrackedFiles,
    remotes,
    syncStatus,
    stashes,
    commitHistory,
    isLoading,
    isCommitting,
    isSyncing,
    commitMessage,
    gitError,
    refreshGitStatus,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
    discardChanges,
    commitChanges,
    setCommitMessage,
    initRepo,
    createGitignore,
    openBranchModal,
    openPublishModal,
    syncChanges,
    stashSave,
    stashPop,
    stashDrop,
    undoLastCommit,
    setGitError
  } = useGitStore()

  const { rootPath, openFolder } = useWorkspaceStore()
  const { openTab, openDiffTab } = useEditorStore()

  const [isStagedOpen, setIsStagedOpen] = useState(true)
  const [isChangesOpen, setIsChangesOpen] = useState(true)
  const [isUntrackedOpen, setIsUntrackedOpen] = useState(true)
  const [isStashOpen, setIsStashOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [stashInput, setStashInput] = useState('')
  const [showStashInput, setShowStashInput] = useState(false)

  // Initial load
  useEffect(() => {
    if (rootPath) {
      refreshGitStatus()
    }
  }, [rootPath, refreshGitStatus])

  const totalChanges = stagedFiles.length + unstagedFiles.length + untrackedFiles.length
  const hasRemote = remotes.length > 0

  const handleCommit = async (): Promise<void> => {
    if (!commitMessage.trim()) return
    await commitChanges()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleCommit()
    }
  }

  const handleCreateStash = async (): Promise<void> => {
    await stashSave(stashInput.trim() || undefined)
    setStashInput('')
    setShowStashInput(false)
  }

  if (!rootPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none text-bodhi-muted">
        <GitBranch size={32} className="text-bodhi-muted mb-2 opacity-50" />
        <h4 className="text-xs font-semibold text-BODHI-text mb-1">No Folder Opened</h4>
        <p className="text-[11px] mb-3">Open a workspace to view Git source control.</p>
        <button
          onClick={() => openFolder()}
          className="px-3 py-1.5 rounded-lg bg-bodhi-accent text-black font-semibold text-xs transition-transform active:scale-95 shadow-sm"
        >
          Open Folder
        </button>
      </div>
    )
  }

  if (!isGitRepo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-bodhi-muted space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-bodhi-surface flex items-center justify-center text-bodhi-accent border border-BODHI-border shadow-sm">
          <GitBranch size={24} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">No Git Repository</h4>
          <p className="text-[11px] text-bodhi-muted max-w-[220px] mx-auto leading-relaxed">
            Initialize a Git repository to start version controlling your code or publish directly to GitHub.
          </p>
        </div>

        <div className="w-full space-y-2 max-w-[200px]">
          <button
            onClick={() => initRepo('main')}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-lg bg-bodhi-accent text-black font-semibold text-xs transition-all hover:brightness-110 active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Play size={13} />
            )}
            <span>Initialize Repository</span>
          </button>

          <button
            onClick={openPublishModal}
            className="w-full py-2 px-3 rounded-lg bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-white text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <UploadCloud size={13} className="text-bodhi-accent" />
            <span>Publish to GitHub</span>
          </button>
        </div>

        {/* Quick .gitignore generator */}
        <div className="pt-2 border-t border-BODHI-border/60 w-full max-w-[200px]">
          <span className="text-[10px] text-bodhi-muted block mb-1.5">Add .gitignore template:</span>
          <div className="flex items-center justify-center gap-1">
            {['node', 'python', 'rust'].map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => createGitignore(tmpl)}
                className="px-2 py-0.5 rounded bg-bodhi-surface hover:bg-bodhi-accent/20 hover:text-bodhi-accent text-[10px] uppercase font-mono border border-BODHI-border text-bodhi-muted transition-colors"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        <PublishToGitHubModal />
      </div>
    )
  }

  const renderFileRow = (
    item: GitFileStatus,
    type: 'staged' | 'unstaged' | 'untracked'
  ): React.ReactNode => {
    const badge = getStatusBadge(item.status)

    return (
      <div
        key={`${type}-${item.relativePath}`}
        onClick={() => {
          if (type === 'untracked') {
            openTab(item.path)
          } else {
            openDiffTab(item.path)
          }
        }}
        className="group flex items-center h-7 px-3 text-xs text-BODHI-text hover:bg-bodhi-surface/60 rounded cursor-pointer transition-colors"
      >
        <File size={13} className="text-bodhi-muted mr-1.5 shrink-0 group-hover:text-BODHI-text" />
        <span className="truncate font-medium flex-1 mr-2">{item.fileName}</span>
        <span className="text-[10px] text-bodhi-muted truncate max-w-[90px] mr-2">
          {item.relativePath.includes('/')
            ? item.relativePath.substring(0, item.relativePath.lastIndexOf('/'))
            : ''}
        </span>

        {/* Hover Action Buttons */}
        <div className="hidden group-hover:flex items-center gap-0.5 mr-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openDiffTab(item.path)
            }}
            title="Open Changes (Diff View)"
            className="p-1 text-bodhi-muted hover:text-amber-400 hover:bg-BODHI-active rounded transition-colors"
          >
            <GitCompare size={12} />
          </button>

          {type === 'staged' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                unstageFile(item.relativePath)
              }}
              title="Unstage Changes"
              className="p-1 text-bodhi-muted hover:text-white hover:bg-BODHI-active rounded transition-colors"
            >
              <Minus size={12} />
            </button>
          )}

          {type === 'unstaged' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  discardChanges(item.relativePath, false)
                }}
                title="Discard Changes"
                className="p-1 text-bodhi-muted hover:text-rose-400 hover:bg-BODHI-active rounded transition-colors"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  stageFile(item.relativePath)
                }}
                title="Stage Changes"
                className="p-1 text-bodhi-muted hover:text-white hover:bg-BODHI-active rounded transition-colors"
              >
                <Plus size={12} />
              </button>
            </>
          )}

          {type === 'untracked' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  discardChanges(item.relativePath, true)
                }}
                title="Delete Untracked File"
                className="p-1 text-bodhi-muted hover:text-rose-400 hover:bg-BODHI-active rounded transition-colors"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  stageFile(item.relativePath)
                }}
                title="Track / Stage File"
                className="p-1 text-bodhi-muted hover:text-white hover:bg-BODHI-active rounded transition-colors"
              >
                <Plus size={12} />
              </button>
            </>
          )}
        </div>

        {/* Status Badge */}
        <span
          className={`w-4 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold border ${badge.color} ${badge.bg}`}
        >
          {badge.text}
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-BODHI-sidebar text-BODHI-text select-none">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-BODHI-border shrink-0 bg-bodhi-panel/50">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[11px] font-bold uppercase tracking-wider text-bodhi-muted">
            Source Control
          </span>

          {/* Branch Selector Pill */}
          {branch && (
            <button
              onClick={openBranchModal}
              title="Click to switch or create branch"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-bodhi-surface hover:bg-BODHI-active text-bodhi-accent font-mono text-[10px] border border-BODHI-border transition-colors cursor-pointer"
            >
              <GitBranch size={10} />
              <span className="truncate max-w-[75px]">{branch}</span>
            </button>
          )}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1 text-bodhi-muted">
          {/* Publish or Sync Button */}
          {!hasRemote ? (
            <button
              onClick={openPublishModal}
              title="Publish to GitHub"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-bodhi-accent/15 text-bodhi-accent border border-bodhi-accent/30 text-[10px] font-medium hover:bg-bodhi-accent/25 transition-colors"
            >
              <UploadCloud size={11} />
              <span>Publish</span>
            </button>
          ) : (
            <button
              onClick={syncChanges}
              disabled={isSyncing}
              title={`Sync Changes: ${syncStatus.ahead} outgoing, ${syncStatus.behind} incoming`}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-white text-[10px] font-mono transition-colors disabled:opacity-50"
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

          {totalChanges > 0 && stagedFiles.length > 0 && (
            <button
              onClick={() => unstageAll()}
              title="Unstage All Changes"
              className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
            >
              <Minus size={13} />
            </button>
          )}
          {totalChanges > 0 && (unstagedFiles.length > 0 || untrackedFiles.length > 0) && (
            <button
              onClick={() => stageAll()}
              title="Stage All Changes"
              className="p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors"
            >
              <Plus size={13} />
            </button>
          )}
          <button
            onClick={() => refreshGitStatus()}
            title="Refresh Git Status"
            className={`p-1 hover:text-white hover:bg-bodhi-surface rounded transition-colors ${
              isLoading ? 'animate-spin text-bodhi-accent' : ''
            }`}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {gitError && (
        <div className="px-3 py-1.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-[11px] flex items-center justify-between">
          <span className="truncate">{gitError}</span>
          <button onClick={() => setGitError(null)} className="ml-2 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Commit Box */}
      <div className="p-3 border-b border-BODHI-border space-y-2 shrink-0">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={2}
          className="w-full bg-bodhi-panel text-xs text-BODHI-text p-2 rounded border border-BODHI-border focus:border-bodhi-accent focus:outline-none resize-none placeholder:text-bodhi-muted"
        />

        <div className="flex gap-1.5">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || isCommitting || totalChanges === 0}
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
              commitMessage.trim() && totalChanges > 0 && !isCommitting
                ? 'bg-bodhi-accent text-black hover:opacity-90 active:scale-[0.99] shadow-sm'
                : 'bg-bodhi-surface text-bodhi-muted opacity-50 cursor-not-allowed border border-BODHI-border'
            }`}
          >
            {isCommitting ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <GitCommit size={13} />
                <span>Commit Changes</span>
              </>
            )}
          </button>

          {/* Quick Undo Last Commit */}
          {commitHistory.length > 0 && (
            <button
              onClick={undoLastCommit}
              title="Undo Last Commit (soft reset)"
              className="px-2 py-1.5 rounded bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-bodhi-muted hover:text-white transition-colors"
            >
              <Undo2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Changes Accordions Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 space-y-1">
        {totalChanges === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-bodhi-muted">
            <CheckCircle2 size={26} className="text-bodhi-accent mb-2 opacity-80" />
            <span className="text-xs font-medium text-BODHI-text">Working tree clean</span>
            <span className="text-[11px] text-bodhi-muted mt-0.5">No changes to commit</span>
          </div>
        ) : (
          <>
            {/* 1. Staged Changes */}
            {stagedFiles.length > 0 && (
              <div>
                <div
                  onClick={() => setIsStagedOpen(!isStagedOpen)}
                  className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-bodhi-muted hover:text-BODHI-text cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    {isStagedOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <span className="tracking-wide text-[11px]">STAGED CHANGES</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono text-bodhi-accent">
                      {stagedFiles.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unstageAll()
                      }}
                      title="Unstage All"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white rounded"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                </div>

                {isStagedOpen && (
                  <div className="py-0.5">
                    {stagedFiles.map((f) => renderFileRow(f, 'staged'))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Unstaged Changes */}
            {unstagedFiles.length > 0 && (
              <div>
                <div
                  onClick={() => setIsChangesOpen(!isChangesOpen)}
                  className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-bodhi-muted hover:text-BODHI-text cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    {isChangesOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <span className="tracking-wide text-[11px]">CHANGES</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono text-amber-400">
                      {unstagedFiles.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unstagedFiles.forEach((f) => stageFile(f.relativePath))
                      }}
                      title="Stage All Changes"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white rounded"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {isChangesOpen && (
                  <div className="py-0.5">
                    {unstagedFiles.map((f) => renderFileRow(f, 'unstaged'))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Untracked Files */}
            {untrackedFiles.length > 0 && (
              <div>
                <div
                  onClick={() => setIsUntrackedOpen(!isUntrackedOpen)}
                  className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-bodhi-muted hover:text-BODHI-text cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    {isUntrackedOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <span className="tracking-wide text-[11px]">UNTRACKED FILES</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono text-emerald-400">
                      {untrackedFiles.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        untrackedFiles.forEach((f) => stageFile(f.relativePath))
                      }}
                      title="Stage All Untracked"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white rounded"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {isUntrackedOpen && (
                  <div className="py-0.5">
                    {untrackedFiles.map((f) => renderFileRow(f, 'untracked'))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 4. Stashes Accordion */}
        <div className="border-t border-BODHI-border/60 pt-1">
          <div
            onClick={() => setIsStashOpen(!isStashOpen)}
            className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-bodhi-muted hover:text-BODHI-text cursor-pointer group"
          >
            <div className="flex items-center gap-1">
              {isStashOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <Archive size={12} />
              <span className="tracking-wide text-[11px]">STASHES</span>
            </div>
            <div className="flex items-center gap-1">
              {stashes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono text-bodhi-muted">
                  {stashes.length}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStashInput(!showStashInput)
                  setIsStashOpen(true)
                }}
                title="Stash Changes"
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white rounded"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {isStashOpen && (
            <div className="px-2 py-1 space-y-1">
              {showStashInput && (
                <div className="flex gap-1.5 p-1">
                  <input
                    type="text"
                    placeholder="Stash message..."
                    value={stashInput}
                    onChange={(e) => setStashInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateStash()
                      if (e.key === 'Escape') setShowStashInput(false)
                    }}
                    className="flex-1 px-2 py-1 rounded bg-bodhi-surface border border-BODHI-border text-xs text-white focus:outline-none focus:border-bodhi-accent"
                  />
                  <button
                    onClick={handleCreateStash}
                    className="px-2 py-1 rounded bg-bodhi-accent text-black font-semibold text-xs"
                  >
                    Save
                  </button>
                </div>
              )}

              {stashes.length === 0 ? (
                <div className="text-[11px] text-bodhi-muted/70 px-2 py-1 italic">
                  No stashes saved
                </div>
              ) : (
                stashes.map((s) => (
                  <div
                    key={s.index}
                    className="group flex items-center justify-between px-2 py-1 rounded hover:bg-bodhi-surface text-xs"
                  >
                    <div className="truncate flex-1 mr-2">
                      <span className="font-mono text-[10px] text-bodhi-accent mr-1.5">
                        stash@&#123;{s.index}&#125;
                      </span>
                      <span className="text-white">{s.message || 'WIP on ' + branch}</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={() => stashPop(s.index)}
                        title="Pop stash (apply and drop)"
                        className="px-1.5 py-0.5 rounded bg-bodhi-panel hover:bg-BODHI-active text-[10px] text-white"
                      >
                        Pop
                      </button>
                      <button
                        onClick={() => stashDrop(s.index)}
                        title="Drop stash"
                        className="p-1 hover:text-rose-400 text-bodhi-muted rounded"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. Commit History Accordion */}
        <div className="border-t border-BODHI-border/60 pt-1">
          <div
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-bodhi-muted hover:text-BODHI-text cursor-pointer group"
          >
            <div className="flex items-center gap-1">
              {isHistoryOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <History size={12} />
              <span className="tracking-wide text-[11px]">COMMITS LOG</span>
            </div>
            {commitHistory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono text-bodhi-muted">
                {commitHistory.length}
              </span>
            )}
          </div>

          {isHistoryOpen && (
            <div className="px-2 py-1 space-y-1 max-h-60 overflow-y-auto">
              {commitHistory.length === 0 ? (
                <div className="text-[11px] text-bodhi-muted/70 px-2 py-1 italic">
                  No commits yet
                </div>
              ) : (
                commitHistory.map((c) => (
                  <div
                    key={c.hash}
                    className="p-2 rounded hover:bg-bodhi-surface/70 border border-transparent hover:border-BODHI-border text-xs transition-colors space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[150px]">
                        {c.message}
                      </span>
                      <span className="font-mono text-[10px] text-bodhi-accent">{c.shortHash}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-bodhi-muted">
                      <span>{c.author}</span>
                      <span>{c.relativeTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal overlays */}
      <PublishToGitHubModal />
      <BranchSwitcherModal />
    </div>
  )
}
