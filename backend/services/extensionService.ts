import { app, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import AdmZip from 'adm-zip'
import {
  InstalledExtension,
  MarketplaceExtension,
  ExtensionSnippetItem,
  ExtensionThemeItem
} from '../../shared/types'

interface ExtensionManifest {
  name: string
  displayName?: string
  publisher?: string
  version: string
  description?: string
  icon?: string
  contributes?: {
    snippets?: Array<{ language?: string; path: string }>
    themes?: Array<{ label: string; uiTheme: string; path: string }>
  }
}

/**
 * Strips comments and trailing commas so JSON with comments (JSONC)
 * commonly used in VS Code extensions can be parsed safely.
 */
function parseJsonc<T = any>(content: string): T {
  try {
    return JSON.parse(content)
  } catch {
    const stripped = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(stripped)
  }
}

export class ExtensionService {
  private extensionsDir: string
  private dbPath: string
  private installedExtensions: Map<string, InstalledExtension> = new Map()
  private isInitialized = false

  constructor() {
    this.extensionsDir = path.join(app.getPath('userData'), 'extensions')
    this.dbPath = path.join(this.extensionsDir, 'extensions.json')
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return

    try {
      await fs.mkdir(this.extensionsDir, { recursive: true })
      try {
        const raw = await fs.readFile(this.dbPath, 'utf-8')
        const list: InstalledExtension[] = JSON.parse(raw)
        this.installedExtensions.clear()
        for (const ext of list) {
          this.installedExtensions.set(ext.id, ext)
        }
      } catch {
        // No existing db or invalid JSON, initialize empty
        this.installedExtensions.clear()
        await this.saveDb()
      }
    } catch (err) {
      console.error('[ExtensionService] Failed to initialize directory:', err)
    }

    this.isInitialized = true
  }

  private async saveDb(): Promise<void> {
    const list = Array.from(this.installedExtensions.values())
    await fs.writeFile(this.dbPath, JSON.stringify(list, null, 2), 'utf-8')
  }

  /**
   * Returns all currently installed extensions.
   */
  public async getInstalledExtensions(): Promise<InstalledExtension[]> {
    await this.ensureInitialized()
    return Array.from(this.installedExtensions.values())
  }

  /**
   * Search extensions from Open VSX Registry.
   */
  public async searchMarketplace(
    query: string,
    category?: string
  ): Promise<MarketplaceExtension[]> {
    await this.ensureInitialized()

    try {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.append('query', query.trim())
      }
      if (category && category.trim()) {
        params.append('category', category.trim())
      }
      params.append('size', '30')

      const url = `https://open-vsx.org/api/-/search?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'bodhi-editor/1.0.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Open VSX returned HTTP ${response.status}`)
      }

      const data = (await response.json()) as any
      const extensions: any[] = data.extensions || []

      return extensions.map((ext) => {
        const id = `${ext.namespace}.${ext.name}`
        const isInstalled = this.installedExtensions.has(id)

        return {
          id,
          name: ext.name,
          namespace: ext.namespace,
          displayName: ext.displayName || ext.name,
          version: ext.version || '1.0.0',
          description: ext.description || '',
          icon: ext.files?.icon,
          downloadUrl: ext.files?.download || '',
          downloadCount: ext.downloadCount || 0,
          averageRating: ext.averageRating || 0,
          reviewCount: ext.reviewCount || 0,
          timestamp: ext.timestamp,
          isInstalled,
          categories: ext.categories || []
        }
      })
    } catch (err) {
      console.error('[ExtensionService] Search failed:', err)
      return []
    }
  }

  /**
   * Installs an extension downloaded from the Open VSX registry.
   */
  public async installFromMarketplace(
    extension: MarketplaceExtension
  ): Promise<InstalledExtension> {
    await this.ensureInitialized()

    let downloadUrl = extension.downloadUrl
    let response: Response | null = null

    // 1. Try provided downloadUrl if present
    if (downloadUrl) {
      try {
        const res = await fetch(downloadUrl, {
          headers: { 'User-Agent': 'bodhi-editor/1.0.0' },
          redirect: 'follow'
        })
        if (res.ok) {
          response = res
        }
      } catch (err) {
        console.warn(`[ExtensionService] Initial download attempt failed for ${downloadUrl}:`, err)
      }
    }

    // 2. Fallback: Query Open VSX API directly by namespace & name to fetch fresh active download link
    const namespace = extension.namespace || (extension.id.includes('.') ? extension.id.split('.')[0] : '')
    const name = extension.name || (extension.id.includes('.') ? extension.id.split('.')[1] : extension.id)

    if ((!response || !response.ok) && namespace && name) {
      try {
        const metaUrl = `https://open-vsx.org/api/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
        const metaRes = await fetch(metaUrl, {
          headers: { Accept: 'application/json', 'User-Agent': 'bodhi-editor/1.0.0' },
          redirect: 'follow'
        })
        if (metaRes.ok) {
          const metaData = (await metaRes.json()) as any
          if (metaData.files?.download) {
            downloadUrl = metaData.files.download
            const retryRes = await fetch(downloadUrl, {
              headers: { 'User-Agent': 'bodhi-editor/1.0.0' },
              redirect: 'follow'
            })
            if (retryRes.ok) {
              response = retryRes
            }
          }
        }
      } catch (metaErr) {
        console.warn('[ExtensionService] Metadata lookup fallback failed:', metaErr)
      }
    }

    if (!response || !response.ok) {
      const code = response ? response.status : 404
      throw new Error(
        `Failed to download extension "${extension.displayName || extension.name}": HTTP ${code}. Package could not be located on Open VSX.`
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return await this.extractAndRegisterVsix(buffer, extension.id, extension.icon)
  }

  /**
   * Installs an extension from a local .vsix file path or opens file dialog if omitted.
   */
  public async installFromVsix(filePath?: string): Promise<InstalledExtension | null> {
    await this.ensureInitialized()

    let targetPath = filePath
    if (!targetPath) {
      const result = await dialog.showOpenDialog({
        title: 'Select VS Code Extension (.vsix)',
        filters: [{ name: 'VSIX Package', extensions: ['vsix'] }],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }
      targetPath = result.filePaths[0]
    }

    const buffer = await fs.readFile(targetPath)
    return await this.extractAndRegisterVsix(buffer)
  }

  /**
   * Internal helper to extract .vsix (ZIP), parse package.json, count snippets/themes,
   * and persist metadata.
   */
  private async extractAndRegisterVsix(
    buffer: Buffer,
    preferredId?: string,
    marketplaceIcon?: string
  ): Promise<InstalledExtension> {
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()

    // Find extension/package.json
    const pkgEntry = zipEntries.find(
      (e) => e.entryName === 'extension/package.json' || e.entryName === 'package.json'
    )
    if (!pkgEntry) {
      throw new Error('Invalid VSIX: package.json not found in extension package.')
    }

    const pkgJson: ExtensionManifest = parseJsonc(pkgEntry.getData().toString('utf-8'))
    const publisher = pkgJson.publisher || 'local'
    const name = pkgJson.name
    const id = preferredId || `${publisher}.${name}`

    const installPath = path.join(this.extensionsDir, id)

    // Remove existing folder if reinstalling/updating
    try {
      await fs.rm(installPath, { recursive: true, force: true })
    } catch {
      // Ignore if not exists
    }
    await fs.mkdir(installPath, { recursive: true })

    // Extract entries under 'extension/'
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue

      let relativePath = entry.entryName
      if (relativePath.startsWith('extension/')) {
        relativePath = relativePath.substring('extension/'.length)
      }

      const destPath = path.join(installPath, relativePath)
      const destDir = path.dirname(destPath)
      await fs.mkdir(destDir, { recursive: true })
      await fs.writeFile(destPath, entry.getData())
    }

    // Determine icon: local icon in extension or marketplace icon
    let iconUrl = marketplaceIcon
    if (pkgJson.icon) {
      const localIconPath = path.join(installPath, pkgJson.icon)
      try {
        const iconData = await fs.readFile(localIconPath)
        const ext = path.extname(pkgJson.icon).toLowerCase().replace('.', '')
        const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext || 'png'}`
        iconUrl = `data:${mime};base64,${iconData.toString('base64')}`
      } catch {
        // Fall back to marketplaceIcon
      }
    }

    // Count snippets
    let snippetsCount = 0
    const snippetsContrib = pkgJson.contributes?.snippets || []
    for (const s of snippetsContrib) {
      const snippetPath = path.join(installPath, s.path)
      try {
        const content = await fs.readFile(snippetPath, 'utf-8')
        const parsed = parseJsonc(content)
        snippetsCount += Object.keys(parsed).length
      } catch {
        // Count as 1 if file error
        snippetsCount += 1
      }
    }

    // Count themes
    const themesContrib = pkgJson.contributes?.themes || []
    const themesCount = themesContrib.length

    const installed: InstalledExtension = {
      id,
      name: pkgJson.name,
      displayName: pkgJson.displayName || pkgJson.name,
      publisher,
      version: pkgJson.version || '1.0.0',
      description: pkgJson.description || '',
      icon: iconUrl,
      enabled: true,
      installDate: Date.now(),
      snippetsCount,
      themesCount,
      contributes: {
        snippets: pkgJson.contributes?.snippets,
        themes: pkgJson.contributes?.themes
      }
    }

    this.installedExtensions.set(id, installed)
    await this.saveDb()

    return installed
  }

  /**
   * Uninstalls an extension by removing its directory and database record.
   */
  public async uninstallExtension(extensionId: string): Promise<boolean> {
    await this.ensureInitialized()

    const installPath = path.join(this.extensionsDir, extensionId)
    try {
      await fs.rm(installPath, { recursive: true, force: true })
    } catch (err) {
      console.warn(`[ExtensionService] Failed to clean directory ${installPath}:`, err)
    }

    const removed = this.installedExtensions.delete(extensionId)
    if (removed) {
      await this.saveDb()
    }
    return true
  }

  /**
   * Toggles extension enabled / disabled state.
   */
  public async toggleExtension(extensionId: string, enabled: boolean): Promise<boolean> {
    await this.ensureInitialized()

    const ext = this.installedExtensions.get(extensionId)
    if (!ext) return false

    ext.enabled = enabled
    this.installedExtensions.set(extensionId, ext)
    await this.saveDb()
    return true
  }

  /**
   * Aggregates all snippets provided by active/enabled installed extensions.
   */
  public async getExtensionSnippets(): Promise<ExtensionSnippetItem[]> {
    await this.ensureInitialized()

    const allSnippets: ExtensionSnippetItem[] = []

    for (const ext of this.installedExtensions.values()) {
      if (!ext.enabled || !ext.contributes?.snippets) continue

      const installPath = path.join(this.extensionsDir, ext.id)

      for (const snippetDef of ext.contributes.snippets) {
        const fullSnippetPath = path.join(installPath, snippetDef.path)
        try {
          const raw = await fs.readFile(fullSnippetPath, 'utf-8')
          const snippetObj = parseJsonc<Record<string, any>>(raw)

          for (const [name, val] of Object.entries(snippetObj)) {
            if (!val || (!val.prefix && !val.body)) continue

            allSnippets.push({
              name,
              language: snippetDef.language || val.scope || '',
              prefix: val.prefix,
              body: val.body,
              description: val.description,
              scope: val.scope,
              sourceExtensionId: ext.id,
              sourceExtensionName: ext.displayName || ext.name
            })
          }
        } catch (err) {
          console.warn(`[ExtensionService] Failed to read snippets at ${fullSnippetPath}:`, err)
        }
      }
    }

    return allSnippets
  }

  /**
   * Aggregates all themes provided by active/enabled installed extensions.
   */
  public async getExtensionThemes(): Promise<ExtensionThemeItem[]> {
    await this.ensureInitialized()

    const allThemes: ExtensionThemeItem[] = []

    for (const ext of this.installedExtensions.values()) {
      if (!ext.enabled || !ext.contributes?.themes) continue

      const installPath = path.join(this.extensionsDir, ext.id)

      for (const themeDef of ext.contributes.themes) {
        const fullThemePath = path.join(installPath, themeDef.path)
        try {
          const raw = await fs.readFile(fullThemePath, 'utf-8')
          const themeData = parseJsonc(raw)

          allThemes.push({
            id: `${ext.id}.${themeDef.label.toLowerCase().replace(/\s+/g, '-')}`,
            label: themeDef.label,
            uiTheme: (themeDef.uiTheme as any) || 'vs-dark',
            path: fullThemePath,
            sourceExtensionId: ext.id,
            themeData
          })
        } catch (err) {
          console.warn(`[ExtensionService] Failed to read theme at ${fullThemePath}:`, err)
        }
      }
    }

    return allThemes
  }

  /**
   * Shows a dialog to pick a .vsix file.
   */
  public async openVsixDialog(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Select VS Code Extension (.vsix)',
      filters: [{ name: 'VSIX Package', extensions: ['vsix'] }],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  }

  /**
   * Reads README documentation for an extension (either from disk or Open VSX API).
   */
  public async getReadme(
    extensionId: string,
    namespace?: string,
    name?: string
  ): Promise<string> {
    await this.ensureInitialized()

    // 1. Check local installed extension directory first
    const installPath = path.join(this.extensionsDir, extensionId)
    const readmeCandidates = [
      'README.md',
      'readme.md',
      'Readme.md',
      'README.MD',
      'README'
    ]

    for (const file of readmeCandidates) {
      const fullPath = path.join(installPath, file)
      try {
        const text = await fs.readFile(fullPath, 'utf-8')
        if (text && text.trim()) {
          return text
        }
      } catch {
        // try next
      }
    }

    // 2. Query Open VSX API for online README
    const ns = namespace || (extensionId.includes('.') ? extensionId.split('.')[0] : '')
    const nm = name || (extensionId.includes('.') ? extensionId.split('.')[1] : extensionId)

    if (ns && nm) {
      try {
        const url = `https://open-vsx.org/api/${encodeURIComponent(ns)}/${encodeURIComponent(nm)}/latest/file/readme.md`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'bodhi-editor/1.0.0' },
          redirect: 'follow'
        })
        if (res.ok) {
          const text = await res.text()
          if (text && text.trim()) {
            return text
          }
        }
      } catch (err) {
        console.warn(`[ExtensionService] Failed to fetch remote README for ${ns}/${nm}:`, err)
      }
    }

    return `# ${nm || extensionId}\n\n*No README documentation provided for this extension.*`
  }

  /**
   * Returns snippets belonging to a specific installed extension.
   */
  public async getExtensionSnippetsForExt(
    extensionId: string
  ): Promise<ExtensionSnippetItem[]> {
    await this.ensureInitialized()

    const ext = this.installedExtensions.get(extensionId)
    if (!ext || !ext.contributes?.snippets) {
      return []
    }

    const snippets: ExtensionSnippetItem[] = []
    const installPath = path.join(this.extensionsDir, ext.id)

    for (const snippetDef of ext.contributes.snippets) {
      const fullSnippetPath = path.join(installPath, snippetDef.path)
      try {
        const raw = await fs.readFile(fullSnippetPath, 'utf-8')
        const snippetObj = parseJsonc<Record<string, any>>(raw)

        for (const [sName, val] of Object.entries(snippetObj)) {
          if (!val || (!val.prefix && !val.body)) continue

          snippets.push({
            name: sName,
            language: snippetDef.language || val.scope || '',
            prefix: val.prefix,
            body: val.body,
            description: val.description,
            scope: val.scope,
            sourceExtensionId: ext.id,
            sourceExtensionName: ext.displayName || ext.name
          })
        }
      } catch (err) {
        console.warn(`[ExtensionService] Failed to read snippets at ${fullSnippetPath}:`, err)
      }
    }

    return snippets
  }
}

export const extensionService = new ExtensionService()
