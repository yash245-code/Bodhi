import React, { useState } from 'react'
import {
  User,
  LogOut,
  X,
  CheckCircle2,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { GithubIcon } from '../common/GithubIcon'
import { useAuthStore } from '../../store/useAuthStore'

export const AccountModal: React.FC = () => {
  const {
    user,
    githubUser,
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    logout,
    connectGitHub,
    disconnectGitHub,
    isLoading,
    authError
  } = useAuthStore()

  const [patInput, setPatInput] = useState('')
  const [isPatMode, setIsPatMode] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(true)

  if (!isAuthModalOpen) return null

  const handleGoogleLogin = async (): Promise<void> => {
    await loginWithGoogle()
  }

  const handleConnectGitHub = async (): Promise<void> => {
    if (!patInput.trim()) return
    const success = await connectGitHub(patInput.trim())
    if (success) {
      setPatInput('')
      setIsPatMode(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-BODHI-border flex items-center justify-between bg-BODHI-sidebar">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bodhi-surface border border-BODHI-border flex items-center justify-center text-bodhi-accent">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bodhi Account</h3>
              <p className="text-[11px] text-bodhi-muted">
                {user ? 'Manage your Google profile & connected services' : 'Sign in to Bodhi Editor'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 text-bodhi-muted hover:text-white rounded-md hover:bg-bodhi-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {authError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {authError}
            </div>
          )}

          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-bodhi-surface/60 border border-BODHI-border flex items-center gap-3.5">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-bodhi-accent/60 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-bodhi-panel border border-BODHI-border flex items-center justify-center text-bodhi-accent text-lg font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-sm truncate">{user.name}</span>
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 size={10} />
                      Google
                    </span>
                  </div>
                  <div className="text-bodhi-muted text-[11px] truncate mt-0.5">{user.email}</div>
                  <div className="text-[10px] text-bodhi-muted/70 mt-1">
                    Last active: {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Cloud Sync Toggle */}
              <div className="p-3.5 rounded-xl bg-bodhi-bg border border-BODHI-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bodhi-surface border border-BODHI-border flex items-center justify-center text-bodhi-accent">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">Cloud Settings Sync</div>
                    <div className="text-[10px] text-bodhi-muted">
                      Automatically sync themes, snippets & preferences
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSyncEnabled(!syncEnabled)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    syncEnabled ? 'bg-bodhi-accent' : 'bg-bodhi-surface'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform ${
                      syncEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* GitHub Integration Status */}
              <div className="p-3.5 rounded-xl bg-bodhi-bg border border-BODHI-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GithubIcon size={16} className="text-white" />
                    <span className="font-semibold text-white text-xs">GitHub Integration</span>
                  </div>
                  {githubUser ? (
                    <button
                      onClick={disconnectGitHub}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPatMode(!isPatMode)}
                      className="text-[11px] text-bodhi-accent hover:underline font-medium"
                    >
                      {isPatMode ? 'Cancel' : '+ Connect GitHub'}
                    </button>
                  )}
                </div>

                {githubUser ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-bodhi-surface border border-BODHI-border">
                    <img
                      src={githubUser.avatarUrl}
                      alt={githubUser.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1 truncate font-mono text-[11px] text-white">
                      @{githubUser.login}
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck size={12} />
                      Connected
                    </span>
                  </div>
                ) : isPatMode ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-bodhi-muted">
                      Enter a Personal Access Token with <code className="text-bodhi-accent">repo</code> scope:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={patInput}
                        onChange={(e) => setPatInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-bodhi-surface border border-BODHI-border text-xs text-white focus:outline-none focus:border-bodhi-accent"
                      />
                      <button
                        onClick={handleConnectGitHub}
                        disabled={!patInput.trim() || isLoading}
                        className="px-3 py-1.5 rounded-lg bg-bodhi-accent text-black font-semibold text-xs disabled:opacity-50"
                      >
                        {isLoading ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-bodhi-muted">
                    Connect GitHub to publish and sync repositories with one click.
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="pt-2">
                <button
                  onClick={logout}
                  className="w-full py-2 rounded-lg bg-bodhi-surface hover:bg-rose-500/15 border border-BODHI-border hover:border-rose-500/30 text-bodhi-muted hover:text-rose-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out of Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-bodhi-accent/10 border border-bodhi-accent/20 flex items-center justify-center mx-auto text-bodhi-accent mb-2">
                  <Sparkles size={22} />
                </div>
                <h4 className="text-sm font-semibold text-white">Unlock Bodhi Cloud Features</h4>
                <p className="text-bodhi-muted text-[11px] max-w-xs mx-auto">
                  Sign in with your Google account to sync editor settings, keybindings, and publish repos to GitHub.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin text-slate-700" />
                    <span>Signing in via Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              {/* GitHub option as alternative */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-BODHI-border"></div>
                <span className="flex-shrink mx-3 text-[10px] text-bodhi-muted uppercase tracking-wider">
                  or connect github
                </span>
                <div className="flex-grow border-t border-BODHI-border"></div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="GitHub Personal Access Token"
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-bodhi-surface border border-BODHI-border text-xs text-white focus:outline-none focus:border-bodhi-accent"
                  />
                  <button
                    onClick={handleConnectGitHub}
                    disabled={!patInput.trim() || isLoading}
                    className="px-3.5 py-2 rounded-lg bg-bodhi-surface hover:bg-BODHI-active border border-BODHI-border text-white font-medium text-xs disabled:opacity-50 transition-colors"
                  >
                    Connect
                  </button>
                </div>
                <p className="text-[10px] text-bodhi-muted leading-tight">
                  Token is securely encrypted using OS Keychain via Electron safeStorage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
