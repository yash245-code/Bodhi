import { useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useWorkspaceStore } from '../store/useWorkspaceStore'

export function useKeyboardShortcuts(): void {
  const {
    saveActiveTab,
    saveAllTabs,
    closeTab,
    activeTabId,
    toggleTerminal,
    toggleSidebar,
    toggleSidebarView,
    addTerminalSession,
    activeTerminalId,
    splitTerminalSession,
    toggleSplitEditor,
    toggleMarkdownPreview,
    openTab,
    openPalette,
    closePalette,
    isPaletteOpen,
    openSettingsWindow,
    setWalkthroughOpen
  } = useEditorStore()

  const { openFolder, openFileDirectly } = useWorkspaceStore()

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // F1 to open Interactive Walkthrough
      if (e.key === 'F1') {
        e.preventDefault()
        setWalkthroughOpen(true)
        return
      }

      // Escape to close palette
      if (e.key === 'Escape' && isPaletteOpen) {
        e.preventDefault()
        closePalette()
        return
      }

      if (!modifier) return

      // Quick Open: Ctrl+P / Cmd+P
      if (e.key.toLowerCase() === 'p' && !e.shiftKey) {
        e.preventDefault()
        openPalette('files')
      }
      // Command Palette: Ctrl+Shift+P / Cmd+Shift+P
      else if (e.key.toLowerCase() === 'p' && e.shiftKey) {
        e.preventDefault()
        openPalette('commands')
      }
      // Recent Projects: Ctrl+R / Cmd+R
      else if (e.key.toLowerCase() === 'r' && !e.shiftKey) {
        e.preventDefault()
        openPalette('recent-workspaces')
      }
      // Split Terminal: Ctrl+Shift+5 / Cmd+Shift+5
      else if ((e.key === '5' || e.key === '%') && e.shiftKey) {
        e.preventDefault()
        if (activeTerminalId) {
          splitTerminalSession(activeTerminalId)
        }
      }
      // Save: Ctrl+S / Cmd+S
      else if (e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault()
        await saveActiveTab()
      }
      // Save All: Ctrl+Shift+S
      else if (e.key.toLowerCase() === 's' && e.shiftKey) {
        e.preventDefault()
        await saveAllTabs()
      }
      // Close tab: Ctrl+W / Cmd+W
      else if (e.key.toLowerCase() === 'w') {
        e.preventDefault()
        if (activeTabId) {
          closeTab(activeTabId)
        }
      }
      // Toggle Terminal: Ctrl+` / Cmd+` (or New Terminal on Ctrl+Shift+`)
      else if (e.key === '`' || e.key === '~') {
        e.preventDefault()
        if (e.shiftKey) {
          addTerminalSession('powershell')
        } else {
          toggleTerminal()
        }
      }
      // Toggle Sidebar: Ctrl+B / Cmd+B
      else if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      // Split Editor: Ctrl+\ or Cmd+\
      else if (e.key === '\\' || e.code === 'Backslash') {
        e.preventDefault()
        toggleSplitEditor()
      }
      // Markdown Live Preview: Ctrl+Shift+V
      else if (e.key.toLowerCase() === 'v' && e.shiftKey) {
        e.preventDefault()
        toggleMarkdownPreview()
      }
      // Global Search: Ctrl+Shift+F
      else if (e.key.toLowerCase() === 'f' && e.shiftKey) {
        e.preventDefault()
        toggleSidebarView('search')
      }
      // Source Control (Git): Ctrl+Shift+G
      else if (e.key.toLowerCase() === 'g' && e.shiftKey) {
        e.preventDefault()
        toggleSidebarView('git')
      }
      // Explorer: Ctrl+Shift+E
      else if (e.key.toLowerCase() === 'e' && e.shiftKey) {
        e.preventDefault()
        toggleSidebarView('explorer')
      }
      // Extensions: Ctrl+Shift+X
      else if (e.key.toLowerCase() === 'x' && e.shiftKey) {
        e.preventDefault()
        window.bodhiAPI?.openExtensionsWindow?.()
      }
      // AI Assistant: Ctrl+Shift+I
      else if (e.key.toLowerCase() === 'i' && e.shiftKey) {
        e.preventDefault()
        toggleSidebarView('ai')
      }
      // Open Folder: Ctrl+Shift+O
      else if (e.key.toLowerCase() === 'o' && e.shiftKey) {
        e.preventDefault()
        await openFolder()
      }
      // Open Settings: Ctrl+, / Cmd+,
      else if (e.key === ',' || e.code === 'Comma') {
        e.preventDefault()
        openSettingsWindow()
      }
      // Open File: Ctrl+O
      else if (e.key.toLowerCase() === 'o' && !e.shiftKey) {
        e.preventDefault()
        const selectedFile = await openFileDirectly()
        if (selectedFile) {
          await openTab(selectedFile)
        }
      }
      // Zoom In: Ctrl+= / Ctrl++ / Ctrl+Shift+= / Numpad+
      else if (
        e.key === '=' ||
        e.key === '+' ||
        e.code === 'Equal' ||
        e.code === 'NumpadAdd'
      ) {
        e.preventDefault()
        if (window.bodhiAPI?.zoomIn) {
          await window.bodhiAPI.zoomIn()
        }
      }
      // Zoom Out: Ctrl+- / Ctrl+_ / Numpad-
      else if (
        e.key === '-' ||
        e.key === '_' ||
        e.code === 'Minus' ||
        e.code === 'NumpadSubtract'
      ) {
        e.preventDefault()
        if (window.bodhiAPI?.zoomOut) {
          await window.bodhiAPI.zoomOut()
        }
      }
      // Reset Zoom: Ctrl+0 / Numpad0
      else if (
        e.key === '0' ||
        e.code === 'Digit0' ||
        e.code === 'Numpad0'
      ) {
        e.preventDefault()
        if (window.bodhiAPI?.resetZoom) {
          await window.bodhiAPI.resetZoom()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    saveActiveTab,
    saveAllTabs,
    closeTab,
    activeTabId,
    toggleTerminal,
    toggleSidebar,
    openFolder,
    openFileDirectly,
    openTab,
    openPalette,
    closePalette,
    isPaletteOpen,
    openSettingsWindow
  ])
}

