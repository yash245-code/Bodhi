import { BrowserWindow } from 'electron'
import * as os from 'os'
import * as fsSync from 'fs'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { IPC_CHANNELS } from '../../shared/constants'
import { TerminalDataPayload, ShellProfile } from '../../shared/types'

interface ITerminalInstance {
  write: (data: string) => void
  resize: (cols: number, rows: number) => void
  kill: () => void
}

export class TerminalService {
  private terminals = new Map<string, ITerminalInstance>()
  private pendingWrites = new Map<string, string[]>()
  private mainWindow: BrowserWindow | null = null

  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  public getAvailableShells(): ShellProfile[] {
    const isWindows = os.platform() === 'win32'
    const shells: ShellProfile[] = []

    if (isWindows) {
      // 1. Check PowerShell 7 / Core
      const pwshCandidates = [
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PowerShell', '7', 'pwsh.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'PowerShell', '7', 'pwsh.exe')
      ]
      let foundPwsh = false
      for (const p of pwshCandidates) {
        if (fsSync.existsSync(p)) {
          shells.push({
            id: 'pwsh',
            name: 'PowerShell 7',
            shell: 'powershell',
            path: p,
            description: 'PowerShell Core 7 (Modern, Cross-Platform)',
            iconType: 'powershell'
          })
          foundPwsh = true
          break
        }
      }

      // 2. Windows PowerShell (Built-in)
      const winPsPath = process.env.SystemRoot
        ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
        : 'powershell.exe'
      shells.push({
        id: 'powershell',
        name: foundPwsh ? 'Windows PowerShell' : 'PowerShell',
        shell: 'powershell',
        path: winPsPath,
        description: 'Default Windows PowerShell',
        iconType: 'powershell'
      })

      // 3. Command Prompt
      const cmdPath = process.env.COMSPEC || `${process.env.SystemRoot || 'C:\\Windows'}\\System32\\cmd.exe`
      shells.push({
        id: 'cmd',
        name: 'Command Prompt',
        shell: 'cmd',
        path: cmdPath,
        description: 'Windows CMD Shell',
        iconType: 'cmd'
      })

      // 4. Git Bash
      const gitBashCandidates = [
        'C:\\Program Files\\Git\\bin\\bash.exe',
        'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Git', 'bin', 'bash.exe')
      ]
      for (const candidate of gitBashCandidates) {
        if (fsSync.existsSync(candidate)) {
          shells.push({
            id: 'git-bash',
            name: 'Git Bash',
            shell: 'bash',
            path: candidate,
            description: 'Bash for Windows with Git tools',
            iconType: 'bash'
          })
          break
        }
      }

      // 5. WSL (Windows Subsystem for Linux)
      const wslPath = `${process.env.SystemRoot || 'C:\\Windows'}\\System32\\wsl.exe`
      if (fsSync.existsSync(wslPath)) {
        shells.push({
          id: 'wsl',
          name: 'WSL / Ubuntu',
          shell: 'wsl',
          path: wslPath,
          description: 'Windows Subsystem for Linux',
          iconType: 'wsl'
        })
      }
    } else {
      // macOS / Linux
      if (fsSync.existsSync('/bin/zsh')) {
        shells.push({
          id: 'zsh',
          name: 'Zsh',
          shell: 'bash',
          path: '/bin/zsh',
          description: 'Z Shell',
          iconType: 'bash'
        })
      }
      if (fsSync.existsSync('/bin/bash')) {
        shells.push({
          id: 'bash',
          name: 'Bash',
          shell: 'bash',
          path: '/bin/bash',
          description: 'Bourne Again Shell',
          iconType: 'bash'
        })
      }
    }

    return shells
  }

  private resolveShell(shellType?: string): { shell: string; args: string[] } {
    const isWindows = os.platform() === 'win32'
    const type = (shellType || 'default').toLowerCase()

    if (!isWindows) {
      if (type === 'bash') return { shell: '/bin/bash', args: ['-i'] }
      if (type === 'zsh') return { shell: '/bin/zsh', args: ['-i'] }
      if (type === 'sh') return { shell: '/bin/sh', args: ['-i'] }
      return { shell: process.env.SHELL || '/bin/bash', args: ['-i'] }
    }

    if (type === 'cmd') {
      return { shell: process.env.COMSPEC || 'cmd.exe', args: ['/K'] }
    }

    if (type === 'bash' || type === 'git-bash') {
      const gitBashCandidates = [
        'C:\\Program Files\\Git\\bin\\bash.exe',
        'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Git', 'bin', 'bash.exe'),
        'bash.exe'
      ]
      for (const candidate of gitBashCandidates) {
        if (candidate === 'bash.exe' || fsSync.existsSync(candidate)) {
          return { shell: candidate, args: ['--login', '-i'] }
        }
      }
      return { shell: 'bash.exe', args: ['--login', '-i'] }
    }

    if (type === 'wsl') {
      return { shell: 'wsl.exe', args: [] }
    }

    if (type === 'pwsh') {
      const pwshCandidates = [
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PowerShell', '7', 'pwsh.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'PowerShell', '7', 'pwsh.exe')
      ]
      for (const p of pwshCandidates) {
        if (fsSync.existsSync(p)) {
          return { shell: p, args: ['-NoLogo'] }
        }
      }
    }

    // Default to PowerShell
    return {
      shell: process.env.SystemRoot
        ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
        : 'powershell.exe',
      args: ['-NoLogo']
    }
  }

  public async createTerminal(id: string, cwd?: string, shellType?: string): Promise<boolean> {
    this.killTerminal(id)

    const workingDirectory = cwd && fsSync.existsSync(cwd) ? cwd : os.homedir()
    const { shell: resolvedShell, args: shellArgs } = this.resolveShell(shellType)

    // 1. Try spawning with node-pty first
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pty = require('node-pty')

      const ptyProcess = pty.spawn(resolvedShell, shellArgs, {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: workingDirectory,
        env: process.env as Record<string, string>,
        useConpty: false
      })

      const instance: ITerminalInstance = {
        write: (data: string) => {
          try {
            ptyProcess.write(data)
          } catch {
            // ignore
          }
        },
        resize: (cols: number, rows: number) => {
          try {
            if (cols >= 2 && rows >= 2 && !isNaN(cols) && !isNaN(rows)) {
              ptyProcess.resize(Math.floor(cols), Math.floor(rows))
            }
          } catch {
            // ignore resize failure
          }
        },
        kill: () => {
          try {
            ptyProcess.kill()
          } catch {
            // ignore
          }
        }
      }

      this.terminals.set(id, instance)

      ptyProcess.onData((data: string) => {
        this.sendData(id, data)
      })

      ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
        // Only clean up if this instance is still the active one
        if (this.terminals.get(id) === instance) {
          this.terminals.delete(id)
          this.pendingWrites.delete(id)
          this.sendExit(id, exitCode)
        }
      })

      // Flush any pending keystrokes queued before process finished spawning
      const queued = this.pendingWrites.get(id)
      if (queued && queued.length > 0) {
        for (const data of queued) {
          instance.write(data)
        }
        this.pendingWrites.delete(id)
      }

      return true
    } catch (nodePtyErr) {
      console.warn('node-pty native module unavailable, falling back to child_process shell:', nodePtyErr)
    }

    // 2. Fallback to child_process interactive shell
    try {
      const fallbackArgs = resolvedShell.toLowerCase().includes('powershell')
        ? ['-NoLogo', '-NoExit', '-Command', '-']
        : shellArgs

      const proc: ChildProcess = spawn(resolvedShell, fallbackArgs, {
        cwd: workingDirectory,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      })

      const instance: ITerminalInstance = {
        write: (data: string) => {
          try {
            if (proc.stdin && !proc.stdin.destroyed) {
              proc.stdin.write(data)
            }
          } catch {
            // ignore
          }
        },
        resize: () => {
          // No-op for standard pipes
        },
        kill: () => {
          try {
            proc.kill()
          } catch {
            // ignore
          }
        }
      }

      this.terminals.set(id, instance)

      proc.stdout?.on('data', (data: Buffer) => {
        this.sendData(id, data.toString('utf-8'))
      })

      proc.stderr?.on('data', (data: Buffer) => {
        this.sendData(id, data.toString('utf-8'))
      })

      proc.on('exit', (code: number | null) => {
        if (this.terminals.get(id) === instance) {
          this.terminals.delete(id)
          this.pendingWrites.delete(id)
          this.sendExit(id, code ?? 0)
        }
      })

      // Flush queued writes
      const queued = this.pendingWrites.get(id)
      if (queued && queued.length > 0) {
        for (const data of queued) {
          instance.write(data)
        }
        this.pendingWrites.delete(id)
      }

      // Send initial welcome notice
      this.sendData(id, `\x1b[38;2;93;214;44m[Bodhi Terminal Ready: ${workingDirectory}]\x1b[0m\r\n`)

      return true
    } catch (fallbackErr) {
      console.error(`Failed to create terminal [${id}]:`, fallbackErr)
      return false
    }
  }

  private sendData(id: string, data: string): void {
    const payload: TerminalDataPayload = { id, data }
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.TERMINAL_DATA, payload)
      }
    }
  }

  private sendExit(id: string, exitCode: number): void {
    const payload = { id, exitCode }
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.TERMINAL_EXIT, payload)
      }
    }
  }

  public writeTerminal(id: string, data: string): void {
    const term = this.terminals.get(id)
    if (term) {
      term.write(data)
    } else {
      const queued = this.pendingWrites.get(id) || []
      queued.push(data)
      this.pendingWrites.set(id, queued)
    }
  }

  public resizeTerminal(id: string, cols: number, rows: number): void {
    if (!cols || !rows || cols < 2 || rows < 2 || isNaN(cols) || isNaN(rows)) {
      return
    }
    const term = this.terminals.get(id)
    if (term) {
      term.resize(cols, rows)
    }
  }

  public killTerminal(id: string): void {
    const term = this.terminals.get(id)
    if (term) {
      this.terminals.delete(id)
      try {
        term.kill()
      } catch (err) {
        console.warn(`[terminalService] Error killing terminal session ${id}:`, err)
      }
    }
    this.pendingWrites.delete(id)
  }

  public killAll(): void {
    for (const [id] of this.terminals) {
      this.killTerminal(id)
    }
    this.pendingWrites.clear()
  }
}

export const terminalService = new TerminalService()
