import React, { useState, useMemo } from 'react'
import { marked } from 'marked'
import { X, BookOpen } from 'lucide-react'

interface MarkdownPreviewProps {
  content: string
  fileName?: string
  onClose?: () => void
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  fileName = 'Preview',
  onClose
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null)

  // Configure marked for GitHub-flavored markdown
  marked.setOptions({
    gfm: true,
    breaks: true
  })

  // Parse HTML
  const parsedHtml = useMemo(() => {
    try {
      return marked.parse(content || '') as string
    } catch (err) {
      console.error('Markdown parse failed:', err)
      return '<p class="text-red-400">Failed to render markdown</p>'
    }
  }, [content])

  // Attach copy buttons to <pre><code> blocks after render
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement
    const copyBtn = target.closest('.md-copy-btn') as HTMLButtonElement | null
    if (copyBtn) {
      const codeText = copyBtn.getAttribute('data-code') || ''
      navigator.clipboard.writeText(codeText)
      const btnIdx = Number(copyBtn.getAttribute('data-idx'))
      setCopiedCodeIdx(btnIdx)
      setTimeout(() => setCopiedCodeIdx(null), 2000)
    }
  }

  // Post-process HTML to inject copy buttons & styled code wrappers
  const processedHtml = useMemo(() => {
    let index = 0
    return parsedHtml.replace(
      /<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/gi,
      (_match, langClass, codeContent) => {
        const lang = (langClass || '').replace(/^language-/, '') || 'text'
        // Decode HTML entities for raw copy text
        const tempEl = document.createElement('textarea')
        tempEl.innerHTML = codeContent
        const rawCode = tempEl.value

        const idx = index++
        return `
          <div class="relative group my-4 rounded-lg overflow-hidden border border-BODHI-border bg-[#141414] shadow-md">
            <div class="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-BODHI-border text-[11px] text-bodhi-muted font-mono select-none">
              <span class="text-bodhi-accent font-semibold">${lang}</span>
              <button
                type="button"
                data-code="${rawCode.replace(/"/g, '&quot;')}"
                data-idx="${idx}"
                class="md-copy-btn flex items-center gap-1 px-2 py-0.5 rounded text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors cursor-pointer"
              >
                <span>${copiedCodeIdx === idx ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre class="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-gray-200"><code class="${langClass || ''}">${codeContent}</code></pre>
          </div>
        `
      }
    )
  }, [parsedHtml, copiedCodeIdx])

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#0d0d0d] overflow-hidden text-BODHI-text select-text">
      {/* Preview Header Bar */}
      <div className="h-8 px-3 bg-bodhi-panel border-b border-BODHI-border flex items-center justify-between shrink-0 select-none text-xs">
        <div className="flex items-center gap-2 font-medium text-BODHI-text">
          <BookOpen size={13} className="text-bodhi-accent" />
          <span className="truncate max-w-[200px]">{fileName} (Live Preview)</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            title="Close Preview"
            className="p-1 text-bodhi-muted hover:text-white hover:bg-bodhi-surface rounded transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Rendered Markdown Body */}
      <div
        onClick={handleContainerClick}
        className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full prose prose-invert prose-green text-sm leading-relaxed"
      >
        <div
          className="markdown-rendered-body"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>
    </div>
  )
}
