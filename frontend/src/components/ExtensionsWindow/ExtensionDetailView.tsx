import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Package,
  Download,
  RefreshCw,
  Power,
  Trash2,
  FileCode2,
  BookOpen,
  ExternalLink,
  Copy,
  CheckCheck
} from 'lucide-react'
import { marked } from 'marked'
import {
  InstalledExtension,
  MarketplaceExtension,
  ExtensionSnippetItem
} from '@shared/types'

interface ExtensionDetailViewProps {
  extension: InstalledExtension | MarketplaceExtension
  isInstalled: boolean
  isInstalling: boolean
  isEnabled?: boolean
  onBack: () => void
  onInstall: (ext: MarketplaceExtension) => Promise<boolean | void>
  onUninstall: (id: string) => Promise<boolean | void>
  onToggle?: (id: string, enabled: boolean) => Promise<boolean | void>
}

type DetailTab = 'overview' | 'snippets' | 'details'

export const ExtensionDetailView: React.FC<ExtensionDetailViewProps> = ({
  extension,
  isInstalled,
  isInstalling,
  isEnabled = true,
  onBack,
  onInstall,
  onUninstall,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [readmeHtml, setReadmeHtml] = useState<string>('')
  const [isLoadingReadme, setIsLoadingReadme] = useState(true)
  const [snippets, setSnippets] = useState<ExtensionSnippetItem[]>([])
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const namespace =
    'namespace' in extension ? extension.namespace : extension.publisher
  const openVsxUrl = `https://open-vsx.org/extension/${namespace}/${extension.name}`

  // Fetch README
  useEffect(() => {
    let isCancelled = false
    setIsLoadingReadme(true)

    const fetchReadme = async (): Promise<void> => {
      try {
        const text = await window.bodhiAPI.extensionsGetReadme(
          extension.id,
          namespace,
          extension.name
        )
        if (!isCancelled) {
          const parsed = await marked.parse(text)
          setReadmeHtml(parsed)
          setIsLoadingReadme(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setReadmeHtml('<p class="text-bodhi-muted">Failed to load documentation.</p>')
          setIsLoadingReadme(false)
        }
      }
    }

    fetchReadme()
    return () => {
      isCancelled = true
    }
  }, [extension.id, namespace, extension.name])

  // Fetch Snippets if installed
  useEffect(() => {
    if (activeTab === 'snippets') {
      setIsLoadingSnippets(true)
      window.bodhiAPI
        .extensionsGetSnippetsForExt(extension.id)
        .then((items) => {
          setSnippets(items || [])
          setIsLoadingSnippets(false)
        })
        .catch(() => {
          setSnippets([])
          setIsLoadingSnippets(false)
        })
    }
  }, [activeTab, extension.id])

  const handleCopy = (code: string | string[], id: string): void => {
    const text = Array.isArray(code) ? code.join('\n') : code
    navigator.clipboard.writeText(text)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 1500)
  }

  return (
    <div className="h-full flex flex-col bg-bodhi-bg text-white overflow-hidden select-text animate-fade-in">
      {/* Top Breadcrumb Bar */}
      <div className="h-11 px-6 flex items-center gap-3 border-b border-BODHI-border/70 bg-bodhi-panel/40 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-bodhi-muted hover:text-white transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-bodhi-surface"
        >
          <ArrowLeft size={14} />
          <span>Back to Extensions</span>
        </button>
        <span className="text-BODHI-border/70 text-sm">/</span>
        <span className="text-xs font-semibold text-white truncate max-w-[300px]">
          {extension.displayName || extension.name}
        </span>
      </div>

      {/* Main Extension Header Card */}
      <div className="p-6 border-b border-BODHI-border/60 bg-BODHI-sidebar/30 shrink-0">
        <div className="flex items-start gap-5">
          {/* Extension Icon */}
          <div className="w-16 h-16 rounded-2xl bg-bodhi-panel flex items-center justify-center shrink-0 border border-BODHI-border/80 overflow-hidden shadow-lg p-2">
            {extension.icon ? (
              <img
                src={extension.icon}
                alt={extension.displayName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <Package size={32} className="text-bodhi-accent" />
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                  {extension.displayName || extension.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bodhi-surface text-bodhi-muted border border-BODHI-border font-mono font-normal">
                    v{extension.version}
                  </span>
                </h1>
                <p className="text-xs text-bodhi-muted mt-0.5">
                  By <span className="text-white font-medium">{namespace}</span> •{' '}
                  <span className="font-mono text-bodhi-muted/80">{extension.id}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isInstalled ? (
                  <>
                    <button
                      onClick={() => onToggle?.(extension.id, !isEnabled)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isEnabled
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'text-bodhi-muted bg-bodhi-surface border-BODHI-border hover:text-white'
                      }`}
                    >
                      <Power size={13} />
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => onUninstall(extension.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 size={13} />
                      Uninstall
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      onInstall(extension as MarketplaceExtension)
                    }
                    disabled={isInstalling}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md ${
                      isInstalling
                        ? 'bg-bodhi-surface text-bodhi-muted border border-BODHI-border cursor-wait'
                        : 'bg-bodhi-accent text-black hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {isInstalling ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Install Extension
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed max-w-3xl">
              {extension.description}
            </p>

            {/* Badges / Stats Rail */}
            <div className="flex items-center gap-4 mt-3 text-xs text-bodhi-muted flex-wrap">
              {'downloadCount' in extension && extension.downloadCount ? (
                <span className="flex items-center gap-1">
                  <Download size={13} className="text-bodhi-accent" />
                  <span className="text-white font-medium font-mono">
                    {extension.downloadCount > 1000
                      ? `${(extension.downloadCount / 1000).toFixed(1)}k`
                      : extension.downloadCount}
                  </span>{' '}
                  downloads
                </span>
              ) : null}

              {'snippetsCount' in extension && extension.snippetsCount ? (
                <span className="flex items-center gap-1">
                  <FileCode2 size={13} className="text-amber-400" />
                  <span className="text-white font-medium font-mono">
                    {extension.snippetsCount}
                  </span>{' '}
                  snippets included
                </span>
              ) : null}

              <a
                href={openVsxUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-bodhi-accent hover:underline ml-auto"
              >
                <span>View on Open VSX</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="px-6 border-b border-BODHI-border/70 bg-bodhi-panel/20 flex items-center gap-4 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'text-bodhi-accent border-bodhi-accent'
              : 'text-bodhi-muted border-transparent hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          <span>Documentation & Overview</span>
        </button>

        {isInstalled && (
          <button
            onClick={() => setActiveTab('snippets')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'snippets'
                ? 'text-bodhi-accent border-bodhi-accent'
                : 'text-bodhi-muted border-transparent hover:text-white'
            }`}
          >
            <FileCode2 size={14} />
            <span>Contributed Snippets</span>
          </button>
        )}
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: OVERVIEW / README */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl">
            {isLoadingReadme ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-bodhi-muted text-xs">
                <RefreshCw size={22} className="animate-spin text-bodhi-accent" />
                <span>Loading extension documentation...</span>
              </div>
            ) : (
              <div
                className="markdown-body text-slate-200 text-xs leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: readmeHtml }}
              />
            )}
          </div>
        )}

        {/* TAB 2: SNIPPETS EXPLORER */}
        {activeTab === 'snippets' && (
          <div className="max-w-4xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Available Snippet Triggers
                </h3>
                <p className="text-xs text-bodhi-muted mt-0.5">
                  Type these prefixes in your editor to expand boilerplate code.
                </p>
              </div>
              <span className="text-xs font-mono text-bodhi-muted">
                {snippets.length} snippets found
              </span>
            </div>

            {isLoadingSnippets ? (
              <div className="py-12 text-center text-xs text-bodhi-muted">
                <RefreshCw size={18} className="animate-spin text-bodhi-accent mx-auto mb-2" />
                Loading snippets...
              </div>
            ) : snippets.length === 0 ? (
              <div className="p-8 rounded-xl bg-bodhi-surface/40 border border-BODHI-border text-center text-xs text-bodhi-muted">
                No individual snippet triggers detected in this extension package.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {snippets.map((snip, idx) => {
                  const prefixes = Array.isArray(snip.prefix)
                    ? snip.prefix.join(', ')
                    : snip.prefix
                  const body = Array.isArray(snip.body)
                    ? snip.body.join('\n')
                    : snip.body

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-bodhi-surface/50 border border-BODHI-border/70 hover:border-bodhi-accent/40 transition-all flex flex-col gap-2.5 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono font-bold text-bodhi-accent bg-bodhi-panel px-2 py-0.5 rounded-md border border-BODHI-border">
                            {prefixes}
                          </code>
                          <span className="text-xs font-semibold text-white">
                            {snip.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {snip.language && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bodhi-panel text-bodhi-muted border border-BODHI-border uppercase">
                              {snip.language}
                            </span>
                          )}
                          <button
                            onClick={() => handleCopy(body, `${idx}`)}
                            title="Copy snippet code"
                            className="p-1 rounded-md text-bodhi-muted hover:text-white hover:bg-bodhi-surface transition-colors"
                          >
                            {copiedSnippet === `${idx}` ? (
                              <CheckCheck size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {snip.description && (
                        <p className="text-xs text-bodhi-muted">
                          {snip.description}
                        </p>
                      )}

                      <pre className="text-[11px] font-mono bg-bodhi-panel/90 text-emerald-300/90 p-3 rounded-lg border border-BODHI-border/60 overflow-x-auto max-h-48">
                        <code>{body}</code>
                      </pre>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

