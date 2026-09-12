import { WorkspaceSession, RecentWorkspace, Tab } from '@shared/types'

const SESSION_KEY = 'BODHI_workspace_session'
const RECENT_WORKSPACES_KEY = 'BODHI_recent_workspaces'

export class SessionService {
  public saveSession(session: WorkspaceSession): void {
    try {
      // Create a lightweight copy of tabs without multi-megabyte contents to prevent storage quota issues
      const sanitizeTabs = (tabs: Tab[] = []) =>
        tabs.map((t) => ({
          ...t,
          // Only save content if there are unsaved edits; otherwise re-read from disk on launch
          content: t.isDirty ? t.content : ''
        }))

      const cleanSession: WorkspaceSession = {
        ...session,
        tabs: sanitizeTabs(session.tabs),
        pane2Tabs: sanitizeTabs(session.pane2Tabs)
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(cleanSession))
    } catch (err) {
      console.warn('Failed to persist workspace session to localStorage:', err)
    }
  }

  public loadSession(): WorkspaceSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as WorkspaceSession
      return parsed
    } catch (err) {
      console.warn('Failed to parse workspace session from localStorage:', err)
      return null
    }
  }

  public clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
  }

  public getRecentWorkspaces(): RecentWorkspace[] {
    try {
      const raw = localStorage.getItem(RECENT_WORKSPACES_KEY)
      if (!raw) return []
      return JSON.parse(raw) as RecentWorkspace[]
    } catch {
      return []
    }
  }

  public addRecentWorkspace(workspacePath: string): RecentWorkspace[] {
    if (!workspacePath) return this.getRecentWorkspaces()
    try {
      const recents = this.getRecentWorkspaces()
      const normalizedPath = workspacePath.replace(/[/\\]+$/, '')
      const name = normalizedPath.split(/[/\\]/).pop() || normalizedPath

      // Filter out existing occurrence of this path
      const filtered = recents.filter(
        (r) => r.path.toLowerCase() !== normalizedPath.toLowerCase()
      )

      // Add to front with fresh timestamp
      const updated: RecentWorkspace[] = [
        { path: normalizedPath, name, lastOpened: Date.now() },
        ...filtered
      ].slice(0, 15) // Keep top 15 recent projects

      localStorage.setItem(RECENT_WORKSPACES_KEY, JSON.stringify(updated))
      return updated
    } catch {
      return []
    }
  }

  public removeRecentWorkspace(workspacePath: string): RecentWorkspace[] {
    try {
      const recents = this.getRecentWorkspaces()
      const updated = recents.filter(
        (r) => r.path.toLowerCase() !== workspacePath.toLowerCase()
      )
      localStorage.setItem(RECENT_WORKSPACES_KEY, JSON.stringify(updated))
      return updated
    } catch {
      return []
    }
  }
}

export const sessionService = new SessionService()
