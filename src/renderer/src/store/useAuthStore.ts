import { create } from 'zustand'
import { UserProfile, GitHubUser } from '@shared/types'

interface AuthState {
  user: UserProfile | null
  githubUser: GitHubUser | null
  githubToken: string | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authError: string | null

  // Actions
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
  openAuthModal: () => void
  closeAuthModal: () => void
  checkAuthStatus: () => Promise<void>
  connectGitHub: (token: string) => Promise<boolean>
  disconnectGitHub: () => Promise<void>
  refreshGitHubUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  githubUser: null,
  githubToken: null,
  isLoading: false,
  isAuthModalOpen: false,
  authError: null,

  openAuthModal: () => set({ isAuthModalOpen: true, authError: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authError: null }),

  checkAuthStatus: async () => {
    if (!window.bodhiAPI) return
    try {
      // 1. Check Google user session
      const currentUser = await window.bodhiAPI.authGetCurrentUser?.()
      if (currentUser) {
        set({ user: currentUser })
      }

      // 2. Check GitHub token & profile
      const storedToken = await window.bodhiAPI.githubGetStoredToken?.()
      if (storedToken) {
        set({ githubToken: storedToken })
        const ghUser = await window.bodhiAPI.githubValidateToken?.(storedToken)
        if (ghUser) {
          set({ githubUser: ghUser })
        }
      }
    } catch (err) {
      console.error('Failed to check auth status:', err)
    }
  },

  loginWithGoogle: async () => {
    if (!window.bodhiAPI?.authLoginGoogle) return false
    set({ isLoading: true, authError: null })
    try {
      const res = await window.bodhiAPI.authLoginGoogle()
      if (res.success && res.user) {
        set({ user: res.user, isLoading: false, isAuthModalOpen: false })
        return true
      } else {
        set({ isLoading: false, authError: res.error || 'Google login failed' })
        return false
      }
    } catch (err: any) {
      set({ isLoading: false, authError: err.message || 'Login failed' })
      return false
    }
  },

  logout: async () => {
    if (!window.bodhiAPI?.authLogout) return
    try {
      await window.bodhiAPI.authLogout()
      set({ user: null })
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  },

  connectGitHub: async (token: string) => {
    if (!token || !window.bodhiAPI?.githubValidateToken) return false
    set({ isLoading: true, authError: null })
    try {
      const ghUser = await window.bodhiAPI.githubValidateToken(token.trim())
      if (ghUser) {
        await window.bodhiAPI.githubSetStoredToken?.(token.trim())
        set({
          githubUser: ghUser,
          githubToken: token.trim(),
          isLoading: false
        })
        return true
      } else {
        set({
          isLoading: false,
          authError: 'Invalid GitHub Personal Access Token or permissions.'
        })
        return false
      }
    } catch (err: any) {
      set({ isLoading: false, authError: err.message || 'Failed to validate GitHub token' })
      return false
    }
  },

  disconnectGitHub: async () => {
    if (!window.bodhiAPI?.githubClearStoredToken) return
    try {
      await window.bodhiAPI.githubClearStoredToken()
      set({ githubUser: null, githubToken: null })
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err)
    }
  },

  refreshGitHubUser: async () => {
    const { githubToken } = get()
    if (!githubToken || !window.bodhiAPI?.githubValidateToken) return
    try {
      const ghUser = await window.bodhiAPI.githubValidateToken(githubToken)
      if (ghUser) {
        set({ githubUser: ghUser })
      }
    } catch {
      // ignore
    }
  }
}))
