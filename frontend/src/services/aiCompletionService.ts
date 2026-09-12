import type * as Monaco from 'monaco-editor'
import { useEditorStore } from '../store/useEditorStore'

class AICompletionService {
  private disposables: Monaco.IDisposable[] = []
  private isRegistered = false
  private rateLimitCooldownUntil = 0

  /**
   * Registers inline completion providers for supported languages in Monaco
   */
  public register(monacoInstance: typeof Monaco): void {
    if (this.isRegistered) return
    this.isRegistered = true

    const supportedLanguages = [
      'typescript',
      'javascript',
      'python',
      'html',
      'css',
      'json',
      'markdown',
      'rust',
      'go',
      'cpp',
      'c',
      'csharp',
      'java',
      'php',
      'ruby',
      'sql',
      'shell'
    ]

    for (const lang of supportedLanguages) {
      try {
        const disposable = monacoInstance.languages.registerInlineCompletionsProvider(
          lang,
          {
            provideInlineCompletions: async (model, position, _, token) => {
              const settings = useEditorStore.getState().settings

              // Only trigger if an API key is configured
              if (!settings.aiApiKey?.trim()) {
                return { items: [] }
              }

              // Check if currently cooling off from a 429 rate limit
              if (Date.now() < this.rateLimitCooldownUntil) {
                return { items: [] }
              }

              // Avoid generating on empty lines
              const lineContent = model.getLineContent(position.lineNumber)
              if (lineContent.trim().length === 0) {
                return { items: [] }
              }

              const offset = model.getOffsetAt(position)
              const fullContent = model.getValue()
              const prefix = fullContent.substring(0, offset)
              const suffix = fullContent.substring(offset)

              // Sensible debounce to protect free-tier quotas (750ms pause)
              await new Promise((resolve) => setTimeout(resolve, 750))
              if (token.isCancellationRequested) {
                return { items: [] }
              }

              try {
                const res = await window.bodhiAPI.aiGenerateCompletion({
                  prefix,
                  suffix,
                  language: lang,
                  settings
                })

                if (res.error?.includes('429') || res.error?.includes('quota')) {
                  // Cool off for 45s on quota limit
                  this.rateLimitCooldownUntil = Date.now() + 45000
                  return { items: [] }
                }

                if (token.isCancellationRequested || !res.text || res.error) {
                  return { items: [] }
                }

                return {
                  items: [
                    {
                      insertText: res.text,
                      range: new monacoInstance.Range(
                        position.lineNumber,
                        position.column,
                        position.lineNumber,
                        position.column
                      )
                    }
                  ]
                }
              } catch {
                return { items: [] }
              }
            },
            freeInlineCompletions: () => {}
          }
        )

        this.disposables.push(disposable)
      } catch (err) {
        console.warn(`[AICompletionService] Failed to register inline completion for ${lang}:`, err)
      }
    }
  }

  public dispose(): void {
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
    this.isRegistered = false
  }
}

export const aiCompletionService = new AICompletionService()

