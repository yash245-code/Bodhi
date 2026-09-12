import {
  AIChatRequest,
  AICompletionRequest,
  AIEditRequest,
  AIResponse,
  EditorSettings
} from '../../shared/types'

export class AIService {
  /**
   * Helper to determine provider and API key from request settings or environment
   */
  private getProviderConfig(settings?: EditorSettings): {
    provider: 'google-gemini' | 'openai' | 'anthropic'
    apiKey: string
    temperature: number
    maxTokens: number
  } {
    let provider = (settings?.aiModelProvider || 'google-gemini') as
      | 'google-gemini'
      | 'openai'
      | 'anthropic'
    const apiKey = (
      settings?.aiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      ''
    )
      .trim()
      .replace(/^["'`]|["'`]$/g, '')
      .trim()

    // Smart provider auto-correction if key prefix clearly belongs to another provider
    if (apiKey.startsWith('sk-ant-') && provider !== 'anthropic') {
      console.log('[AIService] Key starts with sk-ant-, auto-switching provider to Anthropic')
      provider = 'anthropic'
    } else if (
      (apiKey.startsWith('sk-') || apiKey.startsWith('org-')) &&
      !apiKey.startsWith('sk-ant-') &&
      provider !== 'openai'
    ) {
      console.log('[AIService] Key starts with sk-, auto-switching provider to OpenAI')
      provider = 'openai'
    } else if (
      (apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.')) &&
      provider !== 'google-gemini'
    ) {
      console.log('[AIService] Key starts with AIzaSy/AQ., auto-switching provider to Google Gemini')
      provider = 'google-gemini'
    }

    const temperature = settings?.aiTemperature ?? 0.2
    const maxTokens = settings?.aiMaxTokens ?? 2048

    return { provider, apiKey, temperature, maxTokens }
  }

  /**
   * Helper to strip markdown code blocks if present
   */
  private cleanCodeBlock(text: string): string {
    let clean = text.trim()
    // If wrapped in ```lang ... ```
    if (clean.startsWith('```')) {
      const firstNewline = clean.indexOf('\n')
      if (firstNewline !== -1) {
        clean = clean.substring(firstNewline + 1)
      }
      if (clean.endsWith('```')) {
        clean = clean.substring(0, clean.length - 3).trimEnd()
      }
    }
    return clean
  }

  /**
   * Generates inline Ghost Text code completion (Copilot style)
   */
  public async generateCompletion(req: AICompletionRequest): Promise<AIResponse> {
    const { provider, apiKey, temperature } = this.getProviderConfig(req.settings)

    if (!apiKey) {
      return {
        text: '',
        error: 'No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure.'
      }
    }

    const prefix = req.prefix || ''
    const suffix = req.suffix || ''
    const lang = req.language || 'typescript'

    // Concise completion prompt optimized for low latency
    const prompt = `You are a high-speed AI code completion assistant inside BODHI EDITOR.
Complete the code immediately following the cursor.
Return ONLY the raw completion text that directly completes the line or statement.
Do NOT include markdown code blocks, backticks, explanations, or commentary.

Language: ${lang}
Code before cursor:
${prefix.slice(-1200)}

Code after cursor:
${suffix.slice(0, 300)}`

    try {
      const rawText = await this.callProvider(
        provider,
        apiKey,
        [
          {
            role: 'system',
            content:
              'You are a code completion engine. Return only the raw text to be inserted at the cursor.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: Math.min(temperature, 0.2), maxTokens: 512 }
      )

      const cleaned = this.cleanCodeBlock(rawText)
      return { text: cleaned }
    } catch (err: any) {
      console.error('[AIService] Completion failed:', err)
      return { text: '', error: err.message || 'Completion request failed' }
    }
  }

  /**
   * Generates inline edit / refactoring (Ctrl+K style)
   */
  public async generateEdit(req: AIEditRequest): Promise<AIResponse> {
    const { provider, apiKey, temperature, maxTokens } = this.getProviderConfig(
      req.settings
    )

    if (!apiKey) {
      return {
        text: '',
        error: 'No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure.'
      }
    }

    const prompt = `You are an expert pair-programming software engineer inside BODHI EDITOR.
The user wants to edit or transform the following code snippet according to their instruction.

Language: ${req.language || 'typescript'}
Instruction: ${req.prompt}

Target Code to transform:
${req.code}

${req.context ? `Surrounding Context:\n${req.context.slice(0, 1000)}\n` : ''}

Output Requirement:
Return ONLY the updated replacement code.
Do NOT wrap the output in markdown code fences (\`\`\`) unless specifically instructed.
Do NOT include preamble, comments about what you did, or conversational text.`

    try {
      const rawText = await this.callProvider(
        provider,
        apiKey,
        [
          {
            role: 'system',
            content:
              'You are an expert code editor. Output only the modified code cleanly.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature, maxTokens }
      )

      const cleaned = this.cleanCodeBlock(rawText)
      return { text: cleaned }
    } catch (err: any) {
      console.error('[AIService] Edit failed:', err)
      return { text: '', error: err.message || 'Edit request failed' }
    }
  }

  /**
   * Conversational Assistant (Sidebar Chat with file context)
   */
  public async chat(req: AIChatRequest): Promise<AIResponse> {
    const { provider, apiKey, temperature, maxTokens } = this.getProviderConfig(
      req.settings
    )

    if (!apiKey) {
      return {
        text: '',
        error: 'No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure.'
      }
    }

    const systemPrompt = `You are Bodhi AI, a highly capable software engineering copilot integrated directly inside Bodhi Code Editor.
You write clean, modular, modern, bug-free code.
When generating code snippets, always format them with standard markdown code blocks and identify the language (e.g. \`\`\`tsx).
Keep responses helpful, technical, concise, and focused on solving the user's coding questions.`

    const formattedMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt }
    ]

    // If active file context is provided, attach as system / user context
    if (req.contextFile) {
      formattedMessages.push({
        role: 'user',
        content: `[Current Active File: ${req.contextFile.name} (${req.contextFile.language || 'plain text'})]\n\`\`\`${req.contextFile.language || ''}\n${req.contextFile.content.slice(0, 8000)}\n\`\`\``
      })
      formattedMessages.push({
        role: 'assistant',
        content: `I see the active file "${req.contextFile.name}". How can I help you with this code?`
      })
    }

    // Append conversation history
    for (const msg of req.messages) {
      formattedMessages.push({ role: msg.role, content: msg.content })
    }

    try {
      const text = await this.callProvider(provider, apiKey, formattedMessages, {
        temperature,
        maxTokens
      })
      return { text }
    } catch (err: any) {
      console.error('[AIService] Chat failed:', err)
      return { text: '', error: err.message || 'Chat request failed' }
    }
  }

  /**
   * Internal router to call LLM provider APIs
   */
  private async callProvider(
    provider: 'google-gemini' | 'openai' | 'anthropic',
    apiKey: string,
    messages: { role: string; content: string }[],
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim()
    switch (provider) {
      case 'google-gemini':
        return await this.callGemini(cleanKey, messages, options)
      case 'openai':
        return await this.callOpenAI(cleanKey, messages, options)
      case 'anthropic':
        return await this.callAnthropic(cleanKey, messages, options)
      default:
        return await this.callGemini(cleanKey, messages, options)
    }
  }

  /**
   * Google Gemini API call with dynamic model discovery and multi-version fallback
   */
  private async callGemini(
    apiKey: string,
    messages: { role: string; content: string }[],
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim()

    // Extract system message if any
    const systemMsg = messages.find((m) => m.role === 'system')?.content
    const nonSystemMsgs = messages.filter((m) => m.role !== 'system')

    const contents = nonSystemMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const body: any = {
      contents,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    }

    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: systemMsg }]
      }
    }

    // Filter to ensure only text chat models are used (exclude TTS, audio, image, etc.)
    const isChatTextModel = (name: string): boolean => {
      const lower = name.toLowerCase()
      return (
        !lower.includes('tts') &&
        !lower.includes('audio') &&
        !lower.includes('transcribe') &&
        !lower.includes('image') &&
        !lower.includes('embedding') &&
        !lower.includes('robotics') &&
        !lower.includes('computer-use') &&
        !lower.includes('veo') &&
        !lower.includes('lyria') &&
        !lower.includes('banana')
      )
    }

    // High-quota, ultra-low-latency Gemini text models
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ]

    let lastError: Error | null = null

    for (const apiVer of ['v1beta', 'v1']) {
      for (const modelName of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })

          const rawText = await res.text()

          if (res.ok) {
            let json: any
            try {
              json = JSON.parse(rawText)
            } catch {
              throw new Error('Gemini returned an invalid JSON response.')
            }

            const candidate = json.candidates?.[0]
            const parts = candidate?.content?.parts || []
            const part =
              parts.find(
                (p: any) => typeof p.text === 'string' && p.text.trim().length > 0
              ) || parts[0]
            const text = part?.text
            if (typeof text === 'string' && text.length > 0) {
              return text
            }

            // If empty text candidate in 200 response, continue to next model
            lastError = new Error('Gemini candidate was empty')
            continue
          }

          // If 404 (model retired) or 429 (quota exceeded), continue to next candidate model!
          if (res.status === 404 || res.status === 429) {
            lastError = new Error(`Gemini API Error (${res.status}): ${rawText}`)
            continue
          }

          // For other non-recoverable errors (e.g. 400 invalid argument or 403 forbidden), stop
          throw new Error(`Gemini API Error (${res.status}): ${rawText}`)
        } catch (err: any) {
          if (!err.message?.includes('404') && !err.message?.includes('429')) {
            throw err
          }
          lastError = err
        }
      }
    }

    throw (
      lastError ||
      new Error(
        'Gemini models returned 404. Ensure your key was created at https://aistudio.google.com/app/apikey'
      )
    )
  }

  /**
   * OpenAI API call
   */
  private async callOpenAI(
    apiKey: string,
    messages: { role: string; content: string }[],
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim()
    const url = 'https://api.openai.com/v1/chat/completions'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI API Error (${res.status}): ${errText}`)
    }

    const json = (await res.json()) as any
    const text = json.choices?.[0]?.message?.content
    if (typeof text !== 'string') {
      throw new Error('OpenAI returned an empty response.')
    }
    return text
  }

  /**
   * Anthropic Claude API call
   */
  private async callAnthropic(
    apiKey: string,
    messages: { role: string; content: string }[],
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim()
    const url = 'https://api.anthropic.com/v1/messages'

    const systemMsg = messages.find((m) => m.role === 'system')?.content
    const nonSystemMsgs = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))

    const body: any = {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: nonSystemMsgs
    }

    if (systemMsg) {
      body.system = systemMsg
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cleanKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Anthropic API Error (${res.status}): ${errText}`)
    }

    const json = (await res.json()) as any
    const text = json.content?.[0]?.text
    if (typeof text !== 'string') {
      throw new Error('Anthropic returned an empty response.')
    }
    return text
  }

  /**
   * Tests API key connectivity and returns human-readable diagnostic status
   */
  public async testConnection(
    rawProvider?: string,
    rawKey?: string
  ): Promise<{
    success: boolean
    message: string
    detectedProvider?: string
    modelUsed?: string
  }> {
    const key = (rawKey || '').trim().replace(/^["'`]|["'`]$/g, '').trim()
    if (!key) {
      return {
        success: false,
        message: 'Please enter an API key to test.'
      }
    }

    let provider = (rawProvider || 'google-gemini') as
      | 'google-gemini'
      | 'openai'
      | 'anthropic'
    let detectedProvider = provider

    if (key.startsWith('sk-ant-')) {
      detectedProvider = 'anthropic'
    } else if (key.startsWith('sk-') || key.startsWith('org-')) {
      detectedProvider = 'openai'
    } else if (key.startsWith('AIzaSy') || key.startsWith('AQ.')) {
      detectedProvider = 'google-gemini'
    }

    if (detectedProvider !== provider) {
      provider = detectedProvider
    }

    // Google Gemini specialized diagnostic probe
    if (provider === 'google-gemini') {
      try {
        let discoveredModels: string[] = []
        let rawError: string | null = null

        // Directly test with gemini-3.6-flash
        try {
          const reply = await this.callGemini(
            key,
            [{ role: 'user', content: 'Say "OK"' }],
            { temperature: 0.1, maxTokens: 512 }
          )
          return {
            success: true,
            detectedProvider,
            modelUsed: 'gemini-3.1-flash-lite',
            message: `Connected successfully to Google Gemini! Response: "${reply.trim()}"`
          }
        } catch (callErr: any) {
          rawError = callErr.message || String(callErr)
        }

        let detail = rawError || ''
        try {
          const parsed = JSON.parse(rawError || '{}')
          detail = parsed.error?.message || detail
        } catch {}

        if (detail.includes('API_KEY_INVALID') || detail.includes('not valid')) {
          return {
            success: false,
            detectedProvider,
            message:
              'Invalid API Key. Google reports this key does not exist. Please generate a valid free key at https://aistudio.google.com/app/apikey'
          }
        }

        return {
          success: false,
          detectedProvider,
          message: `Gemini rejected key: ${
            detail ||
            'No generative models found. Make sure this key was created in Google AI Studio (https://aistudio.google.com/app/apikey), not standard Google Cloud Console without the Generative Language API.'
          }`
        }
      } catch (err: any) {
        return {
          success: false,
          detectedProvider,
          message: `Connection error: ${err.message || 'Failed to reach Google Gemini'}`
        }
      }
    }

    // OpenAI or Anthropic test
    try {
      const testMessages = [{ role: 'user', content: 'Reply with "OK"' }]
      const reply = await this.callProvider(provider, key, testMessages, {
        temperature: 0.1,
        maxTokens: 10
      })

      return {
        success: true,
        detectedProvider,
        message: `Successfully connected to ${provider.toUpperCase()}! Response: "${reply.trim()}"`
      }
    } catch (err: any) {
      return {
        success: false,
        detectedProvider,
        message: err.message || 'Connection failed'
      }
    }
  }
}

export const aiService = new AIService()
