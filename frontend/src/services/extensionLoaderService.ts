import * as monaco from 'monaco-editor'
import { ExtensionSnippetItem, ExtensionThemeItem } from '@shared/types'

let activeDisposables: monaco.IDisposable[] = []
let isInitialized = false

// Map VS Code language identifiers to Monaco Editor languages
const LANGUAGE_MAP: Record<string, string[]> = {
  javascript: ['javascript'],
  js: ['javascript'],
  typescript: ['typescript'],
  ts: ['typescript'],
  javascriptreact: ['javascript'],
  typescriptreact: ['typescript'],
  jsx: ['javascript'],
  tsx: ['typescript'],
  html: ['html'],
  css: ['css'],
  scss: ['scss'],
  less: ['less'],
  json: ['json'],
  python: ['python'],
  py: ['python'],
  markdown: ['markdown'],
  md: ['markdown'],
  rust: ['rust'],
  rs: ['rust'],
  go: ['go'],
  java: ['java'],
  c: ['c'],
  cpp: ['cpp'],
  csharp: ['csharp'],
  cs: ['csharp'],
  php: ['php'],
  ruby: ['ruby'],
  shell: ['shell'],
  shellscript: ['shell'],
  bash: ['shell'],
  yaml: ['yaml'],
  xml: ['xml'],
  sql: ['sql']
}

function normalizeLanguages(langStr?: string): string[] {
  if (!langStr || !langStr.trim()) {
    // Default fallback to common web languages
    return ['javascript', 'typescript']
  }

  const parts = langStr.split(',').map((s) => s.trim().toLowerCase())
  const result = new Set<string>()

  for (const part of parts) {
    if (LANGUAGE_MAP[part]) {
      for (const m of LANGUAGE_MAP[part]) {
        result.add(m)
      }
    } else {
      result.add(part)
    }
  }

  return Array.from(result)
}

export class ExtensionLoaderService {
  /**
   * Initializes and loads all installed extension contributions (snippets & themes).
   */
  public async initialize(): Promise<void> {
    if (isInitialized) return
    isInitialized = true

    await this.reloadSnippets()
    await this.reloadThemes()
  }

  /**
   * Hot-reloads all active extension contributions (snippets & themes) into Monaco Editor
   * immediately without requiring an application restart.
   */
  public async hotReload(): Promise<{ snippetCount: number; themeCount: number }> {
    isInitialized = true
    const snippetCount = await this.reloadSnippets()
    const themeCount = await this.reloadThemes()
    return { snippetCount, themeCount }
  }

  /**
   * Fetches active snippets from main process and registers completion providers in Monaco.
   */
  public async reloadSnippets(): Promise<number> {
    // Clean up existing providers
    for (const disposable of activeDisposables) {
      try {
        disposable.dispose()
      } catch (err) {
        console.warn('Failed to dispose snippet provider:', err)
      }
    }
    activeDisposables = []

    try {
      const snippets: ExtensionSnippetItem[] =
        await window.bodhiAPI.extensionsGetSnippets()
      if (!snippets || snippets.length === 0) return 0

      // Group snippets by target Monaco language
      const snippetsByLang = new Map<string, ExtensionSnippetItem[]>()

      for (const snippet of snippets) {
        const langs = normalizeLanguages(snippet.language || snippet.scope)
        for (const lang of langs) {
          if (!snippetsByLang.has(lang)) {
            snippetsByLang.set(lang, [])
          }
          snippetsByLang.get(lang)!.push(snippet)
        }
      }

      // Register completion item provider for each language
      for (const [lang, langSnippets] of snippetsByLang.entries()) {
        const disposable = monaco.languages.registerCompletionItemProvider(lang, {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const range: monaco.IRange = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }

            const items: monaco.languages.CompletionItem[] = []

            for (const s of langSnippets) {
              const prefixes = Array.isArray(s.prefix) ? s.prefix : [s.prefix]
              const body = Array.isArray(s.body) ? s.body.join('\n') : s.body

              for (const prefix of prefixes) {
                if (!prefix) continue

                items.push({
                  label: prefix,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  documentation: {
                    value: [
                      `**${s.name}**`,
                      s.description ? `_${s.description}_` : '',
                      '',
                      '```' + lang,
                      body,
                      '```',
                      '',
                      `*From extension: ${s.sourceExtensionName}*`
                    ]
                      .filter(Boolean)
                      .join('\n')
                  },
                  detail: s.description || `${s.sourceExtensionName}: ${prefix}`,
                  insertText: body,
                  insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  range,
                  sortText: `0_${prefix}` // prioritize snippets
                })
              }
            }

            return { suggestions: items }
          }
        })

        activeDisposables.push(disposable)
      }
      return snippets.length
    } catch (err) {
      console.error('[ExtensionLoaderService] Failed to load snippets:', err)
      return 0
    }
  }

  /**
   * Fetches active themes from main process and defines them in Monaco.
   */
  public async reloadThemes(): Promise<number> {
    try {
      const themes: ExtensionThemeItem[] = await window.bodhiAPI.extensionsGetThemes()
      if (!themes || themes.length === 0) return 0

      for (const t of themes) {
        if (!t.themeData) continue

        const colors = t.themeData.colors || {}
        const tokenColors = t.themeData.tokenColors || []

        const rules: monaco.editor.ITokenThemeRule[] = []
        if (Array.isArray(tokenColors)) {
          for (const tc of tokenColors) {
            if (!tc.settings) continue
            const scopes = Array.isArray(tc.scope)
              ? tc.scope
              : typeof tc.scope === 'string'
                ? tc.scope.split(',')
                : ['']

            for (const scope of scopes) {
              const cleanScope = scope.trim()
              if (!cleanScope) continue

              const rule: monaco.editor.ITokenThemeRule = {
                token: cleanScope
              }
              if (tc.settings.foreground) {
                rule.foreground = tc.settings.foreground.replace('#', '')
              }
              if (tc.settings.fontStyle) {
                rule.fontStyle = tc.settings.fontStyle
              }
              rules.push(rule)
            }
          }
        }

        const base =
          t.uiTheme === 'vs'
            ? 'vs'
            : t.uiTheme === 'hc-black'
              ? 'hc-black'
              : 'vs-dark'

        monaco.editor.defineTheme(t.id, {
          base,
          inherit: true,
          rules,
          colors
        })
      }
      return themes.length
    } catch (err) {
      console.error('[ExtensionLoaderService] Failed to load themes:', err)
      return 0
    }
  }
}

export const extensionLoaderService = new ExtensionLoaderService()

