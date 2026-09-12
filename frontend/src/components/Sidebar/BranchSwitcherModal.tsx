import React, { useState, useEffect, useRef } from 'react'
import {
  GitBranch,
  Search,
  Plus,
  Check,
  Globe,
  Trash2,
  X,
  GitMerge
} from 'lucide-react'
import { useGitStore } from '../../store/useGitStore'

export const BranchSwitcherModal: React.FC = () => {
  const {
    isBranchModalOpen,
    closeBranchModal,
    branches,
    branch: currentBranch,
    checkoutBranch,
    deleteBranch,
    mergeBranch,
    refreshBranches,
    isLoading
  } = useGitStore()

  const [search, setSearch] = useState('')
  const [newBranchMode, setNewBranchMode] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isBranchModalOpen) {
      setSearch('')
      setNewBranchMode(false)
      setNewBranchName('')
      setActionError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isBranchModalOpen])

  if (!isBranchModalOpen) return null

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectBranch = async (branchName: string): Promise<void> => {
    setActionError(null)
    const success = await checkoutBranch(branchName, false)
    if (success) {
      closeBranchModal()
    } else {
      setActionError(`Could not checkout branch ${branchName}`)
    }
  }

  const handleCreateBranch = async (): Promise<void> => {
    if (!newBranchName.trim()) return
    setActionError(null)
    const sanitized = newBranchName.trim().replace(/\s+/g, '-')
    const success = await checkoutBranch(sanitized, true)
    if (success) {
      closeBranchModal()
    } else {
      setActionError(`Failed to create and checkout branch "${sanitized}"`)
    }
  }

  const handleDelete = async (e: React.MouseEvent, branchName: string): Promise<void> => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete branch "${branchName}"?`)) {
      await deleteBranch(branchName, true)
      await refreshBranches()
    }
  }

  const handleMerge = async (e: React.MouseEvent, branchName: string): Promise<void> => {
    e.stopPropagation()
    if (confirm(`Merge branch "${branchName}" into current branch "${currentBranch}"?`)) {
      const res = await mergeBranch(branchName)
      if (res.success) {
        closeBranchModal()
      } else {
        setActionError(res.message)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={closeBranchModal}
    >
      <div
        className="w-full max-w-md bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-BODHI-border flex items-center gap-2 bg-BODHI-sidebar">
          <Search size={15} className="text-bodhi-muted shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              newBranchMode
                ? 'Enter new branch name (e.g. feature/auth)...'
                : 'Select or search a branch to checkout...'
            }
            value={newBranchMode ? newBranchName : search}
            onChange={(e) =>
              newBranchMode ? setNewBranchName(e.target.value) : setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeBranchModal()
              if (e.key === 'Enter') {
                if (newBranchMode) {
                  handleCreateBranch()
                } else if (filteredBranches.length > 0) {
                  handleSelectBranch(filteredBranches[0].name)
                }
              }
            }}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-bodhi-muted focus:outline-none"
          />
          {newBranchMode ? (
            <button
              onClick={() => setNewBranchMode(false)}
              className="px-2 py-1 rounded text-[11px] text-bodhi-muted hover:text-white"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setNewBranchMode(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-[11px] text-bodhi-accent transition-colors"
            >
              <Plus size={12} />
              <span>New</span>
            </button>
          )}
          <button
            onClick={closeBranchModal}
            className="p-1 text-bodhi-muted hover:text-white rounded"
          >
            <X size={15} />
          </button>
        </div>

        {/* Error Notification */}
        {actionError && (
          <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Branch List */}
        <div className="max-h-72 overflow-y-auto py-1">
          {newBranchMode ? (
            <div className="p-4 text-center space-y-3">
              <p className="text-xs text-bodhi-muted">
                Create branch <span className="text-white font-mono font-bold">"{newBranchName || '...'}"</span> from <span className="text-bodhi-accent font-mono">{currentBranch || 'HEAD'}</span>
              </p>
              <button
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim() || isLoading}
                className="px-4 py-2 rounded-lg bg-bodhi-accent text-black font-semibold text-xs disabled:opacity-50 transition-transform active:scale-95"
              >
                Create and Switch Branch
              </button>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="py-8 text-center text-bodhi-muted text-xs">
              <GitBranch size={24} className="mx-auto mb-2 opacity-50" />
              <div>No matching branches found</div>
              {search && (
                <button
                  onClick={() => {
                    setNewBranchName(search)
                    setNewBranchMode(true)
                  }}
                  className="mt-2 text-bodhi-accent hover:underline text-xs"
                >
                  Create branch "{search}"?
                </button>
              )}
            </div>
          ) : (
            filteredBranches.map((b) => {
              const isCurrent = b.name === currentBranch
              return (
                <div
                  key={`${b.remote ? 'r' : 'l'}-${b.name}`}
                  onClick={() => handleSelectBranch(b.name)}
                  className={`group flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-bodhi-accent/15 text-bodhi-accent font-semibold'
                      : 'text-BODHI-text hover:bg-bodhi-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {b.remote ? (
                      <Globe size={13} className="text-bodhi-muted shrink-0" />
                    ) : (
                      <GitBranch
                        size={13}
                        className={isCurrent ? 'text-bodhi-accent shrink-0' : 'text-bodhi-muted shrink-0'}
                      />
                    )}
                    <span className="truncate font-mono">{b.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-bodhi-accent/20 border border-bodhi-accent/40 font-sans">
                        current
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isCurrent ? (
                      <Check size={14} className="text-bodhi-accent shrink-0" />
                    ) : (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => handleMerge(e, b.name)}
                          title={`Merge "${b.name}" into "${currentBranch}"`}
                          className="p-1 hover:text-white rounded hover:bg-BODHI-active text-bodhi-muted"
                        >
                          <GitMerge size={12} />
                        </button>
                        {!b.remote && (
                          <button
                            onClick={(e) => handleDelete(e, b.name)}
                            title={`Delete branch "${b.name}"`}
                            className="p-1 hover:text-rose-400 rounded hover:bg-BODHI-active text-bodhi-muted"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
