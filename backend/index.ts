import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { registerIpcHandlers } from './ipcHandlers'
import { fileService } from './services/fileService'
import { terminalService } from './services/terminalService'
import { postgresService } from './services/postgresService'
import { authService } from './services/authService'

process.on('uncaughtException', (error) => {
  console.error('[Bodhi Main Process] Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Bodhi Main Process] Unhandled Rejection:', reason)
})

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let extensionsWindow: BrowserWindow | null = null

function getAppIconPath(): string | undefined {
  const isDev = !app.isPackaged
  const filename = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
  const candidates = isDev
    ? [join(__dirname, '../../resources', filename)]
    : [
        join(process.resourcesPath, 'resources', filename),
        join(process.resourcesPath, filename)
      ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return undefined
}

export function openSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) {
      settingsWindow.restore()
    }
    settingsWindow.show()
    settingsWindow.focus()
    return settingsWindow
  }

  const iconPath = getAppIconPath()

  settingsWindow = new BrowserWindow({
    title: 'Settings - Bodhi',
    width: 780,
    height: 560,
    minWidth: 640,
    minHeight: 460,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' as const } : {}),
    backgroundColor: '#0f1117',
    ...(iconPath ? { icon: iconPath } : {}),
    parent: mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  settingsWindow.on('ready-to-show', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.show()
    }
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  settingsWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/settings`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/settings'
    })
  }

  return settingsWindow
}

export function openExtensionsWindow(): BrowserWindow {
  if (extensionsWindow && !extensionsWindow.isDestroyed()) {
    if (extensionsWindow.isMinimized()) {
      extensionsWindow.restore()
    }
    extensionsWindow.show()
    extensionsWindow.focus()
    return extensionsWindow
  }

  const iconPath = getAppIconPath()

  extensionsWindow = new BrowserWindow({
    title: 'Extensions - Bodhi',
    width: 980,
    height: 680,
    minWidth: 800,
    minHeight: 520,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' as const } : {}),
    backgroundColor: '#0f1117',
    ...(iconPath ? { icon: iconPath } : {}),
    parent: mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  extensionsWindow.on('ready-to-show', () => {
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.show()
    }
  })

  extensionsWindow.on('closed', () => {
    extensionsWindow = null
  })

  extensionsWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    extensionsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/extensions`)
  } else {
    extensionsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/extensions'
    })
  }

  return extensionsWindow
}

function createWindow(): void {
  const iconPath = getAppIconPath()

  mainWindow = new BrowserWindow({
    title: 'Bodhi',
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 550,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' as const } : {}),
    backgroundColor: '#0f1117',
    ...(iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registerIpcHandlers(mainWindow, openSettingsWindow, openExtensionsWindow)

  let hasShown = false
  const showMainWindow = (): void => {
    if (!hasShown && mainWindow && !mainWindow.isDestroyed()) {
      hasShown = true
      mainWindow.show()
      mainWindow.focus()
    }
  }

  mainWindow.once('ready-to-show', showMainWindow)

  // Fallback: guarantee the window is displayed even if ready-to-show is delayed by network or rendering
  setTimeout(showMainWindow, 1000)

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Bodhi] Renderer failed to load [${errorCode}]: ${errorDescription} (${validatedURL})`)
    showMainWindow()
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Bodhi] Renderer process gone:', details)
  })

  // Automatically close child windows when main window closes
  mainWindow.on('close', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close()
    }
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.close()
    }
  })

  mainWindow.on('closed', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close()
    }
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.close()
    }
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  await authService.init().catch(() => {})
  await postgresService.init().catch(() => {})
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  fileService.stopWatcher()
  terminalService.killAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  fileService.stopWatcher()
  terminalService.killAll()
  postgresService.disconnect().catch(() => {})
})
