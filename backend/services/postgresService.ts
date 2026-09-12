import { app, safeStorage, BrowserWindow } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import { Pool, PoolConfig } from 'pg'
import {
  DbConnectionStatus,
  DbTestResult,
  CloudSnippet,
  CloudAIChat,
  EditorSettings
} from '../../shared/types'
import { IPC_CHANNELS } from '../../shared/constants'

export class PostgresService {
  private pool: Pool | null = null
  private configPath: string
  private status: DbConnectionStatus = {
    connected: false
  }

  constructor() {
    try {
      this.configPath = path.join(app.getPath('userData'), 'postgres_config.enc')
    } catch {
      this.configPath = path.join(process.cwd(), '.postgres_config.enc')
    }
  }

  public async init(): Promise<void> {
    const savedUrl = await this.getStoredConnectionString()
    if (savedUrl) {
      this.connect(savedUrl).catch((err) => {
        console.warn('[PostgresService] Background auto-connect error:', err.message)
      })
    }
  }

  private async getStoredConnectionString(): Promise<string | null> {
    try {
      const buffer = await fs.readFile(this.configPath)
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(buffer)
      } else {
        return buffer.toString('utf8')
      }
    } catch {
      return null
    }
  }

  private async saveConnectionString(url: string): Promise<void> {
    try {
      let data: Buffer
      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        data = safeStorage.encryptString(url.trim())
      } else {
        data = Buffer.from(url.trim(), 'utf8')
      }
      await fs.writeFile(this.configPath, data)
    } catch (err) {
      console.error('Failed to store postgres connection string:', err)
    }
  }

  private async clearStoredConnectionString(): Promise<void> {
    try {
      await fs.unlink(this.configPath)
    } catch {
      // ignore
    }
  }

  private buildPoolConfig(connectionString: string): PoolConfig {
    const isRemote =
      !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
    return {
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
    }
  }

  public async testConnection(connectionString: string): Promise<DbTestResult> {
    if (!connectionString || !connectionString.trim()) {
      return { success: false, message: 'Connection string cannot be empty.' }
    }

    const start = Date.now()
    const testPool = new Pool(this.buildPoolConfig(connectionString.trim()))

    try {
      const client = await testPool.connect()
      try {
        const res = await client.query('SELECT version()')
        const latencyMs = Date.now() - start
        const serverVersion = res.rows[0]?.version || 'PostgreSQL'
        return {
          success: true,
          message: 'Connection successful!',
          latencyMs,
          serverVersion
        }
      } finally {
        client.release()
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to PostgreSQL server.'
      }
    } finally {
      testPool.end().catch(() => {})
    }
  }

  public async connect(connectionString: string): Promise<DbConnectionStatus> {
    if (!connectionString || !connectionString.trim()) {
      this.status = { connected: false, error: 'Empty connection string' }
      this.notifyWindows()
      return this.status
    }

    // Close existing pool
    if (this.pool) {
      try {
        await this.pool.end()
      } catch {
        // ignore
      }
      this.pool = null
    }

    const start = Date.now()
    const pool = new Pool(this.buildPoolConfig(connectionString.trim()))

    try {
      const client = await pool.connect()
      let serverVersion = ''
      try {
        const res = await client.query('SELECT version()')
        serverVersion = res.rows[0]?.version || 'PostgreSQL'
        // Auto-provision schema
        await this.runMigrations(client)
      } finally {
        client.release()
      }

      this.pool = pool
      const latencyMs = Date.now() - start

      // Parse host and database from URL
      let host = 'PostgreSQL'
      let database = 'postgres'
      try {
        const parsed = new URL(connectionString.trim())
        host = parsed.hostname || 'PostgreSQL'
        database = parsed.pathname.replace(/^\//, '') || 'postgres'
      } catch {
        // ignore url parse error
      }

      this.status = {
        connected: true,
        host,
        database,
        serverVersion,
        latencyMs,
        lastSyncTime: Date.now()
      }

      await this.saveConnectionString(connectionString.trim())
      this.notifyWindows()
      return this.status
    } catch (err: any) {
      console.error('PostgreSQL connection error:', err)
      this.status = {
        connected: false,
        error: err.message || 'Failed to connect to PostgreSQL database'
      }
      this.notifyWindows()
      return this.status
    }
  }

  private async runMigrations(client: any): Promise<void> {
    const ddl = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id VARCHAR(255) PRIMARY KEY,
        settings_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_snippets (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        prefix VARCHAR(100),
        language VARCHAR(100),
        code TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        messages JSONB NOT NULL,
        model VARCHAR(100),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS published_repositories (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        repo_url TEXT NOT NULL,
        is_private BOOLEAN DEFAULT TRUE,
        published_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    await client.query(ddl)
  }

  public async disconnect(): Promise<boolean> {
    if (this.pool) {
      try {
        await this.pool.end()
      } catch {
        // ignore
      }
      this.pool = null
    }
    await this.clearStoredConnectionString()
    this.status = { connected: false }
    this.notifyWindows()
    return true
  }

  public getStatus(): DbConnectionStatus {
    return this.status
  }

  public async syncSettings(userId: string, settings: Partial<EditorSettings>): Promise<boolean> {
    if (!this.pool || !this.status.connected || !userId) return false
    try {
      const query = `
        INSERT INTO user_settings (user_id, settings_json, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET settings_json = $2, updated_at = NOW();
      `
      await this.pool.query(query, [userId, JSON.stringify(settings)])
      this.status.lastSyncTime = Date.now()
      this.notifyWindows()
      return true
    } catch (err) {
      console.error('Failed to sync settings to PostgreSQL:', err)
      return false
    }
  }

  public async getSettings(userId: string): Promise<Partial<EditorSettings> | null> {
    if (!this.pool || !this.status.connected || !userId) return null
    try {
      const res = await this.pool.query(
        'SELECT settings_json FROM user_settings WHERE user_id = $1',
        [userId]
      )
      if (res.rows.length > 0) {
        return res.rows[0].settings_json as Partial<EditorSettings>
      }
      return null
    } catch (err) {
      console.error('Failed to get settings from PostgreSQL:', err)
      return null
    }
  }

  public async saveSnippet(userId: string, snippet: CloudSnippet): Promise<boolean> {
    if (!this.pool || !this.status.connected || !userId) return false
    try {
      const id = snippet.id || `snippet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const query = `
        INSERT INTO user_snippets (id, user_id, title, prefix, language, code, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id)
        DO UPDATE SET title = $3, prefix = $4, language = $5, code = $6;
      `
      await this.pool.query(query, [
        id,
        userId,
        snippet.title,
        snippet.prefix,
        snippet.language,
        snippet.code
      ])
      return true
    } catch (err) {
      console.error('Failed to save snippet to PostgreSQL:', err)
      return false
    }
  }

  public async getSnippets(userId: string): Promise<CloudSnippet[]> {
    if (!this.pool || !this.status.connected || !userId) return []
    try {
      const res = await this.pool.query(
        'SELECT id, title, prefix, language, code, created_at FROM user_snippets WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      )
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        prefix: r.prefix,
        language: r.language,
        code: r.code,
        createdAt: new Date(r.created_at).getTime()
      }))
    } catch (err) {
      console.error('Failed to get snippets from PostgreSQL:', err)
      return []
    }
  }

  public async saveAIChat(userId: string, chat: CloudAIChat): Promise<boolean> {
    if (!this.pool || !this.status.connected || !userId) return false
    try {
      const id = chat.id || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const query = `
        INSERT INTO ai_conversations (id, user_id, title, messages, model, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id)
        DO UPDATE SET title = $3, messages = $4, model = $5, updated_at = NOW();
      `
      await this.pool.query(query, [
        id,
        userId,
        chat.title,
        JSON.stringify(chat.messages),
        chat.model || 'default'
      ])
      return true
    } catch (err) {
      console.error('Failed to save AI chat to PostgreSQL:', err)
      return false
    }
  }

  public async getAIChats(userId: string): Promise<CloudAIChat[]> {
    if (!this.pool || !this.status.connected || !userId) return []
    try {
      const res = await this.pool.query(
        'SELECT id, title, messages, model, updated_at FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      )
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        messages: r.messages,
        model: r.model,
        updatedAt: new Date(r.updated_at).getTime()
      }))
    } catch (err) {
      console.error('Failed to get AI chats from PostgreSQL:', err)
      return []
    }
  }

  private notifyWindows(): void {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.DB_STATUS_CHANGED, this.status)
      }
    }
  }
}

export const postgresService = new PostgresService()
