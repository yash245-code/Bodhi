import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { TerminalSession } from '@shared/types'
import { useEditorStore } from '../../store/useEditorStore'

export interface TerminalInstanceHandle {
  findNext: (
    query: string,
    options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }
  ) => { current: number; total: number }
  findPrev: (
    query: string,
    options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }
  ) => { current: number; total: number }
  clearSearch: () => void
  focus: () => void
}

interface TerminalInstanceProps {
  session: TerminalSession
  isActive: boolean
  rootPath: string | null
}

export const TerminalInstance = forwardRef<TerminalInstanceHandle, TerminalInstanceProps>(
  ({ session, isActive, rootPath }, ref) => {
    const { settings, openFileAtLocation, toggleTerminalSearch } = useEditorStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const isCreatedRef = useRef(false)
    const isActiveRef = useRef(isActive)
    const activeMatchIndexRef = useRef<number>(-1)

    useEffect(() => {
      isActiveRef.current = isActive
    }, [isActive])

    // Update theme cursor/selection dynamically on accentColor change
    useEffect(() => {
      if (xtermRef.current && settings.accentColor) {
        xtermRef.current.options.theme = {
          ...xtermRef.current.options.theme,
          cursor: settings.accentColor,
          selectionBackground: `${settings.accentColor}4D`
        }
      }
    }, [settings.accentColor])

    const handleFit = useCallback(() => {
      const term = xtermRef.current
      const fitAddon = fitAddonRef.current
      const container = containerRef.current
      if (!term || !fitAddon || !container) return
      if (container.clientWidth === 0 || container.clientHeight === 0) return

      try {
        fitAddon.fit()
        if (term.cols >= 2 && term.rows >= 2) {
          window.bodhiAPI.resizeTerminal(session.id, term.cols, term.rows)
        }
      } catch {
        // ignore
      }
    }, [session.id])

    // Helper: collect all search matches in current terminal buffer
    const getBufferMatches = useCallback(
      (
        query: string,
        options: { matchCase: boolean; wholeWord: boolean; isRegex: boolean }
      ): Array<{ startX: number; y: number; length: number }> => {
        const term = xtermRef.current
        if (!term || !query) return []

        const buffer = term.buffer.active
        const totalLines = buffer.length
        const matches: Array<{ startX: number; y: number; length: number }> = []

        let regex: RegExp
        try {
          let pattern = options.isRegex
            ? query
            : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          if (options.wholeWord) {
            pattern = `\\b${pattern}\\b`
          }
          regex = new RegExp(pattern, options.matchCase ? 'g' : 'gi')
        } catch {
          return []
        }

        for (let y = 0; y < totalLines; y++) {
          const line = buffer.getLine(y)
          if (!line) continue
          const lineStr = line.translateToString(true)
          let match: RegExpExecArray | null
          regex.lastIndex = 0
          while ((match = regex.exec(lineStr)) !== null) {
            matches.push({
              startX: match.index,
              y,
              length: match[0].length
            })
            if (!regex.global) break
          }
        }

        return matches
      },
      []
    )

    // Expose search and navigation handles
    useImperativeHandle(
      ref,
      () => ({
        findNext: (query, options) => {
          const term = xtermRef.current
          if (!term || !query) return { current: 0, total: 0 }

          const matches = getBufferMatches(query, options)
          if (matches.length === 0) {
            activeMatchIndexRef.current = -1
            term.clearSelection()
            return { current: 0, total: 0 }
          }

          let nextIndex = activeMatchIndexRef.current + 1
          if (nextIndex >= matches.length) {
            nextIndex = 0
          }
          activeMatchIndexRef.current = nextIndex
          const currentMatch = matches[nextIndex]

          term.select(currentMatch.startX, currentMatch.y, currentMatch.length)
          term.scrollToLine(Math.max(0, currentMatch.y - 2))

          return { current: nextIndex + 1, total: matches.length }
        },
        findPrev: (query, options) => {
          const term = xtermRef.current
          if (!term || !query) return { current: 0, total: 0 }

          const matches = getBufferMatches(query, options)
          if (matches.length === 0) {
            activeMatchIndexRef.current = -1
            term.clearSelection()
            return { current: 0, total: 0 }
          }

          let prevIndex = activeMatchIndexRef.current - 1
          if (prevIndex < 0) {
            prevIndex = matches.length - 1
          }
          activeMatchIndexRef.current = prevIndex
          const currentMatch = matches[prevIndex]

          term.select(currentMatch.startX, currentMatch.y, currentMatch.length)
          term.scrollToLine(Math.max(0, currentMatch.y - 2))

          return { current: prevIndex + 1, total: matches.length }
        },
        clearSearch: () => {
          activeMatchIndexRef.current = -1
          xtermRef.current?.clearSelection()
        },
        focus: () => {
          xtermRef.current?.focus()
        }
      }),
      [getBufferMatches]
    )

    // Setup xterm instance and PTY process
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const term = new XTerm({
        theme: {
          background: '#0F0F0F',
          foreground: '#F8F8F8',
          cursor: settings.accentColor || '#5DD62C',
          cursorAccent: '#0F0F0F',
          selectionBackground: `${settings.accentColor || '#5DD62C'}4D`,
          black: '#202020',
          red: '#f87171',
          green: '#5DD62C',
          yellow: '#facc15',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#38bdf8',
          white: '#F8F8F8',
          brightBlack: '#555555',
          brightRed: '#ef4444',
          brightGreen: '#6ee03f',
          brightYellow: '#eab308',
          brightBlue: '#3b82f6',
          brightMagenta: '#a855f7',
          brightCyan: '#06b6d4',
          brightWhite: '#ffffff'
        },
        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
        fontSize: settings.terminalFontSize || 13,
        lineHeight: 1.2,
        cursorBlink: true,
        cursorStyle: 'block',
        convertEol: true
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(container)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Custom link provider for Web URLs and File Stack Traces with line:column
      term.registerLinkProvider({
        provideLinks(bufferLineNumber: number, callback: (links: any[] | undefined) => void) {
          const line = term.buffer.active.getLine(bufferLineNumber - 1)
          if (!line) {
            callback(undefined)
            return
          }
          const lineStr = line.translateToString(true)
          const links: any[] = []

          // 1. Match URLs (http://, https://, localhost:3000)
          const urlRegex = /(https?:\/\/[^\s]+|localhost:\d+[^\s]*)/gi
          let match: RegExpExecArray | null
          while ((match = urlRegex.exec(lineStr)) !== null) {
            const matchedText = match[0]
            const url = matchedText.startsWith('http') ? matchedText : `http://${matchedText}`
            const startX = match.index + 1
            const length = matchedText.length
            links.push({
              range: {
                start: { x: startX, y: bufferLineNumber },
                end: { x: startX + length, y: bufferLineNumber }
              },
              text: matchedText,
              activate: () => {
                window.open(url, '_blank')
              }
            })
          }

          // 2. Match File Stack Traces (e.g. src/App.tsx:42:15, ./index.ts:10, C:\...\file.ts:25:3)
          const fileRegex =
            /((?:[a-zA-Z]:[\\/]|(?:\.{1,2}[\\/])|[\\/])?[\w\-./\\]+\.(?:ts|tsx|js|jsx|json|css|scss|html|py|rs|go|md|txt|cpp|c|cs|java|yaml|yml|toml))(?::(\d+)(?::(\d+))?)?/gi
          while ((match = fileRegex.exec(lineStr)) !== null) {
            const fullMatch = match[0]
            const rawPath = match[1]
            const lineNum = match[2] ? parseInt(match[2], 10) : 1
            const colNum = match[3] ? parseInt(match[3], 10) : 1

            const startX = match.index + 1
            const length = fullMatch.length

            links.push({
              range: {
                start: { x: startX, y: bufferLineNumber },
                end: { x: startX + length, y: bufferLineNumber }
              },
              text: fullMatch,
              activate: async () => {
                let resolvedPath = rawPath
                if (rootPath && !rawPath.match(/^[a-zA-Z]:[\\/]/) && !rawPath.startsWith('/')) {
                  const sep = rootPath.includes('\\') ? '\\' : '/'
                  resolvedPath = `${rootPath}${sep}${rawPath.replace(/^[./\\]+/, '')}`
                }
                await openFileAtLocation(resolvedPath, lineNum, colNum)
              }
            })
          }

          callback(links.length > 0 ? links : undefined)
        }
      })

      // Attach custom key event handler to ensure reliable spacebar and shortcut handling
      term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const isModifier = isMac ? event.metaKey : event.ctrlKey

        // Allow global app keyboard shortcuts to bubble up to window listeners
        if (isModifier) {
          const key = event.key.toLowerCase()

          // In-terminal search: Ctrl+F
          if (key === 'f' && !event.shiftKey) {
            if (event.type === 'keydown') {
              toggleTerminalSearch()
            }
            return false
          }

          if (
            key === 'p' ||
            key === 'r' ||
            key === 'b' ||
            key === '`' ||
            key === '~' ||
            key === ',' ||
            key === '\\' ||
            key === 'w'
          ) {
            return false
          }

          // Copy on Ctrl+C / Cmd+C when text is selected
          if (key === 'c' && term.hasSelection()) {
            if (event.type === 'keydown') {
              const selection = term.getSelection()
              navigator.clipboard.writeText(selection)
            }
            return false
          }

          // Paste on Ctrl+V / Cmd+V
          if (key === 'v') {
            if (event.type === 'keydown') {
              navigator.clipboard.readText().then((text) => {
                if (text) {
                  window.bodhiAPI.writeTerminal(session.id, text)
                }
              })
            }
            return false
          }
        }

        // Explicit Space handling: Ensure space key writes to terminal and prevents default browser scroll/action
        if (event.key === ' ' || event.code === 'Space') {
          if (event.type === 'keydown') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              window.bodhiAPI.writeTerminal(session.id, ' ')
              event.preventDefault()
              event.stopPropagation()
              return false
            }
          } else if (event.type === 'keyup' || event.type === 'keypress') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault()
              event.stopPropagation()
              return false
            }
          }
        }

        return true
      })

      // Pipe user input directly to backend PTY
      const dataDisposable = term.onData((data: string) => {
        window.bodhiAPI.writeTerminal(session.id, data)
      })

      // Receive PTY output from backend
      const unsubData = window.bodhiAPI.onTerminalData((payload) => {
        if (payload.id === session.id && xtermRef.current) {
          xtermRef.current.write(payload.data)
        }
      })

      // Handle process exit
      const unsubExit = window.bodhiAPI.onTerminalExit((payload) => {
        if (payload.id === session.id && xtermRef.current) {
          xtermRef.current.write(
            `\r\n\x1b[90m[Process exited with code ${payload.exitCode}]\x1b[0m\r\n`
          )
        }
      })

      // Create the terminal backend process
      window.bodhiAPI.createTerminal(session.id, rootPath || undefined, session.shell).then(() => {
        isCreatedRef.current = true
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          try {
            fitAddon.fit()
            if (term.cols >= 2 && term.rows >= 2) {
              window.bodhiAPI.resizeTerminal(session.id, term.cols, term.rows)
            }
          } catch {
            // ignore
          }
        }
        if (isActiveRef.current) {
          term.focus()
        }
      })

      // Observe container resizing
      const resizeObserver = new ResizeObserver(() => {
        if (isActiveRef.current && isCreatedRef.current) {
          handleFit()
        }
      })
      resizeObserver.observe(container)

      return () => {
        resizeObserver.disconnect()
        dataDisposable.dispose()
        unsubData()
        unsubExit()
        term.dispose()
        xtermRef.current = null
        fitAddonRef.current = null
        isCreatedRef.current = false
      }
    }, [session.id, session.shell, rootPath, handleFit, openFileAtLocation, settings.terminalFontSize, toggleTerminalSearch])

    // Focus and fit when this session becomes active
    useEffect(() => {
      if (!isActive) return

      const timer = setTimeout(() => {
        handleFit()
        xtermRef.current?.focus()
      }, 50)

      return () => clearTimeout(timer)
    }, [isActive, handleFit])

    const handleContainerClick = (): void => {
      xtermRef.current?.focus()
    }

    return (
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseDown={handleContainerClick}
        className={`w-full h-full overflow-hidden ${isActive ? 'block' : 'hidden'}`}
        style={{ userSelect: 'text' }}
      />
    )
  }
)

TerminalInstance.displayName = 'TerminalInstance'

