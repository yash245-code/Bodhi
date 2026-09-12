import React, { useState, useEffect } from 'react'
import {
  Lock,
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  Key
} from 'lucide-react'
import { GithubIcon } from '../common/GithubIcon'
import { useGitStore } from '../../store/useGitStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useAuthStore } from '../../store/useAuthStore'

export const PublishToGitHubModal: React.FC = () => {
  const { isPublishModalOpen, closePublishModal, refreshGitStatus } = useGitStore()
  const { rootPath } = useWorkspaceStore()
  const { githubUser, githubToken, connectGitHub, isLoading: isAuthLoading, openAuthModal } = useAuthStore()

  const defaultRepoName = rootPath
    ? rootPath.split(/[/\\]/).filter(Boolean).pop() || 'my-project'
    : 'my-project'

  const [repoName, setRepoName] = useState(defaultRepoName)
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [patInput, setPatInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isPublishModalOpen) {
      setRepoName(defaultRepoName)
      setErrorMsg(null)
      setPublishedUrl(null)
      setPublishStatus(null)
    }
  }, [isPublishModalOpen, defaultRepoName])

  if (!isPublishModalOpen) return null

  const handleConnectPAT = async (): Promise<void> => {
    if (!patInput.trim()) return
    setErrorMsg(null)
    const success = await connectGitHub(patInput.trim())
    if (!success) {
      setErrorMsg('Invalid token. Ensure token has "repo" scope.')
    } else {
      setPatInput('')
    }
  }

  const handlePublish = async (): Promise<void> => {
    if (!rootPath || !repoName.trim() || !window.bodhiAPI?.githubPublishRepo) return

    setIsPublishing(true)
    setErrorMsg(null)
    setPublishStatus('Connecting to GitHub & creating repository...')

    try {
      const res = await window.bodhiAPI.githubPublishRepo(
        rootPath,
        {
          repoName: repoName.trim(),
          description: description.trim(),
          isPrivate
        },
        githubToken || undefined
      )

      if (res.success && res.htmlUrl) {
        setPublishStatus(null)
        setPublishedUrl(res.htmlUrl)
        await refreshGitStatus()
      } else {
        setErrorMsg(res.error || 'Failed to publish to GitHub')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during publishing.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-md bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-BODHI-border flex items-center justify-between bg-BODHI-sidebar">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bodhi-surface border border-BODHI-border flex items-center justify-center text-white">
              <GithubIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Publish to GitHub</h3>
              <p className="text-[11px] text-bodhi-muted">
                Push your local project directly to a new GitHub repository
              </p>
            </div>
          </div>
          <button
            onClick={closePublishModal}
            className="p-1 text-bodhi-muted hover:text-white rounded-md hover:bg-bodhi-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {publishedUrl ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Successfully Published!</h4>
                <p className="text-bodhi-muted text-[11px] mt-1 max-w-xs mx-auto">
                  Your project is now live on GitHub and tracked with remote origin.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-bodhi-surface border border-BODHI-border font-mono text-[11px] text-bodhi-accent truncate">
                {publishedUrl}
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bodhi-accent text-black font-semibold text-xs hover:brightness-110 transition-all"
                >
                  <ExternalLink size={13} />
                  <span>Open on GitHub</span>
                </a>
                <button
                  onClick={closePublishModal}
                  className="px-4 py-2 rounded-lg bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-white text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* GitHub Connection Badge */}
              <div className="p-3 rounded-lg bg-bodhi-surface/70 border border-BODHI-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {githubUser ? (
                    <>
                      <img
                        src={githubUser.avatarUrl}
                        alt={githubUser.name}
                        className="w-7 h-7 rounded-full border border-BODHI-border"
                      />
                      <div>
                        <div className="font-semibold text-white text-xs">{githubUser.login}</div>
                        <div className="text-[10px] text-bodhi-muted">Connected GitHub Account</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-full bg-bodhi-panel border border-BODHI-border flex items-center justify-center text-bodhi-muted">
                        <Key size={13} />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">GitHub Not Connected</div>
                        <div className="text-[10px] text-bodhi-muted">Token required to create repositories</div>
                      </div>
                    </>
                  )}
                </div>

                {!githubUser && (
                  <button
                    onClick={() => openAuthModal()}
                    className="px-2.5 py-1 rounded bg-bodhi-panel hover:bg-BODHI-active border border-BODHI-border text-[11px] text-bodhi-accent transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Quick PAT input if user hasn't connected token yet */}
              {!githubUser && (
                <div className="space-y-1.5 p-3 rounded-lg bg-bodhi-bg border border-BODHI-border">
                  <label className="text-[11px] font-medium text-bodhi-muted flex items-center gap-1">
                    <span>Or enter GitHub Personal Access Token (PAT):</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={patInput}
                      onChange={(e) => setPatInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded bg-bodhi-panel border border-BODHI-border text-xs text-white focus:outline-none focus:border-bodhi-accent"
                    />
                    <button
                      onClick={handleConnectPAT}
                      disabled={!patInput.trim() || isAuthLoading}
                      className="px-3 py-1.5 rounded bg-bodhi-accent text-black font-semibold text-xs disabled:opacity-50"
                    >
                      {isAuthLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* Repository Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-bodhi-muted">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. bodhi-awesome-app"
                  className="w-full px-3 py-2 rounded-lg bg-bodhi-surface border border-BODHI-border text-white text-xs focus:outline-none focus:border-bodhi-accent"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-bodhi-muted">
                  Description <span className="text-bodhi-muted/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of your project"
                  className="w-full px-3 py-2 rounded-lg bg-bodhi-surface border border-BODHI-border text-white text-xs focus:outline-none focus:border-bodhi-accent"
                />
              </div>

              {/* Visibility Options */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-bodhi-muted">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      isPrivate
                        ? 'bg-bodhi-accent/10 border-bodhi-accent text-white shadow-xs'
                        : 'bg-bodhi-surface border-BODHI-border text-bodhi-muted hover:text-white'
                    }`}
                  >
                    <Lock size={15} className={isPrivate ? 'text-bodhi-accent' : ''} />
                    <div>
                      <div className="font-semibold text-xs">Private</div>
                      <div className="text-[10px] opacity-70">Only you can see</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      !isPrivate
                        ? 'bg-bodhi-accent/10 border-bodhi-accent text-white shadow-xs'
                        : 'bg-bodhi-surface border-BODHI-border text-bodhi-muted hover:text-white'
                    }`}
                  >
                    <Globe size={15} className={!isPrivate ? 'text-bodhi-accent' : ''} />
                    <div>
                      <div className="font-semibold text-xs">Public</div>
                      <div className="text-[10px] opacity-70">Anyone on the internet</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {/* Publish Button */}
              <div className="pt-2">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !repoName.trim() || (!githubUser && !githubToken)}
                  className="w-full py-2.5 rounded-lg bg-bodhi-accent text-black font-semibold flex items-center justify-center gap-2 text-xs hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{publishStatus || 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      <span>Publish Repository to GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
