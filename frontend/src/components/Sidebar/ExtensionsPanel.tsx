import React, { useEffect, useState, useRef } from 'react'
import {
  Search,
  RefreshCw,
  Package,
  Check,
  Download,
  Trash2,
  AlertCircle,
  X,
  FileCode2,
  Palette,
  FolderDown,
  Power,
  ExternalLink
} from 'lucide-react'
import {
  useExtensionStore,
  RECOMMENDED_EXTENSIONS
} from '../../store/useExtensionStore'
import { extensionLoaderService } from '../../services/extensionLoaderService'
import { InstalledExtension, MarketplaceExtension } from '@shared/types'

export const ExtensionsPanel: React.FC = () => {
  const {
    installedExtensions,
    marketplaceExtensions,
    isLoadingInstalled,
    isSearching,
    installingIds,
    searchQuery,
    filterTab,
    errorMessage,
    loadInstalled,
    searchMarketplace,
    installFromMarketplace,
    installFromVsix,
    uninstallExtension,
    toggleExtension,
    setSearchQuery,
    setFilterTab,
    clearError
  } = useExtensionStore()

  const [inputVal, setInputVal] = useState(searchQuery)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load installed extensions on mount
  useEffect(() => {
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
    }, 450)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputVal, setSearchQuery, searchMarketplace])

  const [isHotReloading, setIsHotReloading] = useState(false)
  const [reloadNotice, setReloadNotice] = useState<string | null>(null)

  const handleRefresh = async (): Promise<void> => {
    setIsHotReloading(true)
    setReloadNotice(null)
    try {
      await loadInstalled()
      const { snippetCount, themeCount } = await extensionLoaderService.hotReload()
      if (inputVal.trim()) {
        await searchMarketplace(inputVal)
      }
      setReloadNotice(`Reloaded: ${snippetCount} snippets, ${themeCount} themes`)
      setTimeout(() => setReloadNotice(null), 3000)
    } finally {
      setIsHotReloading(false)
    }
  }

  const handleInstallVsix = async (): Promise<void> => {
    await installFromVsix()
  }

  const installedCount = installedExtensions.length
  const installedIds = new Set(installedExtensions.map((e) => e.id))

  // Render marketplace or recommended item card
  const renderMarketplaceCard = (ext: MarketplaceExtension): React.JSX.Element => {
    const isInstalled = installedIds.has(ext.id) || ext.isInstalled
    const isInstalling = installingIds.includes(ext.id)

    return (
      <div
        key={ext.id}
        className="p-3 bg-bodhi-surface/40 hover:bg-bodhi-surface/80 border border-BODHI-border/70 rounded-xl transition-all flex flex-col gap-2 group"
      >
        <div className="flex items-start justify-between gap-2.5">
          {/* Extension Icon */}
          <div className="w-9 h-9 rounded-lg bg-bodhi-panel flex items-center justify-center shrink-0 border border-BODHI-border/60 overflow-hidden shadow-sm">
            {ext.icon ? (
              <img
                src={ext.icon}
                alt={ext.displayName}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <Package size={18} className="text-bodhi-accent" />
            )}
          </div>

          {/* Extension Title & Publisher */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4
                className="text-xs font-semibold text-white truncate group-hover:text-bodhi-accent transition-colors"
                title={ext.displayName}
              >
                {ext.displayName}
              </h4>
            </div>
            <p className="text-[11px] text-bodhi-muted truncate">
              {ext.namespace} • v{ext.version}
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isInstalled ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                <Check size={12} />
                Installed
              </span>
            ) : (
              <button
                onClick={() => installFromMarketplace(ext)}
                disabled={isInstalling}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all shadow-sm ${
                  isInstalling
                    ? 'bg-bodhi-surface text-bodhi-muted cursor-wait border border-BODHI-border'
                    : 'bg-bodhi-accent text-black hover:brightness-110 active:scale-95 font-semibold'
                }`}
              >
                {isInstalling ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    Installing
                  </>
                ) : (
                  <>
                    <Download size={11} />
                    Install
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {ext.description && (
          <p
            className="text-[11px] text-bodhi-muted/90 line-clamp-2 leading-relaxed"
            title={ext.description}
          >
            {ext.description}
          </p>
        )}

        {/* Tags / Stats */}
        <div className="flex items-center gap-2 pt-1 border-t border-BODHI-border/40 text-[10px] text-bodhi-muted">
          {ext.categories?.includes('Snippets') || ext.name.includes('snippet') ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              <FileCode2 size={10} />
              Snippets
            </span>
          ) : null}
          {ext.categories?.includes('Themes') || ext.name.includes('theme') ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
              <Palette size={10} />
              Theme
            </span>
          ) : null}
          {ext.downloadCount ? (
            <span>
              {ext.downloadCount > 1000
                ? `${(ext.downloadCount / 1000).toFixed(1)}k installs`
                : `${ext.downloadCount} installs`}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  // Render installed item card
  const renderInstalledCard = (ext: InstalledExtension): React.JSX.Element => {
    return (
      <div
        key={ext.id}
        className={`p-3 bg-bodhi-surface/40 hover:bg-bodhi-surface/70 border rounded-xl transition-all flex flex-col gap-2 ${
          ext.enabled ? 'border-BODHI-border/70' : 'border-BODHI-border/40 opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-2.5">
          {/* Extension Icon */}
          <div className="w-9 h-9 rounded-lg bg-bodhi-panel flex items-center justify-center shrink-0 border border-BODHI-border/60 overflow-hidden shadow-sm">
            {ext.icon ? (
              <img
                src={ext.icon}
                alt={ext.displayName}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <Package size={18} className="text-bodhi-accent" />
            )}
          </div>

          {/* Extension Title & Publisher */}
          <div className="flex-1 min-w-0">
            <h4
              className="text-xs font-semibold text-white truncate"
              title={ext.displayName}
            >
              {ext.displayName}
            </h4>
            <p className="text-[11px] text-bodhi-muted truncate">
              {ext.publisher} • v{ext.version}
            </p>
          </div>

          {/* Actions: Enable Toggle & Uninstall */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleExtension(ext.id, !ext.enabled)}
              title={ext.enabled ? 'Disable Extension' : 'Enable Extension'}
              className={`p-1.5 rounded-lg border transition-colors ${
                ext.enabled
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'text-bodhi-muted border-BODHI-border bg-bodhi-panel hover:text-white'
              }`}
            >
              <Power size={13} />
            </button>

            <button
              onClick={() => uninstallExtension(ext.id)}
              title="Uninstall Extension"
              className="p-1.5 rounded-lg text-bodhi-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {ext.description && (
          <p className="text-[11px] text-bodhi-muted line-clamp-2 leading-relaxed">
            {ext.description}
          </p>
        )}

        {/* Contribution Badges */}
        <div className="flex items-center gap-2 pt-1 border-t border-BODHI-border/40 text-[10px] text-bodhi-muted">
          {ext.snippetsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              <FileCode2 size={10} />
              {ext.snippetsCount} snippets
            </span>
          )}
          {ext.themesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
              <Palette size={10} />
              {ext.themesCount} theme{ext.themesCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="ml-auto text-[10px]">
            {ext.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-BODHI-sidebar text-white select-none overflow-hidden">
      {/* Panel Top Header */}
      <div className="h-10 px-3.5 flex items-center justify-between border-b border-BODHI-border/60 bg-bodhi-panel/50 shrink-0">
        <span className="text-[11px] font-bold text-bodhi-muted tracking-wider uppercase flex items-center gap-1.5">
          <Package size={14} className="text-bodhi-accent" />
          Extensions
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => window.bodhiAPI?.openExtensionsWindow?.()}
            title="Open Dedicated Extensions Window"
            className="p-1.5 rounded-lg text-bodhi-muted hover:text-white hover:bg-bodhi-surface active:text-bodhi-accent transition-colors"
          >
            <ExternalLink size={13} />
          </button>
          <button
            onClick={handleInstallVsix}
            title="Install from VSIX Package..."
            className="p-1.5 rounded-lg text-bodhi-muted hover:text-white hover:bg-bodhi-surface active:text-bodhi-accent transition-colors flex items-center gap-1 text-[11px]"
          >
            <FolderDown size={14} />
          </button>
          <button
            onClick={handleRefresh}
            title="Refresh installed extensions and reload snippets/themes into editor"
            className="px-2 py-1 rounded-lg text-bodhi-muted hover:text-white hover:bg-bodhi-surface active:text-bodhi-accent transition-colors flex items-center gap-1.5"
          >
            <RefreshCw
              size={13}
              className={isLoadingInstalled || isSearching || isHotReloading ? 'animate-spin text-bodhi-accent' : ''}
            />
            <span className="text-[10px] font-medium hidden sm:inline">
              {isHotReloading ? 'Reloading...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* Instant Hot-Reload Notice Banner */}
      {reloadNotice && (
        <div className="px-3 py-1 bg-bodhi-accent/15 border-b border-bodhi-accent/30 text-bodhi-accent text-[10px] font-medium flex items-center justify-between animate-fade-in">
          <span>✓ {reloadNotice}</span>
          <button onClick={() => setReloadNotice(null)} className="text-bodhi-muted hover:text-white">
            <X size={10} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-3 border-b border-BODHI-border/50 shrink-0 flex flex-col gap-2.5">
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-2.5 text-bodhi-muted pointer-events-none"
          />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search Open VSX (e.g. React, Python)..."
            className="w-full bg-bodhi-panel border border-BODHI-border/80 focus:border-bodhi-accent rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-bodhi-muted outline-none transition-colors"
          />
          {inputVal && (
            <button
              onClick={() => {
                setInputVal('')
                setSearchQuery('')
              }}
              className="absolute right-2 text-bodhi-muted hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center p-0.5 bg-bodhi-panel/80 rounded-lg border border-BODHI-border/60 text-[11px]">
          <button
            onClick={() => setFilterTab('marketplace')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              filterTab === 'marketplace'
                ? 'bg-bodhi-accent/15 text-bodhi-accent font-semibold shadow-sm border border-bodhi-accent/30'
                : 'text-bodhi-muted hover:text-white'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setFilterTab('installed')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
              filterTab === 'installed'
                ? 'bg-bodhi-accent/15 text-bodhi-accent font-semibold shadow-sm border border-bodhi-accent/30'
                : 'text-bodhi-muted hover:text-white'
            }`}
          >
            <span>Installed</span>
            {installedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-bodhi-surface text-[10px] font-mono border border-BODHI-border text-white">
                {installedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('recommended')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              filterTab === 'recommended'
                ? 'bg-bodhi-accent/15 text-bodhi-accent font-semibold shadow-sm border border-bodhi-accent/30'
                : 'text-bodhi-muted hover:text-white'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start justify-between gap-2 shrink-0">
          <div className="flex items-start gap-1.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-200">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {/* VIEW 1: INSTALLED EXTENSIONS */}
        {filterTab === 'installed' && (
          <>
            {installedExtensions.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-bodhi-panel flex items-center justify-center border border-BODHI-border text-bodhi-muted">
                  <Package size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    No Extensions Installed
                  </h4>
                  <p className="text-[11px] text-bodhi-muted mt-1 max-w-[200px]">
                    Install snippet or theme packs from the marketplace, or drop in a
                    .vsix file.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[180px] mt-2">
                  <button
                    onClick={() => setFilterTab('recommended')}
                    className="w-full py-1.5 px-3 rounded-lg bg-bodhi-accent text-black font-semibold text-xs hover:brightness-110 shadow-sm"
                  >
                    Browse Popular
                  </button>
                  <button
                    onClick={handleInstallVsix}
                    className="w-full py-1.5 px-3 rounded-lg bg-bodhi-surface hover:bg-bodhi-panel border border-BODHI-border text-xs text-white"
                  >
                    Install from VSIX...
                  </button>
                </div>
              </div>
            ) : (
              installedExtensions.map(renderInstalledCard)
            )}
          </>
        )}

        {/* VIEW 2: MARKETPLACE SEARCH */}
        {filterTab === 'marketplace' && (
          <>
            {isSearching ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-bodhi-muted text-xs">
                <RefreshCw size={18} className="animate-spin text-bodhi-accent" />
                <span>Searching Open VSX Registry...</span>
              </div>
            ) : searchQuery.trim() ? (
              marketplaceExtensions.length === 0 ? (
                <div className="py-10 text-center text-xs text-bodhi-muted">
                  No extensions found for "{searchQuery}".
                </div>
              ) : (
                marketplaceExtensions.map(renderMarketplaceCard)
              )
            ) : (
              // When user hasn't typed a query yet in marketplace tab, show top recommendations
              <div className="flex flex-col gap-2.5">
                <div className="text-[11px] font-semibold text-bodhi-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Curated Snippet Packs</span>
                </div>
                {RECOMMENDED_EXTENSIONS.map(renderMarketplaceCard)}
              </div>
            )}
          </>
        )}

        {/* VIEW 3: POPULAR CURATED PACKS */}
        {filterTab === 'recommended' && (
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] font-semibold text-bodhi-muted uppercase tracking-wider">
              <span>Ready-to-Use Snippets</span>
            </div>
            {RECOMMENDED_EXTENSIONS.map(renderMarketplaceCard)}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-BODHI-border/50 bg-bodhi-panel/30 text-[10px] text-bodhi-muted text-center shrink-0">
        Powered by{' '}
        <a
          href="https://open-vsx.org"
          target="_blank"
          rel="noreferrer"
          className="text-bodhi-accent hover:underline"
        >
          Open VSX Registry
        </a>{' '}
        & Monaco Snippets
      </div>
    </div>
  )
}

