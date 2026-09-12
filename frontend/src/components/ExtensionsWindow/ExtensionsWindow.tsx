import React, { useState, useEffect, useRef } from 'react'
import {
  Package,
  Search,
  RefreshCw,
  FolderDown,
  Minus,
  Square,
  X,
  BookOpen,
  Download,
  Power,
  Trash2,
  FileCode2,
  AlertCircle
} from 'lucide-react'
import {
  useExtensionStore,
  RECOMMENDED_EXTENSIONS
} from '../../store/useExtensionStore'
import { InstalledExtension, MarketplaceExtension } from '@shared/types'
import { ExtensionDetailView } from './ExtensionDetailView'
import { ExtensionTutorialView } from './ExtensionTutorialView'

type WindowTab = 'marketplace' | 'installed' | 'popular' | 'tutorial'

export const ExtensionsWindow: React.FC = () => {
  const {
    installedExtensions,
    marketplaceExtensions,
    isLoadingInstalled,
    isSearching,
    installingIds,
    searchQuery,
    errorMessage,
    loadInstalled,
    searchMarketplace,
    installFromMarketplace,
    installFromVsix,
    uninstallExtension,
    toggleExtension,
    setSearchQuery,
    clearError
  } = useExtensionStore()

  const [activeTab, setActiveTab] = useState<WindowTab>('marketplace')
  const [selectedExtension, setSelectedExtension] = useState<
    InstalledExtension | MarketplaceExtension | null
  >(null)
  const [inputVal, setInputVal] = useState(searchQuery)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    document.title = 'Extensions - Bodhi'
    loadInstalled()
  }, [loadInstalled])

  // Debounced search when user types
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!inputVal.trim()) {
      setSearchQuery('')
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(inputVal)
      searchMarketplace(inputVal)
      setActiveTab('marketplace')
      setSelectedExtension(null)
    }, 400)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputVal, setSearchQuery, searchMarketplace])

  const handleMinimize = (): void => {
    window.bodhiAPI?.minimizeWindow?.()
  }

  const handleMaximize = (): void => {
    window.bodhiAPI?.maximizeWindow?.()
  }

  const handleClose = (): void => {
    window.bodhiAPI?.closeWindow?.()
  }

  const handleRefresh = (): void => {
    loadInstalled()
    if (inputVal.trim()) {
      searchMarketplace(inputVal)
    }
  }

  const handleInstallVsix = async (): Promise<void> => {
    await installFromVsix()
  }

  const installedCount = installedExtensions.length
  const installedMap = new Map(installedExtensions.map((e) => [e.id, e]))

  // Helper to render an extension card in the grid
  const renderCard = (
    ext: InstalledExtension | MarketplaceExtension
  ): React.JSX.Element => {
    const installedExt = installedMap.get(ext.id)
    const isInstalled = !!installedExt || ('isInstalled' in ext && ext.isInstalled)
    const isInstalling = installingIds.includes(ext.id)
    const namespace = 'namespace' in ext ? ext.namespace : ext.publisher

    return (
      <div
        key={ext.id}
        onClick={() => setSelectedExtension(ext)}
        className="p-4 rounded-xl bg-cortex-panel/50 hover:bg-cortex-panel border border-cortex-border/70 hover:border-cortex-accent/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group select-none"
      >
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-cortex-surface flex items-center justify-center shrink-0 border border-cortex-border/80 overflow-hidden shadow p-1.5 group-hover:border-cortex-accent/30 transition-colors">
            {ext.icon ? (
              <img
                src={ext.icon}
                alt={ext.displayName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <Package size={22} className="text-cortex-accent" />
            )}
          </div>

          {/* Title and Metadata */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate group-hover:text-cortex-accent transition-colors">
              {ext.displayName || ext.name}
            </h4>
            <p className="text-[11px] text-cortex-muted truncate mt-0.5">
              {namespace} G�� v{ext.version}
            </p>
            <p className="text-[11px] text-slate-300/80 line-clamp-2 mt-1.5 leading-relaxed">
              {ext.description}
            </p>
          </div>
        </div>

        {/* Card Footer: Badges & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-cortex-border/40 text-[11px]">
          <div className="flex items-center gap-2">
            {'snippetsCount' in ext && ext.snippetsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20">
                <FileCode2 size={11} />
                {ext.snippetsCount} snippets
              </span>
            )}
            {'downloadCount' in ext && ext.downloadCount ? (
              <span className="text-cortex-muted text-[10px]">
                {ext.downloadCount > 1000
                  ? `${(ext.downloadCount / 1000).toFixed(1)}k installs`
                  : `${ext.downloadCount} installs`}
              </span>
            ) : null}
          </div>

          {/* Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 shrink-0"
          >
            {isInstalled ? (
              <>
                <button
                  onClick={() => toggleExtension(ext.id, !(installedExt?.enabled ?? true))}
                  title={installedExt?.enabled ? 'Disable' : 'Enable'}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    installedExt?.enabled
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                      : 'text-cortex-muted border-cortex-border bg-cortex-surface hover:text-white'
                  }`}
                >
                  <Power size={13} />
                </button>
                <button
                  onClick={() => uninstallExtension(ext.id)}
                  title="Uninstall"
                  className="p-1.5 rounded-lg text-cortex-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <button
                onClick={() => installFromMarketplace(ext as MarketplaceExtension)}
                disabled={isInstalling}
                className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isInstalling
                    ? 'bg-cortex-surface text-cortex-muted border border-cortex-border cursor-wait'
                    : 'bg-cortex-accent text-black hover:brightness-110 active:scale-95'
                }`}
              >
                {isInstalling ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Installing</span>
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    <span>Install</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-cortex-bg text-white select-none overflow-hidden font-sans border border-cortex-border/70">
      {/* 1. Custom Frameless Draggable TitleBar */}
      <header
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="h-10 bg-cortex-sidebar border-b border-cortex-border flex items-center justify-between px-3 shrink-0 select-none z-30"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-cortex-accent/20 border border-cortex-accent/50 flex items-center justify-center text-cortex-accent shadow-[0_0_8px_var(--bodhi-accent)]">
            <Package size={12} />
          </div>
          <span className="text-xs font-bold tracking-wide text-white">
            Bodhi Extensions Manager
          </span>
          <span className="text-[10px] text-cortex-muted bg-cortex-surface px-1.5 py-0.5 rounded font-mono">
            Open VSX
          </span>
        </div>

        {/* Window controls */}
        <div
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center gap-1"
        >
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="w-8 h-8 flex items-center justify-center text-cortex-muted hover:text-white hover:bg-cortex-surface rounded transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleMaximize}
            title="Maximize"
            className="w-8 h-8 flex items-center justify-center text-cortex-muted hover:text-white hover:bg-cortex-surface rounded transition-colors"
          >
            <Square size={12} />
          </button>
          <button
            onClick={handleClose}
            title="Close"
            className="w-8 h-8 flex items-center justify-center text-cortex-muted hover:text-white hover:bg-rose-600 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* 2. Window Toolbar Navigation */}
      <div className="p-4 border-b border-cortex-border/70 bg-cortex-sidebar/40 flex items-center justify-between gap-4 shrink-0 flex-wrap">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-cortex-panel/90 rounded-xl border border-cortex-border/80 text-xs">
          <button
            onClick={() => {
              setActiveTab('marketplace')
              setSelectedExtension(null)
            }}
            className={`py-1.5 px-3.5 rounded-lg font-semibold transition-all ${
              activeTab === 'marketplace' && !selectedExtension
                ? 'bg-cortex-accent text-black shadow'
                : 'text-cortex-muted hover:text-white'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              setActiveTab('installed')
              setSelectedExtension(null)
            }}
            className={`py-1.5 px-3.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'installed' && !selectedExtension
                ? 'bg-cortex-accent text-black shadow'
                : 'text-cortex-muted hover:text-white'
            }`}
          >
            <span>Installed</span>
            {installedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono font-bold">
                {installedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('popular')
              setSelectedExtension(null)
            }}
            className={`py-1.5 px-3.5 rounded-lg font-semibold transition-all ${
              activeTab === 'popular' && !selectedExtension
                ? 'bg-cortex-accent text-black shadow'
                : 'text-cortex-muted hover:text-white'
            }`}
          >
            Popular Snippets
          </button>
          <button
            onClick={() => {
              setActiveTab('tutorial')
              setSelectedExtension(null)
            }}
            className={`py-1.5 px-3.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'tutorial'
                ? 'bg-cortex-accent text-black shadow'
                : 'text-cortex-muted hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Tutorial & Guide</span>
          </button>
        </div>

        {/* Right Search and Actions */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          <div className="relative flex-1 max-w-xs flex items-center">
            <Search
              size={14}
              className="absolute left-3 text-cortex-muted pointer-events-none"
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search Open VSX extensions..."
              className="w-full bg-cortex-panel border border-cortex-border focus:border-cortex-accent rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-cortex-muted outline-none transition-colors"
            />
            {inputVal && (
              <button
                onClick={() => {
                  setInputVal('')
                  setSearchQuery('')
                }}
                className="absolute right-2.5 text-cortex-muted hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={handleInstallVsix}
            className="py-1.5 px-3 rounded-xl bg-cortex-surface hover:bg-cortex-panel border border-cortex-border text-xs text-white font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <FolderDown size={14} className="text-cortex-accent" />
            <span>Install from VSIX...</span>
          </button>

          <button
            onClick={handleRefresh}
            title="Refresh"
            className="p-2 rounded-xl bg-cortex-surface hover:bg-cortex-panel border border-cortex-border text-cortex-muted hover:text-white transition-colors"
          >
            <RefreshCw
              size={14}
              className={isLoadingInstalled || isSearching ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={clearError} className="text-rose-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3. Main View Area */}
      <div className="flex-1 overflow-hidden">
        {/* If an extension is selected, show detail view */}
        {selectedExtension ? (
          <ExtensionDetailView
            extension={selectedExtension}
            isInstalled={installedMap.has(selectedExtension.id)}
            isInstalling={installingIds.includes(selectedExtension.id)}
            isEnabled={installedMap.get(selectedExtension.id)?.enabled ?? true}
            onBack={() => setSelectedExtension(null)}
            onInstall={installFromMarketplace}
            onUninstall={uninstallExtension}
            onToggle={toggleExtension}
          />
        ) : activeTab === 'tutorial' ? (
          /* Tutorial Tab */
          <ExtensionTutorialView onInstallVsix={handleInstallVsix} />
        ) : (
          /* Extension Cards Grid */
          <div className="h-full overflow-y-auto p-6">
            {/* VIEW 1: INSTALLED */}
            {activeTab === 'installed' && (
              <>
                {installedExtensions.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-cortex-panel flex items-center justify-center border border-cortex-border text-cortex-muted">
                      <Package size={28} />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      No Extensions Installed
                    </h3>
                    <p className="text-xs text-cortex-muted max-w-sm">
                      Browse the marketplace to install snippet packs, or import a
                      .vsix package from your computer.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="py-2 px-4 rounded-xl bg-cortex-accent text-black font-bold text-xs hover:brightness-110 shadow"
                      >
                        Explore Marketplace
                      </button>
                      <button
                        onClick={handleInstallVsix}
                        className="py-2 px-4 rounded-xl bg-cortex-surface hover:bg-cortex-panel border border-cortex-border text-xs text-white"
                      >
                        Install .VSIX
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {installedExtensions.map(renderCard)}
                  </div>
                )}
              </>
            )}

            {/* VIEW 2: MARKETPLACE SEARCH / RESULTS */}
            {activeTab === 'marketplace' && (
              <>
                {isSearching ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-cortex-muted text-xs">
                    <RefreshCw size={24} className="animate-spin text-cortex-accent" />
                    <span>Searching Open VSX Registry...</span>
                  </div>
                ) : searchQuery.trim() ? (
                  marketplaceExtensions.length === 0 ? (
                    <div className="py-20 text-center text-xs text-cortex-muted">
                      No extensions found matching "{searchQuery}". Try searching for
                      "React", "Python", "HTML", or "Snippets".
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-cortex-muted mb-4">
                        Found {marketplaceExtensions.length} extensions for "
                        {searchQuery}"
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {marketplaceExtensions.map(renderCard)}
                      </div>
                    </div>
                  )
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Curated Snippet Extensions
                        </h3>
                        <p className="text-xs text-cortex-muted">
                          High-productivity snippet packs verified on Open VSX. Click any
                          card to inspect its README and snippets.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {RECOMMENDED_EXTENSIONS.map(renderCard)}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* VIEW 3: POPULAR SNIPPETS */}
            {activeTab === 'popular' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Popular Ready-to-Use Snippets
                    </h3>
                    <p className="text-xs text-cortex-muted">
                      Essential React, Python, JavaScript, and Frontend snippets.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {RECOMMENDED_EXTENSIONS.map(renderCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



