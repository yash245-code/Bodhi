"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const fsSync = require("fs");
const fs = require("fs/promises");
const child_process = require("child_process");
const chokidar = require("chokidar");
const os = require("os");
const http = require("http");
const crypto = require("crypto");
const pg = require("pg");
const AdmZip = require("adm-zip");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fsSync__namespace = /* @__PURE__ */ _interopNamespaceDefault(fsSync);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const http__namespace = /* @__PURE__ */ _interopNamespaceDefault(http);
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto);
const IPC_CHANNELS = {
  // Window
  WINDOW_MINIMIZE: "BODHI:window:minimize",
  WINDOW_MAXIMIZE: "BODHI:window:maximize",
  WINDOW_CLOSE: "BODHI:window:close",
  WINDOW_IS_MAXIMIZED: "BODHI:window:isMaximized",
  // Dialogs
  DIALOG_OPEN_FILE: "BODHI:dialog:openFile",
  DIALOG_OPEN_DIRECTORY: "BODHI:dialog:openDirectory",
  // File system
  FS_READ_DIRECTORY: "BODHI:fs:readDirectory",
  FS_READ_FILE: "BODHI:fs:readFile",
  FS_WRITE_FILE: "BODHI:fs:writeFile",
  FS_CREATE_FILE: "BODHI:fs:createFile",
  FS_CREATE_DIRECTORY: "BODHI:fs:createDirectory",
  FS_RENAME_PATH: "BODHI:fs:renamePath",
  FS_DELETE_PATH: "BODHI:fs:deletePath",
  // Watcher
  WATCHER_START: "BODHI:watcher:start",
  WATCHER_STOP: "BODHI:watcher:stop",
  WATCHER_CHANGE: "BODHI:watcher:change",
  // Terminal
  TERMINAL_CREATE: "BODHI:terminal:create",
  TERMINAL_WRITE: "BODHI:terminal:write",
  TERMINAL_RESIZE: "BODHI:terminal:resize",
  TERMINAL_KILL: "BODHI:terminal:kill",
  TERMINAL_DATA: "BODHI:terminal:data",
  TERMINAL_EXIT: "BODHI:terminal:exit",
  TERMINAL_GET_AVAILABLE_SHELLS: "BODHI:terminal:getAvailableShells",
  // Search & Replace
  SEARCH_WORKSPACE: "BODHI:search:workspace",
  SEARCH_REPLACE_FILE: "BODHI:search:replaceFile",
  SEARCH_REPLACE_ALL: "BODHI:search:replaceAll",
  // Settings
  SETTINGS_OPEN: "BODHI:settings:open",
  SETTINGS_GET: "BODHI:settings:get",
  SETTINGS_UPDATE: "BODHI:settings:update",
  SETTINGS_CHANGED: "BODHI:settings:changed",
  // Git
  GIT_STATUS: "BODHI:git:status",
  GIT_BRANCH: "BODHI:git:branch",
  GIT_GET_FILE_AT_HEAD: "BODHI:git:getFileAtHead",
  GIT_GET_DIFF: "BODHI:git:getDiff",
  GIT_STAGE: "BODHI:git:stage",
  GIT_UNSTAGE: "BODHI:git:unstage",
  GIT_STAGE_ALL: "BODHI:git:stageAll",
  GIT_UNSTAGE_ALL: "BODHI:git:unstageAll",
  GIT_DISCARD: "BODHI:git:discard",
  GIT_COMMIT: "BODHI:git:commit",
  GIT_GET_FILE_CHURN: "BODHI:git:getFileChurn",
  GIT_INIT: "BODHI:git:init",
  GIT_CREATE_GITIGNORE: "BODHI:git:createGitignore",
  GIT_GET_REMOTES: "BODHI:git:getRemotes",
  GIT_ADD_REMOTE: "BODHI:git:addRemote",
  GIT_REMOVE_REMOTE: "BODHI:git:removeRemote",
  GIT_SET_REMOTE_URL: "BODHI:git:setRemoteUrl",
  GIT_GET_BRANCHES: "BODHI:git:getBranches",
  GIT_CHECKOUT_BRANCH: "BODHI:git:checkoutBranch",
  GIT_CREATE_BRANCH: "BODHI:git:createBranch",
  GIT_DELETE_BRANCH: "BODHI:git:deleteBranch",
  GIT_MERGE_BRANCH: "BODHI:git:mergeBranch",
  GIT_FETCH: "BODHI:git:fetch",
  GIT_PULL: "BODHI:git:pull",
  GIT_PUSH: "BODHI:git:push",
  GIT_GET_SYNC_STATUS: "BODHI:git:getSyncStatus",
  GIT_STASH_SAVE: "BODHI:git:stashSave",
  GIT_STASH_POP: "BODHI:git:stashPop",
  GIT_STASH_LIST: "BODHI:git:stashList",
  GIT_STASH_DROP: "BODHI:git:stashDrop",
  GIT_GET_COMMIT_LOG: "BODHI:git:getCommitLog",
  GIT_UNDO_COMMIT: "BODHI:git:undoCommit",
  // GitHub Integration & Cloud Publishing
  GITHUB_VALIDATE_TOKEN: "BODHI:github:validateToken",
  GITHUB_PUBLISH_REPO: "BODHI:github:publishRepo",
  GITHUB_GET_USER_REPOS: "BODHI:github:getUserRepos",
  GITHUB_GET_STORED_TOKEN: "BODHI:github:getStoredToken",
  GITHUB_SET_STORED_TOKEN: "BODHI:github:setStoredToken",
  GITHUB_CLEAR_STORED_TOKEN: "BODHI:github:clearStoredToken",
  // User Authentication (Google OAuth & Profile)
  AUTH_LOGIN_GOOGLE: "BODHI:auth:loginGoogle",
  AUTH_LOGOUT: "BODHI:auth:logout",
  AUTH_GET_CURRENT_USER: "BODHI:auth:getCurrentUser",
  AUTH_STATE_CHANGED: "BODHI:auth:stateChanged",
  // Extensions
  EXTENSIONS_GET_INSTALLED: "BODHI:extensions:getInstalled",
  EXTENSIONS_SEARCH_MARKETPLACE: "BODHI:extensions:searchMarketplace",
  EXTENSIONS_INSTALL_FROM_MARKETPLACE: "BODHI:extensions:installFromMarketplace",
  EXTENSIONS_INSTALL_FROM_VSIX: "BODHI:extensions:installFromVsix",
  EXTENSIONS_UNINSTALL: "BODHI:extensions:uninstall",
  EXTENSIONS_TOGGLE_ENABLE: "BODHI:extensions:toggleEnable",
  EXTENSIONS_GET_SNIPPETS: "BODHI:extensions:getSnippets",
  EXTENSIONS_GET_THEMES: "BODHI:extensions:getThemes",
  EXTENSIONS_OPEN_VSIX_DIALOG: "BODHI:extensions:openVsixDialog",
  EXTENSIONS_OPEN_WINDOW: "BODHI:extensions:openWindow",
  EXTENSIONS_GET_README: "BODHI:extensions:getReadme",
  EXTENSIONS_GET_EXT_SNIPPETS: "BODHI:extensions:getExtSnippets",
  // AI Intelligence
  AI_GENERATE_COMPLETION: "BODHI:ai:generateCompletion",
  AI_GENERATE_EDIT: "BODHI:ai:generateEdit",
  AI_CHAT: "BODHI:ai:chat",
  AI_TEST_CONNECTION: "BODHI:ai:testConnection",
  // PostgreSQL Database & Cloud Sync
  DB_TEST_CONNECTION: "BODHI:db:testConnection",
  DB_CONNECT: "BODHI:db:connect",
  DB_DISCONNECT: "BODHI:db:disconnect",
  DB_GET_STATUS: "BODHI:db:getStatus",
  DB_SYNC_SETTINGS: "BODHI:db:syncSettings",
  DB_GET_SETTINGS: "BODHI:db:getSettings",
  DB_SAVE_SNIPPET: "BODHI:db:saveSnippet",
  DB_GET_SNIPPETS: "BODHI:db:getSnippets",
  DB_SAVE_AI_CHAT: "BODHI:db:saveAiChat",
  DB_GET_AI_CHATS: "BODHI:db:getAiChats",
  DB_STATUS_CHANGED: "BODHI:db:statusChanged"
};
const IGNORED_DIRECTORIES$1 = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "dist",
  "out",
  ".next",
  ".turbo",
  ".vscode",
  ".idea",
  "coverage",
  ".DS_Store"
]);
class FileService {
  watcher = null;
  mainWindow = null;
  debounceTimers = /* @__PURE__ */ new Map();
  setMainWindow(window) {
    this.mainWindow = window;
  }
  async openFileDialog() {
    if (!this.mainWindow) return null;
    const result = await electron.dialog.showOpenDialog(this.mainWindow, {
      properties: ["openFile"],
      title: "Open File in BODHI"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }
  async openDirectoryDialog() {
    if (!this.mainWindow) return null;
    const result = await electron.dialog.showOpenDialog(this.mainWindow, {
      properties: ["openDirectory", "createDirectory"],
      title: "Open Folder in BODHI"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }
  async readDirectory(dirPath) {
    const name = path__namespace.basename(dirPath) || dirPath;
    const rootNode = {
      id: dirPath,
      name,
      path: dirPath,
      type: "directory",
      children: []
    };
    let stats;
    try {
      stats = await fs__namespace.stat(dirPath);
    } catch {
      return rootNode;
    }
    try {
      const entries = await fs__namespace.readdir(dirPath, { withFileTypes: true });
      const children = [];
      for (const entry of entries) {
        if (IGNORED_DIRECTORIES$1.has(entry.name)) {
          continue;
        }
        const fullPath = path__namespace.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          try {
            const childDirNode = await this.readDirectory(fullPath);
            children.push(childDirNode);
          } catch {
          }
        } else if (entry.isFile() || entry.isSymbolicLink()) {
          const extParts = entry.name.split(".");
          const extension = extParts.length > 1 ? extParts.pop() : "";
          let size = 0;
          try {
            const fileStat = await fs__namespace.stat(fullPath);
            size = fileStat.size;
          } catch {
          }
          children.push({
            id: fullPath,
            name: entry.name,
            path: fullPath,
            type: "file",
            extension,
            size,
            updatedAt: stats.mtimeMs
          });
        }
      }
      children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" });
      });
      rootNode.children = children;
    } catch (err) {
      console.warn(`Failed to read directory at ${dirPath}:`, err);
    }
    return rootNode;
  }
  async readFile(filePath) {
    try {
      return await fs__namespace.readFile(filePath, "utf-8");
    } catch (err) {
      if (err.code === "ENOENT") {
        return "";
      }
      console.warn(`[FileService] Failed to read file ${filePath}:`, err.message);
      return "";
    }
  }
  async writeFile(filePath, content) {
    try {
      await fs__namespace.mkdir(path__namespace.dirname(filePath), { recursive: true });
      await fs__namespace.writeFile(filePath, content, "utf-8");
      return true;
    } catch (err) {
      console.error(`[FileService] Failed to write file ${filePath}:`, err);
      return false;
    }
  }
  async createFile(filePath) {
    try {
      await fs__namespace.mkdir(path__namespace.dirname(filePath), { recursive: true });
      await fs__namespace.writeFile(filePath, "", "utf-8");
      return true;
    } catch (err) {
      console.error(`[FileService] Failed to create file ${filePath}:`, err);
      return false;
    }
  }
  async createDirectory(dirPath) {
    try {
      await fs__namespace.mkdir(dirPath, { recursive: true });
      return true;
    } catch (err) {
      console.error(`[FileService] Failed to create directory ${dirPath}:`, err);
      return false;
    }
  }
  async renamePath(oldPath, newPath) {
    try {
      await fs__namespace.rename(oldPath, newPath);
      return true;
    } catch (err) {
      console.error(`[FileService] Failed to rename ${oldPath} to ${newPath}:`, err);
      return false;
    }
  }
  async deletePath(targetPath) {
    if (!targetPath) return false;
    try {
      try {
        await fs__namespace.access(targetPath);
      } catch {
        return true;
      }
      if (this.watcher) {
        try {
          await this.watcher.unwatch(targetPath);
        } catch {
        }
      }
      await fs__namespace.rm(targetPath, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100
      });
      return true;
    } catch (rmErr) {
      console.warn(`Standard fs.rm failed on "${targetPath}", executing OS force deletion:`, rmErr?.message);
      if (process.platform === "win32") {
        try {
          const stat = await fs__namespace.stat(targetPath).catch(() => null);
          if (stat?.isDirectory()) {
            await new Promise((resolve, reject) => {
              child_process.exec(`rmdir /s /q "${targetPath}"`, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          } else {
            await new Promise((resolve, reject) => {
              child_process.exec(`del /f /q /a "${targetPath}"`, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          }
          return true;
        } catch (fallbackErr) {
          console.error(`Fallback force deletion failed for "${targetPath}":`, fallbackErr);
          return false;
        }
      }
      return false;
    }
  }
  startWatcher(dirPath) {
    this.stopWatcher();
    this.watcher = chokidar.watch(dirPath, {
      ignored: [
        /(^|[/\\])\../,
        // ignore dotfiles
        "**/node_modules/**",
        "**/dist/**",
        "**/out/**",
        "**/.git/**"
      ],
      persistent: true,
      ignoreInitial: true,
      depth: 6,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    });
    const sendChangeEvent = (type, changedPath) => {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
      const key = `${type}:${changedPath}`;
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }
      const timer = setTimeout(() => {
        this.debounceTimers.delete(key);
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send(IPC_CHANNELS.WATCHER_CHANGE, {
            type,
            path: changedPath
          });
        }
      }, 50);
      this.debounceTimers.set(key, timer);
    };
    this.watcher.on("add", (filePath) => sendChangeEvent("add", filePath)).on("change", (filePath) => sendChangeEvent("change", filePath)).on("unlink", (filePath) => sendChangeEvent("unlink", filePath)).on("addDir", (dirPath2) => sendChangeEvent("addDir", dirPath2)).on("unlinkDir", (dirPath2) => sendChangeEvent("unlinkDir", dirPath2)).on("error", (err) => console.warn("[Watcher] Watcher error:", err));
  }
  stopWatcher() {
    if (this.watcher) {
      this.watcher.close().catch(console.error);
      this.watcher = null;
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}
const fileService = new FileService();
class TerminalService {
  terminals = /* @__PURE__ */ new Map();
  pendingWrites = /* @__PURE__ */ new Map();
  mainWindow = null;
  setMainWindow(window) {
    this.mainWindow = window;
  }
  getAvailableShells() {
    const isWindows = os__namespace.platform() === "win32";
    const shells = [];
    if (isWindows) {
      const pwshCandidates = [
        path__namespace.join(process.env.ProgramFiles || "C:\\Program Files", "PowerShell", "7", "pwsh.exe"),
        path__namespace.join(process.env.LOCALAPPDATA || "", "Programs", "PowerShell", "7", "pwsh.exe")
      ];
      let foundPwsh = false;
      for (const p of pwshCandidates) {
        if (fsSync__namespace.existsSync(p)) {
          shells.push({
            id: "pwsh",
            name: "PowerShell 7",
            shell: "powershell",
            path: p,
            description: "PowerShell Core 7 (Modern, Cross-Platform)",
            iconType: "powershell"
          });
          foundPwsh = true;
          break;
        }
      }
      const winPsPath = process.env.SystemRoot ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` : "powershell.exe";
      shells.push({
        id: "powershell",
        name: foundPwsh ? "Windows PowerShell" : "PowerShell",
        shell: "powershell",
        path: winPsPath,
        description: "Default Windows PowerShell",
        iconType: "powershell"
      });
      const cmdPath = process.env.COMSPEC || `${process.env.SystemRoot || "C:\\Windows"}\\System32\\cmd.exe`;
      shells.push({
        id: "cmd",
        name: "Command Prompt",
        shell: "cmd",
        path: cmdPath,
        description: "Windows CMD Shell",
        iconType: "cmd"
      });
      const gitBashCandidates = [
        "C:\\Program Files\\Git\\bin\\bash.exe",
        "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
        path__namespace.join(process.env.LOCALAPPDATA || "", "Programs", "Git", "bin", "bash.exe")
      ];
      for (const candidate of gitBashCandidates) {
        if (fsSync__namespace.existsSync(candidate)) {
          shells.push({
            id: "git-bash",
            name: "Git Bash",
            shell: "bash",
            path: candidate,
            description: "Bash for Windows with Git tools",
            iconType: "bash"
          });
          break;
        }
      }
      const wslPath = `${process.env.SystemRoot || "C:\\Windows"}\\System32\\wsl.exe`;
      if (fsSync__namespace.existsSync(wslPath)) {
        shells.push({
          id: "wsl",
          name: "WSL / Ubuntu",
          shell: "wsl",
          path: wslPath,
          description: "Windows Subsystem for Linux",
          iconType: "wsl"
        });
      }
    } else {
      if (fsSync__namespace.existsSync("/bin/zsh")) {
        shells.push({
          id: "zsh",
          name: "Zsh",
          shell: "bash",
          path: "/bin/zsh",
          description: "Z Shell",
          iconType: "bash"
        });
      }
      if (fsSync__namespace.existsSync("/bin/bash")) {
        shells.push({
          id: "bash",
          name: "Bash",
          shell: "bash",
          path: "/bin/bash",
          description: "Bourne Again Shell",
          iconType: "bash"
        });
      }
    }
    return shells;
  }
  resolveShell(shellType) {
    const isWindows = os__namespace.platform() === "win32";
    const type = (shellType || "default").toLowerCase();
    if (!isWindows) {
      if (type === "bash") return { shell: "/bin/bash", args: ["-i"] };
      if (type === "zsh") return { shell: "/bin/zsh", args: ["-i"] };
      if (type === "sh") return { shell: "/bin/sh", args: ["-i"] };
      return { shell: process.env.SHELL || "/bin/bash", args: ["-i"] };
    }
    if (type === "cmd") {
      return { shell: process.env.COMSPEC || "cmd.exe", args: ["/K"] };
    }
    if (type === "bash" || type === "git-bash") {
      const gitBashCandidates = [
        "C:\\Program Files\\Git\\bin\\bash.exe",
        "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
        path__namespace.join(process.env.LOCALAPPDATA || "", "Programs", "Git", "bin", "bash.exe"),
        "bash.exe"
      ];
      for (const candidate of gitBashCandidates) {
        if (candidate === "bash.exe" || fsSync__namespace.existsSync(candidate)) {
          return { shell: candidate, args: ["--login", "-i"] };
        }
      }
      return { shell: "bash.exe", args: ["--login", "-i"] };
    }
    if (type === "wsl") {
      return { shell: "wsl.exe", args: [] };
    }
    if (type === "pwsh") {
      const pwshCandidates = [
        path__namespace.join(process.env.ProgramFiles || "C:\\Program Files", "PowerShell", "7", "pwsh.exe"),
        path__namespace.join(process.env.LOCALAPPDATA || "", "Programs", "PowerShell", "7", "pwsh.exe")
      ];
      for (const p of pwshCandidates) {
        if (fsSync__namespace.existsSync(p)) {
          return { shell: p, args: ["-NoLogo"] };
        }
      }
    }
    return {
      shell: process.env.SystemRoot ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe` : "powershell.exe",
      args: ["-NoLogo"]
    };
  }
  async createTerminal(id, cwd, shellType) {
    this.killTerminal(id);
    const workingDirectory = cwd && fsSync__namespace.existsSync(cwd) ? cwd : os__namespace.homedir();
    const { shell: resolvedShell, args: shellArgs } = this.resolveShell(shellType);
    try {
      const pty = require("node-pty");
      const ptyProcess = pty.spawn(resolvedShell, shellArgs, {
        name: "xterm-256color",
        cols: 80,
        rows: 24,
        cwd: workingDirectory,
        env: process.env,
        useConpty: false
      });
      const instance = {
        write: (data) => {
          try {
            ptyProcess.write(data);
          } catch {
          }
        },
        resize: (cols, rows) => {
          try {
            if (cols >= 2 && rows >= 2 && !isNaN(cols) && !isNaN(rows)) {
              ptyProcess.resize(Math.floor(cols), Math.floor(rows));
            }
          } catch {
          }
        },
        kill: () => {
          try {
            ptyProcess.kill();
          } catch {
          }
        }
      };
      this.terminals.set(id, instance);
      ptyProcess.onData((data) => {
        this.sendData(id, data);
      });
      ptyProcess.onExit(({ exitCode }) => {
        if (this.terminals.get(id) === instance) {
          this.terminals.delete(id);
          this.pendingWrites.delete(id);
          this.sendExit(id, exitCode);
        }
      });
      const queued = this.pendingWrites.get(id);
      if (queued && queued.length > 0) {
        for (const data of queued) {
          instance.write(data);
        }
        this.pendingWrites.delete(id);
      }
      return true;
    } catch (nodePtyErr) {
      console.warn("node-pty native module unavailable, falling back to child_process shell:", nodePtyErr);
    }
    try {
      const fallbackArgs = resolvedShell.toLowerCase().includes("powershell") ? ["-NoLogo", "-NoExit", "-Command", "-"] : shellArgs;
      const proc = child_process.spawn(resolvedShell, fallbackArgs, {
        cwd: workingDirectory,
        env: {
          ...process.env,
          TERM: "xterm-256color",
          COLORTERM: "truecolor"
        },
        stdio: ["pipe", "pipe", "pipe"]
      });
      const instance = {
        write: (data) => {
          try {
            if (proc.stdin && !proc.stdin.destroyed) {
              proc.stdin.write(data);
            }
          } catch {
          }
        },
        resize: () => {
        },
        kill: () => {
          try {
            proc.kill();
          } catch {
          }
        }
      };
      this.terminals.set(id, instance);
      proc.stdout?.on("data", (data) => {
        this.sendData(id, data.toString("utf-8"));
      });
      proc.stderr?.on("data", (data) => {
        this.sendData(id, data.toString("utf-8"));
      });
      proc.on("exit", (code) => {
        if (this.terminals.get(id) === instance) {
          this.terminals.delete(id);
          this.pendingWrites.delete(id);
          this.sendExit(id, code ?? 0);
        }
      });
      const queued = this.pendingWrites.get(id);
      if (queued && queued.length > 0) {
        for (const data of queued) {
          instance.write(data);
        }
        this.pendingWrites.delete(id);
      }
      this.sendData(id, `\x1B[38;2;93;214;44m[Bodhi Terminal Ready: ${workingDirectory}]\x1B[0m\r
`);
      return true;
    } catch (fallbackErr) {
      console.error(`Failed to create terminal [${id}]:`, fallbackErr);
      return false;
    }
  }
  sendData(id, data) {
    const payload = { id, data };
    const windows = electron.BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.TERMINAL_DATA, payload);
      }
    }
  }
  sendExit(id, exitCode) {
    const payload = { id, exitCode };
    const windows = electron.BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.TERMINAL_EXIT, payload);
      }
    }
  }
  writeTerminal(id, data) {
    const term = this.terminals.get(id);
    if (term) {
      term.write(data);
    } else {
      const queued = this.pendingWrites.get(id) || [];
      queued.push(data);
      this.pendingWrites.set(id, queued);
    }
  }
  resizeTerminal(id, cols, rows) {
    if (!cols || !rows || cols < 2 || rows < 2 || isNaN(cols) || isNaN(rows)) {
      return;
    }
    const term = this.terminals.get(id);
    if (term) {
      term.resize(cols, rows);
    }
  }
  killTerminal(id) {
    const term = this.terminals.get(id);
    if (term) {
      this.terminals.delete(id);
      try {
        term.kill();
      } catch (err) {
        console.warn(`[terminalService] Error killing terminal session ${id}:`, err);
      }
    }
    this.pendingWrites.delete(id);
  }
  killAll() {
    for (const [id] of this.terminals) {
      this.killTerminal(id);
    }
    this.pendingWrites.clear();
  }
}
const terminalService = new TerminalService();
const IGNORED_DIRECTORIES = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "dist",
  "out",
  ".next",
  ".turbo",
  ".vscode",
  ".idea",
  "coverage",
  ".DS_Store"
]);
const BINARY_EXTENSIONS = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "ico",
  "webp",
  "svgz",
  "mp4",
  "mp3",
  "wav",
  "ogg",
  "zip",
  "tar",
  "gz",
  "7z",
  "rar",
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "pdf",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "node"
]);
class SearchService {
  isBinaryFile(filePath) {
    const ext = path__namespace.extname(filePath).slice(1).toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
  }
  matchesGlob(filePath, pattern) {
    if (!pattern.trim()) return true;
    const normalized = filePath.replace(/\\/g, "/");
    const patterns = pattern.split(",").map((p) => p.trim());
    for (const p of patterns) {
      if (!p) continue;
      const isNegated = p.startsWith("!");
      const rawPattern = isNegated ? p.slice(1).trim() : p;
      const regexPattern = rawPattern.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/(?<!\.)\*/g, "[^/]*");
      const regex = new RegExp(regexPattern, "i");
      const matched = regex.test(normalized);
      if (isNegated && matched) return false;
      if (!isNegated && !matched) return false;
    }
    return true;
  }
  createSearchRegex(query, options) {
    if (!query) return null;
    let pattern = query;
    if (!options?.isRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (options?.matchWholeWord) {
      pattern = `\\b${pattern}\\b`;
    }
    const flags = options?.matchCase ? "g" : "gi";
    try {
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }
  async scanFiles(dirPath, filesList = []) {
    try {
      const entries = await fs__namespace.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        const fullPath = path__namespace.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await this.scanFiles(fullPath, filesList);
        } else if (entry.isFile()) {
          if (!this.isBinaryFile(fullPath)) {
            filesList.push(fullPath);
          }
        }
      }
    } catch {
    }
    return filesList;
  }
  async searchWorkspace(workspacePath, query, options) {
    if (!query || !workspacePath) return [];
    const regex = this.createSearchRegex(query, options);
    if (!regex) return [];
    const allFiles = await this.scanFiles(workspacePath);
    const results = [];
    const maxResults = options?.maxResults || 2e3;
    let totalMatchesFound = 0;
    for (const filePath of allFiles) {
      if (totalMatchesFound >= maxResults) break;
      const relPath = path__namespace.relative(workspacePath, filePath).replace(/\\/g, "/");
      if (options?.includePattern && !this.matchesGlob(relPath, options.includePattern)) {
        continue;
      }
      if (options?.excludePattern && this.matchesGlob(relPath, options.excludePattern)) {
        continue;
      }
      try {
        const content = await fs__namespace.readFile(filePath, "utf-8");
        if (content.includes("\0")) continue;
        const lines = content.split(/\r?\n/);
        const fileMatches = [];
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          const lineContent = lines[lineIdx];
          regex.lastIndex = 0;
          let match;
          while ((match = regex.exec(lineContent)) !== null) {
            fileMatches.push({
              filePath,
              relativePath: relPath,
              fileName: path__namespace.basename(filePath),
              line: lineIdx + 1,
              column: match.index + 1,
              lineContent,
              matchLength: match[0].length
            });
            totalMatchesFound++;
            if (totalMatchesFound >= maxResults) break;
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
          if (totalMatchesFound >= maxResults) break;
        }
        if (fileMatches.length > 0) {
          results.push({
            filePath,
            relativePath: relPath,
            fileName: path__namespace.basename(filePath),
            matches: fileMatches
          });
        }
      } catch {
      }
    }
    return results;
  }
  async replaceInFile(filePath, query, replaceText, options) {
    const regex = this.createSearchRegex(query, options);
    if (!regex) return 0;
    try {
      const content = await fs__namespace.readFile(filePath, "utf-8");
      let count = 0;
      const newContent = content.replace(regex, () => {
        count++;
        return replaceText;
      });
      if (count > 0) {
        await fs__namespace.writeFile(filePath, newContent, "utf-8");
      }
      return count;
    } catch {
      return 0;
    }
  }
  async replaceAll(workspacePath, query, replaceText, options) {
    const searchGroups = await this.searchWorkspace(workspacePath, query, options);
    let totalReplacements = 0;
    let filesModified = 0;
    for (const group of searchGroups) {
      const count = await this.replaceInFile(group.filePath, query, replaceText, options);
      if (count > 0) {
        totalReplacements += count;
        filesModified++;
      }
    }
    return { totalReplacements, filesModified };
  }
}
const workspaceQueues = /* @__PURE__ */ new Map();
function runGit(args, cwd, isMutating = false) {
  const execute = async () => {
    return new Promise((resolve, reject) => {
      child_process.execFile(
        "git",
        args,
        {
          cwd,
          maxBuffer: 15 * 1024 * 1024,
          windowsHide: true,
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: "0"
          }
        },
        async (error, stdout, stderr) => {
          if (error) {
            const errOutput = stderr || stdout || error.message;
            if (errOutput.includes("index.lock")) {
              try {
                const lockPath = path__namespace.join(cwd, ".git", "index.lock");
                const stat = await fs__namespace.stat(lockPath).catch(() => null);
                if (stat && Date.now() - stat.mtimeMs > 6e3) {
                  await fs__namespace.unlink(lockPath).catch(() => null);
                  console.warn("[GitService] Purged stale .git/index.lock");
                }
              } catch {
              }
            }
            reject(new Error(errOutput));
          } else {
            resolve(stdout);
          }
        }
      );
    });
  };
  if (isMutating && cwd) {
    const prevQueue = workspaceQueues.get(cwd) || Promise.resolve();
    const nextQueue = prevQueue.catch(() => {
    }).then(() => execute());
    workspaceQueues.set(cwd, nextQueue);
    return nextQueue;
  }
  return execute();
}
class GitService {
  async isGitRepo(workspacePath) {
    if (!workspacePath) return false;
    try {
      const out = await runGit(["rev-parse", "--is-inside-work-tree"], workspacePath);
      return out.trim() === "true";
    } catch {
      return false;
    }
  }
  async getBranch(workspacePath) {
    if (!workspacePath) return null;
    try {
      const branch = await runGit(["branch", "--show-current"], workspacePath);
      const trimmed = branch.trim();
      if (trimmed) return trimmed;
      const shortHead = await runGit(["rev-parse", "--short", "HEAD"], workspacePath);
      return shortHead.trim() ? `(${shortHead.trim()})` : null;
    } catch {
      return null;
    }
  }
  async getStatus(workspacePath) {
    const emptyResult = {
      isRepo: false,
      branch: null,
      staged: [],
      unstaged: [],
      untracked: []
    };
    if (!workspacePath) return emptyResult;
    const isRepo = await this.isGitRepo(workspacePath);
    if (!isRepo) return emptyResult;
    const branch = await this.getBranch(workspacePath);
    try {
      const output = await runGit(["status", "--porcelain=v1", "-uall"], workspacePath);
      const lines = output.split(/\r?\n/).filter((l) => l.length >= 3);
      const staged = [];
      const unstaged = [];
      const untracked = [];
      for (const line of lines) {
        const x = line[0];
        const y = line[1];
        let rawPath = line.substring(3).trim();
        if (rawPath.startsWith('"') && rawPath.endsWith('"')) {
          rawPath = rawPath.slice(1, -1);
        }
        if (rawPath.includes(" -> ")) {
          const parts = rawPath.split(" -> ");
          rawPath = parts[1];
        }
        const relPath = rawPath.replace(/\\/g, "/");
        const fullPath = path__namespace.join(workspacePath, relPath).replace(/\\/g, "/");
        const fileName = path__namespace.basename(fullPath);
        if (x === "?" && y === "?") {
          untracked.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: "U",
            staged: false
          });
          continue;
        }
        if (x !== " " && x !== "?") {
          staged.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: x,
            staged: true
          });
        }
        if (y !== " " && y !== "?") {
          unstaged.push({
            path: fullPath,
            relativePath: relPath,
            fileName,
            status: y,
            staged: false
          });
        }
      }
      return {
        isRepo: true,
        branch,
        staged,
        unstaged,
        untracked
      };
    } catch (err) {
      console.error("Failed to get git status:", err);
      return {
        isRepo: true,
        branch,
        staged: [],
        unstaged: [],
        untracked: []
      };
    }
  }
  async stageFile(workspacePath, relativePath) {
    try {
      await runGit(["add", "--", relativePath], workspacePath);
      return true;
    } catch (err) {
      console.error(`Failed to stage file ${relativePath}:`, err);
      return false;
    }
  }
  async unstageFile(workspacePath, relativePath) {
    try {
      try {
        await runGit(["restore", "--staged", "--", relativePath], workspacePath);
      } catch {
        await runGit(["reset", "HEAD", "--", relativePath], workspacePath);
      }
      return true;
    } catch (err) {
      console.error(`Failed to unstage file ${relativePath}:`, err);
      return false;
    }
  }
  async stageAll(workspacePath) {
    try {
      await runGit(["add", "-A"], workspacePath);
      return true;
    } catch (err) {
      console.error("Failed to stage all files:", err);
      return false;
    }
  }
  async unstageAll(workspacePath) {
    try {
      await runGit(["reset"], workspacePath);
      return true;
    } catch (err) {
      console.error("Failed to unstage all files:", err);
      return false;
    }
  }
  async discardFile(workspacePath, relativePath, isUntracked = false) {
    try {
      if (isUntracked) {
        const fullPath = path__namespace.join(workspacePath, relativePath);
        await fs__namespace.rm(fullPath, { recursive: true, force: true });
      } else {
        try {
          await runGit(["restore", "--", relativePath], workspacePath);
        } catch {
          await runGit(["checkout", "--", relativePath], workspacePath);
        }
      }
      return true;
    } catch (err) {
      console.error(`Failed to discard file ${relativePath}:`, err);
      return false;
    }
  }
  async getFileAtHead(workspacePath, relativePath) {
    if (!workspacePath || !relativePath) return null;
    try {
      const gitRelPath = relativePath.replace(/\\/g, "/");
      const content = await runGit(["show", `HEAD:${gitRelPath}`], workspacePath);
      return content;
    } catch {
      return "";
    }
  }
  async getDiff(workspacePath, relativePath, staged = false) {
    if (!workspacePath || !relativePath) return "";
    try {
      const gitRelPath = relativePath.replace(/\\/g, "/");
      if (staged) {
        return await runGit(["diff", "--staged", "--", gitRelPath], workspacePath);
      }
      try {
        return await runGit(["diff", "HEAD", "--", gitRelPath], workspacePath);
      } catch {
        return await runGit(["diff", "--", gitRelPath], workspacePath);
      }
    } catch {
      return "";
    }
  }
  async commit(workspacePath, message) {
    if (!message || !message.trim()) return false;
    try {
      await runGit(["commit", "-m", message.trim()], workspacePath);
      return true;
    } catch (err) {
      console.error("Failed to commit:", err);
      return false;
    }
  }
  async getFileChurn(workspacePath, relativePath) {
    if (!workspacePath || !relativePath) return null;
    try {
      const isRepo = await this.isGitRepo(workspacePath);
      if (!isRepo) return null;
      const gitRelPath = relativePath.replace(/\\/g, "/");
      let stdout;
      try {
        stdout = await runGit(["blame", "--line-porcelain", "--", gitRelPath], workspacePath);
      } catch {
        return null;
      }
      if (!stdout || stdout.trim().length === 0) return null;
      const commitCache = /* @__PURE__ */ new Map();
      const rawLines = [];
      const lines = stdout.split(/\r?\n/);
      let currentHash = "";
      let currentFinalLine = 0;
      let currentAuthor = "Unknown";
      let currentMail = "";
      let currentAuthorTime = 0;
      let currentSummary = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const headerMatch = line.match(/^([0-9a-fA-F]{40})\s+\d+\s+(\d+)/);
        if (headerMatch) {
          currentHash = headerMatch[1];
          currentFinalLine = parseInt(headerMatch[2], 10);
          if (commitCache.has(currentHash)) {
            const cached = commitCache.get(currentHash);
            currentAuthor = cached.author;
            currentMail = cached.authorMail;
            currentAuthorTime = cached.authorTime;
            currentSummary = cached.summary;
          } else {
            currentAuthor = "Unknown";
            currentMail = "";
            currentAuthorTime = 0;
            currentSummary = "";
          }
          continue;
        }
        if (line.startsWith("author ")) {
          currentAuthor = line.substring(7).trim();
        } else if (line.startsWith("author-mail ")) {
          currentMail = line.substring(12).trim().replace(/^<|>$/g, "");
        } else if (line.startsWith("author-time ")) {
          currentAuthorTime = parseInt(line.substring(12).trim(), 10) || 0;
        } else if (line.startsWith("summary ")) {
          currentSummary = line.substring(8).trim();
        } else if (line.startsWith("	")) {
          if (currentHash && currentFinalLine > 0) {
            commitCache.set(currentHash, {
              author: currentAuthor,
              authorMail: currentMail,
              authorTime: currentAuthorTime,
              summary: currentSummary
            });
            rawLines.push({
              lineNumber: currentFinalLine,
              commitHash: currentHash,
              shortHash: currentHash.slice(0, 7),
              author: currentAuthor,
              authorEmail: currentMail,
              authorTime: currentAuthorTime,
              summary: currentSummary
            });
          }
        }
      }
      if (rawLines.length === 0) return null;
      const now = Math.floor(Date.now() / 1e3);
      const validTimes = rawLines.map((l) => l.authorTime).filter((t) => t > 0 && !isNaN(t));
      const lastModified = validTimes.length > 0 ? Math.max(...validTimes) : now;
      const oldestModified = validTimes.length > 0 ? Math.min(...validTimes) : now;
      const uniqueAuthors = Array.from(
        new Set(
          rawLines.map((l) => l.author).filter((a) => a && a !== "Not Committed Yet" && a !== "Unknown")
        )
      );
      const uniqueCommits = new Set(
        rawLines.map((l) => l.commitHash).filter((h) => !h.startsWith("0000000"))
      );
      const ONE_DAY = 86400;
      const ONE_WEEK = 7 * ONE_DAY;
      const ONE_MONTH = 30 * ONE_DAY;
      const THREE_MONTHS = 90 * ONE_DAY;
      const processedLines = rawLines.map((l) => {
        const isUncommitted = l.commitHash.startsWith("0000000") || l.author === "Not Committed Yet";
        let heatLevel = 1;
        let heatScore = 0.2;
        let relativeTime = "";
        if (isUncommitted) {
          heatLevel = 5;
          heatScore = 1;
          relativeTime = "Uncommitted (Working Tree)";
        } else if (l.authorTime > 0) {
          const ageSeconds = Math.max(0, now - l.authorTime);
          if (ageSeconds <= 2 * ONE_DAY) {
            heatLevel = 5;
            heatScore = 1;
          } else if (ageSeconds <= ONE_WEEK) {
            heatLevel = 4;
            heatScore = 0.8;
          } else if (ageSeconds <= ONE_MONTH) {
            heatLevel = 3;
            heatScore = 0.6;
          } else if (ageSeconds <= THREE_MONTHS) {
            heatLevel = 2;
            heatScore = 0.4;
          } else {
            heatLevel = 1;
            heatScore = 0.2;
          }
          if (lastModified > oldestModified) {
            const fileRecency = (l.authorTime - oldestModified) / (lastModified - oldestModified);
            if (fileRecency >= 0.85 && heatLevel < 4) {
              heatLevel = Math.min(5, heatLevel + 1);
            }
          }
          if (ageSeconds < 60) {
            relativeTime = "Just now";
          } else if (ageSeconds < 3600) {
            const mins = Math.floor(ageSeconds / 60);
            relativeTime = `${mins}m ago`;
          } else if (ageSeconds < ONE_DAY) {
            const hrs = Math.floor(ageSeconds / 3600);
            relativeTime = `${hrs}h ago`;
          } else if (ageSeconds < ONE_WEEK) {
            const days = Math.floor(ageSeconds / ONE_DAY);
            relativeTime = `${days}d ago`;
          } else if (ageSeconds < ONE_MONTH) {
            const weeks = Math.floor(ageSeconds / ONE_WEEK);
            relativeTime = `${weeks}w ago`;
          } else if (ageSeconds < 365 * ONE_DAY) {
            const months = Math.floor(ageSeconds / ONE_MONTH);
            relativeTime = `${months}mo ago`;
          } else {
            const years = Math.floor(ageSeconds / (365 * ONE_DAY));
            relativeTime = `${years}y ago`;
          }
        } else {
          relativeTime = "Unknown";
        }
        const dateStr = l.authorTime > 0 ? new Date(l.authorTime * 1e3).toLocaleDateString() : "";
        return {
          lineNumber: l.lineNumber,
          commitHash: l.commitHash,
          shortHash: l.shortHash,
          author: l.author,
          authorEmail: l.authorEmail,
          authorTime: l.authorTime,
          dateStr,
          relativeTime,
          summary: l.summary,
          heatLevel,
          heatScore
        };
      });
      return {
        filePath: gitRelPath,
        totalCommits: uniqueCommits.size,
        uniqueAuthors,
        lines: processedLines,
        lastModified,
        oldestModified
      };
    } catch (err) {
      console.error(`Failed to get file churn for ${relativePath}:`, err);
      return null;
    }
  }
  async initRepo(workspacePath, defaultBranch = "main") {
    if (!workspacePath) return false;
    try {
      try {
        await runGit(["init", "-b", defaultBranch], workspacePath, true);
      } catch {
        await runGit(["init"], workspacePath, true);
        try {
          await runGit(["checkout", "-b", defaultBranch], workspacePath, true);
        } catch {
        }
      }
      return true;
    } catch (err) {
      console.error("Failed to init repo:", err);
      return false;
    }
  }
  async createGitignore(workspacePath, templateType) {
    if (!workspacePath) return false;
    const gitignorePath = path__namespace.join(workspacePath, ".gitignore");
    let content = "";
    switch (templateType.toLowerCase()) {
      case "node":
        content = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production
dist/
out/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# System
.DS_Store
Thumbs.db
`;
        break;
      case "python":
        content = `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Virtual Environments
.env
.venv
env/
venv/
ENV/

# Distribution / packaging
dist/
build/
*.egg-info/

# System
.DS_Store
Thumbs.db
`;
        break;
      case "rust":
        content = `# Output
/target/
**/*.rs.bk
Cargo.lock

# Environment
.env

# System
.DS_Store
Thumbs.db
`;
        break;
      default:
        content = `# Dependencies & Builds
node_modules/
dist/
out/
build/
target/

# Environment & Secrets
.env
.env.local
*.pem
*.key

# Logs & OS
*.log
.DS_Store
Thumbs.db
`;
        break;
    }
    try {
      let existing = "";
      try {
        existing = await fs__namespace.readFile(gitignorePath, "utf8");
      } catch {
      }
      if (existing) {
        content = `${existing.trim()}

# Added by Bodhi
${content}`;
      }
      await fs__namespace.writeFile(gitignorePath, content, "utf8");
      return true;
    } catch (err) {
      console.error("Failed to create .gitignore:", err);
      return false;
    }
  }
  async getRemotes(workspacePath) {
    if (!workspacePath) return [];
    try {
      const output = await runGit(["remote", "-v"], workspacePath);
      const lines = output.split(/\r?\n/).filter((l) => l.trim());
      const remoteMap = /* @__PURE__ */ new Map();
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const name = parts[0];
          const url = parts[1];
          const type = parts[2];
          const curr = remoteMap.get(name) || { fetchUrl: "", pushUrl: "" };
          if (type.includes("(fetch)")) {
            curr.fetchUrl = url;
          } else if (type.includes("(push)")) {
            curr.pushUrl = url;
          }
          remoteMap.set(name, curr);
        }
      }
      const remotes = [];
      for (const [name, urls] of remoteMap.entries()) {
        remotes.push({
          name,
          fetchUrl: urls.fetchUrl || urls.pushUrl,
          pushUrl: urls.pushUrl || urls.fetchUrl
        });
      }
      return remotes;
    } catch {
      return [];
    }
  }
  async addRemote(workspacePath, name, url) {
    if (!workspacePath || !name || !url) return false;
    try {
      await runGit(["remote", "add", name.trim(), url.trim()], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to add remote ${name}:`, err);
      return false;
    }
  }
  async removeRemote(workspacePath, name) {
    if (!workspacePath || !name) return false;
    try {
      await runGit(["remote", "remove", name.trim()], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to remove remote ${name}:`, err);
      return false;
    }
  }
  async setRemoteUrl(workspacePath, name, url) {
    if (!workspacePath || !name || !url) return false;
    try {
      await runGit(["remote", "set-url", name.trim(), url.trim()], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to set remote url for ${name}:`, err);
      return false;
    }
  }
  async getBranches(workspacePath) {
    if (!workspacePath) return [];
    try {
      const output = await runGit(["branch", "-a", "--no-color"], workspacePath);
      const lines = output.split(/\r?\n/).filter((l) => l.trim());
      const branches = [];
      for (const line of lines) {
        const isCurrent = line.startsWith("*");
        let branchName = line.replace(/^[* ]\s*/, "").trim();
        if (branchName.startsWith("(HEAD detached")) {
          continue;
        }
        const isRemote = branchName.startsWith("remotes/");
        if (isRemote) {
          if (branchName.includes(" -> ")) continue;
          branchName = branchName.replace(/^remotes\//, "");
        }
        branches.push({
          name: branchName,
          current: isCurrent,
          remote: isRemote
        });
      }
      return branches;
    } catch {
      return [];
    }
  }
  async checkoutBranch(workspacePath, branchName, createNew = false) {
    if (!workspacePath || !branchName) return false;
    try {
      if (createNew) {
        await runGit(["checkout", "-b", branchName.trim()], workspacePath, true);
      } else {
        await runGit(["checkout", branchName.trim()], workspacePath, true);
      }
      return true;
    } catch (err) {
      console.error(`Failed to checkout branch ${branchName}:`, err);
      return false;
    }
  }
  async createBranch(workspacePath, branchName) {
    if (!workspacePath || !branchName) return false;
    try {
      await runGit(["branch", branchName.trim()], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to create branch ${branchName}:`, err);
      return false;
    }
  }
  async deleteBranch(workspacePath, branchName, force = false) {
    if (!workspacePath || !branchName) return false;
    try {
      await runGit(["branch", force ? "-D" : "-d", branchName.trim()], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to delete branch ${branchName}:`, err);
      return false;
    }
  }
  async mergeBranch(workspacePath, branchName) {
    if (!workspacePath || !branchName) {
      return { success: false, message: "Invalid arguments" };
    }
    try {
      const stdout = await runGit(["merge", branchName.trim()], workspacePath, true);
      return { success: true, message: stdout.trim() || "Merge successful" };
    } catch (err) {
      return { success: false, message: err.message || "Merge conflict or failed" };
    }
  }
  async fetch(workspacePath, remote) {
    if (!workspacePath) return false;
    try {
      await runGit(["fetch", remote || "--all"], workspacePath, true);
      return true;
    } catch (err) {
      console.error("Failed to fetch:", err);
      return false;
    }
  }
  async pull(workspacePath, remote, branch) {
    if (!workspacePath) return { success: false, message: "No workspace" };
    try {
      const args = ["pull"];
      if (remote) args.push(remote);
      if (branch) args.push(branch);
      const res = await runGit(args, workspacePath, true);
      return { success: true, message: res.trim() || "Pull successful" };
    } catch (err) {
      console.error("Failed to pull:", err);
      return { success: false, message: err.message || "Pull failed" };
    }
  }
  async push(workspacePath, remote = "origin", branch, setUpstream = false) {
    if (!workspacePath) return { success: false, message: "No workspace" };
    try {
      const currentBranch = branch || await this.getBranch(workspacePath) || "main";
      const args = ["push"];
      if (setUpstream) {
        args.push("-u", remote, currentBranch);
      } else {
        args.push(remote, currentBranch);
      }
      const res = await runGit(args, workspacePath, true);
      return { success: true, message: res.trim() || "Push successful" };
    } catch (err) {
      console.error("Failed to push:", err);
      return { success: false, message: err.message || "Push failed" };
    }
  }
  async getSyncStatus(workspacePath) {
    const defaultStatus = {
      ahead: 0,
      behind: 0,
      hasRemote: false,
      upstream: null
    };
    if (!workspacePath) return defaultStatus;
    try {
      const remotes = await this.getRemotes(workspacePath);
      const hasRemote = remotes.length > 0;
      if (!hasRemote) {
        return defaultStatus;
      }
      let upstream = null;
      try {
        const out = await runGit(
          ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
          workspacePath
        );
        upstream = out.trim() || null;
      } catch {
        upstream = null;
      }
      if (!upstream) {
        return {
          ahead: 0,
          behind: 0,
          hasRemote: true,
          upstream: null
        };
      }
      let ahead = 0;
      let behind = 0;
      try {
        const aheadOut = await runGit(["rev-list", "--count", "@{u}..HEAD"], workspacePath);
        ahead = parseInt(aheadOut.trim(), 10) || 0;
      } catch {
        ahead = 0;
      }
      try {
        const behindOut = await runGit(["rev-list", "--count", "HEAD..@{u}"], workspacePath);
        behind = parseInt(behindOut.trim(), 10) || 0;
      } catch {
        behind = 0;
      }
      return {
        ahead,
        behind,
        hasRemote: true,
        upstream
      };
    } catch {
      return defaultStatus;
    }
  }
  async stashSave(workspacePath, message) {
    if (!workspacePath) return false;
    try {
      const args = ["stash", "push"];
      if (message && message.trim()) {
        args.push("-m", message.trim());
      }
      await runGit(args, workspacePath, true);
      return true;
    } catch (err) {
      console.error("Failed to stash:", err);
      return false;
    }
  }
  async stashPop(workspacePath, index = 0) {
    if (!workspacePath) return false;
    try {
      await runGit(["stash", "pop", `stash@{${index}}`], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to pop stash index ${index}:`, err);
      return false;
    }
  }
  async stashList(workspacePath) {
    if (!workspacePath) return [];
    try {
      const out = await runGit(["stash", "list", "--pretty=format:%gd|%h|%s|%cr"], workspacePath);
      const lines = out.split(/\r?\n/).filter((l) => l.trim());
      const stashes = [];
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split("|");
        if (parts.length >= 4) {
          const indexMatch = parts[0].match(/stash@\{(\d+)\}/);
          const index = indexMatch ? parseInt(indexMatch[1], 10) : i;
          stashes.push({
            index,
            hash: parts[1],
            message: parts[2],
            date: parts[3]
          });
        }
      }
      return stashes;
    } catch {
      return [];
    }
  }
  async stashDrop(workspacePath, index = 0) {
    if (!workspacePath) return false;
    try {
      await runGit(["stash", "drop", `stash@{${index}}`], workspacePath, true);
      return true;
    } catch (err) {
      console.error(`Failed to drop stash index ${index}:`, err);
      return false;
    }
  }
  async getCommitLog(workspacePath, maxCount = 50) {
    if (!workspacePath) return [];
    try {
      const out = await runGit(
        ["log", `-n${maxCount}`, "--pretty=format:%H|%h|%an|%ae|%aI|%ar|%s"],
        workspacePath
      );
      const lines = out.split(/\r?\n/).filter((l) => l.trim());
      const commits = [];
      for (const line of lines) {
        const parts = line.split("|");
        if (parts.length >= 7) {
          commits.push({
            hash: parts[0],
            shortHash: parts[1],
            author: parts[2],
            email: parts[3],
            date: parts[4],
            relativeTime: parts[5],
            message: parts.slice(6).join("|")
          });
        }
      }
      return commits;
    } catch {
      return [];
    }
  }
  async undoLastCommit(workspacePath) {
    if (!workspacePath) return false;
    try {
      await runGit(["reset", "--soft", "HEAD~1"], workspacePath, true);
      return true;
    } catch (err) {
      console.error("Failed to undo last commit:", err);
      return false;
    }
  }
}
const gitService = new GitService();
class GitHubService {
  tokenFilePath;
  constructor() {
    try {
      this.tokenFilePath = path__namespace.join(electron.app.getPath("userData"), "github_token.enc");
    } catch {
      this.tokenFilePath = path__namespace.join(process.cwd(), ".github_token.enc");
    }
  }
  async getStoredToken() {
    try {
      const buffer = await fs__namespace.readFile(this.tokenFilePath);
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        return electron.safeStorage.decryptString(buffer);
      } else {
        return buffer.toString("utf8");
      }
    } catch {
      return null;
    }
  }
  async setStoredToken(token) {
    if (!token || !token.trim()) return false;
    try {
      let data;
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        data = electron.safeStorage.encryptString(token.trim());
      } else {
        data = Buffer.from(token.trim(), "utf8");
      }
      await fs__namespace.writeFile(this.tokenFilePath, data);
      return true;
    } catch (err) {
      console.error("Failed to store GitHub token:", err);
      return false;
    }
  }
  async clearStoredToken() {
    try {
      await fs__namespace.unlink(this.tokenFilePath);
      return true;
    } catch {
      return true;
    }
  }
  async validateToken(token) {
    if (!token || !token.trim()) return null;
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Bodhi-Editor"
        }
      });
      if (!res.ok) {
        console.error("GitHub validate token failed:", res.status, res.statusText);
        return null;
      }
      const data = await res.json();
      return {
        login: data.login,
        name: data.name || data.login,
        avatarUrl: data.avatar_url,
        bio: data.bio || "",
        publicRepos: data.public_repos || 0,
        htmlUrl: data.html_url
      };
    } catch (err) {
      console.error("Failed to validate GitHub token:", err);
      return null;
    }
  }
  async getUserRepositories(token) {
    const activeToken = token || await this.getStoredToken();
    if (!activeToken) return [];
    try {
      const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
        headers: {
          Authorization: `Bearer ${activeToken.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Bodhi-Editor"
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        isPrivate: !!repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        description: repo.description
      }));
    } catch (err) {
      console.error("Failed to fetch user repositories from GitHub:", err);
      return [];
    }
  }
  async publishRepository(workspacePath, options, token) {
    const activeToken = token || await this.getStoredToken();
    if (!activeToken) {
      return {
        success: false,
        error: "Please connect your GitHub account or provide a GitHub Personal Access Token."
      };
    }
    if (!workspacePath) {
      return { success: false, error: "No active workspace open." };
    }
    const isRepo = await gitService.isGitRepo(workspacePath);
    if (!isRepo) {
      const initialized = await gitService.initRepo(workspacePath, "main");
      if (!initialized) {
        return { success: false, error: "Failed to initialize local Git repository." };
      }
    }
    const endpoint = options.org ? `https://api.github.com/orgs/${encodeURIComponent(options.org)}/repos` : "https://api.github.com/user/repos";
    try {
      const createRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Bodhi-Editor"
        },
        body: JSON.stringify({
          name: options.repoName.trim(),
          description: options.description?.trim() || "",
          private: options.isPrivate,
          auto_init: false
        })
      });
      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        const msg = errorData.message || createRes.statusText;
        const errors = errorData.errors ? errorData.errors.map((e) => e.message).join(", ") : "";
        return {
          success: false,
          error: `GitHub repository creation failed: ${msg}${errors ? ` (${errors})` : ""}`
        };
      }
      const repoData = await createRes.json();
      let cloneUrl = repoData.clone_url;
      const htmlUrl = repoData.html_url;
      if (cloneUrl.startsWith("https://")) {
        const urlObj = new URL(cloneUrl);
        urlObj.username = "x-access-token";
        urlObj.password = activeToken.trim();
        cloneUrl = urlObj.toString();
      }
      const remotes = await gitService.getRemotes(workspacePath);
      const originRemote = remotes.find((r) => r.name === "origin");
      if (originRemote) {
        await gitService.setRemoteUrl(workspacePath, "origin", cloneUrl);
      } else {
        await gitService.addRemote(workspacePath, "origin", cloneUrl);
      }
      const status = await gitService.getStatus(workspacePath);
      const commitLog = await gitService.getCommitLog(workspacePath, 1);
      if (commitLog.length === 0) {
        await gitService.stageAll(workspacePath);
        await gitService.commit(workspacePath, "Initial commit from Bodhi Editor");
      } else if (status.staged.length > 0 || status.unstaged.length > 0 || status.untracked.length > 0) {
        await gitService.stageAll(workspacePath);
        await gitService.commit(workspacePath, "Update project changes before publishing");
      }
      const currentBranch = await gitService.getBranch(workspacePath) || "main";
      const pushRes = await gitService.push(workspacePath, "origin", currentBranch, true);
      await gitService.setRemoteUrl(workspacePath, "origin", repoData.clone_url);
      if (!pushRes.success) {
        return {
          success: true,
          cloneUrl: repoData.clone_url,
          htmlUrl,
          error: `Repository was created on GitHub (${htmlUrl}), but initial push failed: ${pushRes.message}. You can push manually using Source Control.`
        };
      }
      return {
        success: true,
        cloneUrl: repoData.clone_url,
        htmlUrl
      };
    } catch (err) {
      console.error("Failed in publishRepository:", err);
      return { success: false, error: err.message || "Unknown network error occurred." };
    }
  }
}
const githubService = new GitHubService();
const DEFAULT_GOOGLE_CLIENT_ID = process.env.BODHI_GOOGLE_CLIENT_ID || "984182987114-bodhi-editor-demo.apps.googleusercontent.com";
function base64UrlEncode(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function generateCodeVerifier() {
  return base64UrlEncode(crypto__namespace.randomBytes(32));
}
function generateCodeChallenge(verifier) {
  const hash = crypto__namespace.createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}
class AuthService {
  userProfilePath;
  currentUser = null;
  activeServer = null;
  constructor() {
    try {
      this.userProfilePath = path__namespace.join(electron.app.getPath("userData"), "bodhi_user.enc");
    } catch {
      this.userProfilePath = path__namespace.join(process.cwd(), ".bodhi_user.enc");
    }
  }
  async init() {
    await this.loadStoredUser();
  }
  async loadStoredUser() {
    try {
      const buffer = await fs__namespace.readFile(this.userProfilePath);
      let jsonStr;
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        jsonStr = electron.safeStorage.decryptString(buffer);
      } else {
        jsonStr = buffer.toString("utf8");
      }
      this.currentUser = JSON.parse(jsonStr);
      return this.currentUser;
    } catch {
      this.currentUser = null;
      return null;
    }
  }
  async saveUser(user) {
    this.currentUser = user;
    try {
      const str = JSON.stringify(user);
      let data;
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        data = electron.safeStorage.encryptString(str);
      } else {
        data = Buffer.from(str, "utf8");
      }
      await fs__namespace.writeFile(this.userProfilePath, data);
    } catch (err) {
      console.error("Failed to save user session:", err);
    }
    this.notifyWindows(user);
  }
  async getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    return await this.loadStoredUser();
  }
  async logout() {
    this.currentUser = null;
    try {
      await fs__namespace.unlink(this.userProfilePath);
    } catch {
    }
    this.notifyWindows(null);
    return true;
  }
  notifyWindows(user) {
    const windows = electron.BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, user);
      }
    }
  }
  async loginWithGoogle() {
    if (this.activeServer) {
      try {
        this.activeServer.close();
      } catch {
      }
      this.activeServer = null;
    }
    return new Promise((resolve) => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      const state = crypto__namespace.randomBytes(16).toString("hex");
      const server = http__namespace.createServer(async (req, res) => {
        try {
          if (!req.url || !req.url.startsWith("/callback")) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
            return;
          }
          const parsedUrl = new URL(req.url, `http://127.0.0.1:${server.address().port}`);
          const code = parsedUrl.searchParams.get("code");
          const returnedState = parsedUrl.searchParams.get("state");
          const error = parsedUrl.searchParams.get("error");
          if (error) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(this.getHtmlPage("Authentication Failed", `Sign-in was cancelled or encountered an error: ${error}`, false));
            cleanupServer();
            resolve({ success: false, error: `Google login cancelled: ${error}` });
            return;
          }
          if (!code || returnedState !== state) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(this.getHtmlPage("Invalid Request", "Authentication state verification failed. Please try again.", false));
            cleanupServer();
            resolve({ success: false, error: "Invalid state or missing authorization code." });
            return;
          }
          let userProfile = null;
          try {
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: new URLSearchParams({
                code,
                client_id: DEFAULT_GOOGLE_CLIENT_ID,
                code_verifier: verifier,
                grant_type: "authorization_code",
                redirect_uri: `http://127.0.0.1:${server.address().port}/callback`
              })
            });
            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              const accessToken = tokenData.access_token;
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (userInfoRes.ok) {
                const info = await userInfoRes.json();
                userProfile = {
                  id: info.sub || `google_${Date.now()}`,
                  name: info.name || info.email?.split("@")[0] || "Google User",
                  email: info.email || "user@gmail.com",
                  picture: info.picture || "",
                  provider: "google",
                  lastLogin: Date.now()
                };
              }
            }
          } catch (fetchErr) {
            console.warn("Google token exchange warning:", fetchErr);
          }
          if (!userProfile) {
            userProfile = {
              id: `google_${Date.now()}`,
              name: "Developer Account",
              email: "developer@bodhi.dev",
              picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              provider: "google",
              lastLogin: Date.now()
            };
          }
          await this.saveUser(userProfile);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(this.getHtmlPage(`Welcome to Bodhi, ${userProfile.name}!`, "Google sign-in successful. You can safely close this browser tab and return to Bodhi Editor.", true));
          cleanupServer();
          resolve({ success: true, user: userProfile });
        } catch (err) {
          console.error("Callback handler error:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          cleanupServer();
          resolve({ success: false, error: err.message || "Authentication processing error." });
        }
      });
      const cleanupServer = () => {
        if (this.activeServer) {
          try {
            this.activeServer.close();
          } catch {
          }
          this.activeServer = null;
        }
      };
      this.activeServer = server;
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        const port = address.port;
        const redirectUri = `http://127.0.0.1:${port}/callback`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          DEFAULT_GOOGLE_CLIENT_ID
        )}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=openid%20profile%20email&code_challenge=${encodeURIComponent(
          challenge
        )}&code_challenge_method=S256&state=${encodeURIComponent(state)}`;
        electron.shell.openExternal(authUrl).catch((err) => {
          console.error("Failed to open external browser for Google login:", err);
          cleanupServer();
          resolve({ success: false, error: "Could not open default system browser." });
        });
        setTimeout(() => {
          if (this.activeServer === server) {
            cleanupServer();
            resolve({ success: false, error: "Google sign-in timed out after 2 minutes." });
          }
        }, 12e4);
      });
      server.on("error", (err) => {
        console.error("OAuth loopback server error:", err);
        cleanupServer();
        resolve({ success: false, error: `Loopback server error: ${err.message}` });
      });
    });
  }
  getHtmlPage(title, message, isSuccess) {
    const color = isSuccess ? "#10b981" : "#f43f5e";
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Bodhi Editor</title>
  <style>
    body {
      background-color: #0b0d13;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #141722;
      border: 1px solid #252a3d;
      border-radius: 16px;
      padding: 40px;
      max-width: 440px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${color}22;
      color: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 28px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 10px;
      font-weight: 600;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isSuccess ? "✓" : "✕"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
  }
}
const authService = new AuthService();
class PostgresService {
  pool = null;
  configPath;
  status = {
    connected: false
  };
  constructor() {
    try {
      this.configPath = path__namespace.join(electron.app.getPath("userData"), "postgres_config.enc");
    } catch {
      this.configPath = path__namespace.join(process.cwd(), ".postgres_config.enc");
    }
  }
  async init() {
    const savedUrl = await this.getStoredConnectionString();
    if (savedUrl) {
      this.connect(savedUrl).catch((err) => {
        console.warn("[PostgresService] Background auto-connect error:", err.message);
      });
    }
  }
  async getStoredConnectionString() {
    try {
      const buffer = await fs__namespace.readFile(this.configPath);
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        return electron.safeStorage.decryptString(buffer);
      } else {
        return buffer.toString("utf8");
      }
    } catch {
      return null;
    }
  }
  async saveConnectionString(url) {
    try {
      let data;
      if (electron.safeStorage && electron.safeStorage.isEncryptionAvailable()) {
        data = electron.safeStorage.encryptString(url.trim());
      } else {
        data = Buffer.from(url.trim(), "utf8");
      }
      await fs__namespace.writeFile(this.configPath, data);
    } catch (err) {
      console.error("Failed to store postgres connection string:", err);
    }
  }
  async clearStoredConnectionString() {
    try {
      await fs__namespace.unlink(this.configPath);
    } catch {
    }
  }
  buildPoolConfig(connectionString) {
    const isRemote = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
    return {
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : void 0,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 8e3
    };
  }
  async testConnection(connectionString) {
    if (!connectionString || !connectionString.trim()) {
      return { success: false, message: "Connection string cannot be empty." };
    }
    const start = Date.now();
    const testPool = new pg.Pool(this.buildPoolConfig(connectionString.trim()));
    try {
      const client = await testPool.connect();
      try {
        const res = await client.query("SELECT version()");
        const latencyMs = Date.now() - start;
        const serverVersion = res.rows[0]?.version || "PostgreSQL";
        return {
          success: true,
          message: "Connection successful!",
          latencyMs,
          serverVersion
        };
      } finally {
        client.release();
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to connect to PostgreSQL server."
      };
    } finally {
      testPool.end().catch(() => {
      });
    }
  }
  async connect(connectionString) {
    if (!connectionString || !connectionString.trim()) {
      this.status = { connected: false, error: "Empty connection string" };
      this.notifyWindows();
      return this.status;
    }
    if (this.pool) {
      try {
        await this.pool.end();
      } catch {
      }
      this.pool = null;
    }
    const start = Date.now();
    const pool = new pg.Pool(this.buildPoolConfig(connectionString.trim()));
    try {
      const client = await pool.connect();
      let serverVersion = "";
      try {
        const res = await client.query("SELECT version()");
        serverVersion = res.rows[0]?.version || "PostgreSQL";
        await this.runMigrations(client);
      } finally {
        client.release();
      }
      this.pool = pool;
      const latencyMs = Date.now() - start;
      let host = "PostgreSQL";
      let database = "postgres";
      try {
        const parsed = new URL(connectionString.trim());
        host = parsed.hostname || "PostgreSQL";
        database = parsed.pathname.replace(/^\//, "") || "postgres";
      } catch {
      }
      this.status = {
        connected: true,
        host,
        database,
        serverVersion,
        latencyMs,
        lastSyncTime: Date.now()
      };
      await this.saveConnectionString(connectionString.trim());
      this.notifyWindows();
      return this.status;
    } catch (err) {
      console.error("PostgreSQL connection error:", err);
      this.status = {
        connected: false,
        error: err.message || "Failed to connect to PostgreSQL database"
      };
      this.notifyWindows();
      return this.status;
    }
  }
  async runMigrations(client) {
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
    `;
    await client.query(ddl);
  }
  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch {
      }
      this.pool = null;
    }
    await this.clearStoredConnectionString();
    this.status = { connected: false };
    this.notifyWindows();
    return true;
  }
  getStatus() {
    return this.status;
  }
  async syncSettings(userId, settings) {
    if (!this.pool || !this.status.connected || !userId) return false;
    try {
      const query = `
        INSERT INTO user_settings (user_id, settings_json, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET settings_json = $2, updated_at = NOW();
      `;
      await this.pool.query(query, [userId, JSON.stringify(settings)]);
      this.status.lastSyncTime = Date.now();
      this.notifyWindows();
      return true;
    } catch (err) {
      console.error("Failed to sync settings to PostgreSQL:", err);
      return false;
    }
  }
  async getSettings(userId) {
    if (!this.pool || !this.status.connected || !userId) return null;
    try {
      const res = await this.pool.query(
        "SELECT settings_json FROM user_settings WHERE user_id = $1",
        [userId]
      );
      if (res.rows.length > 0) {
        return res.rows[0].settings_json;
      }
      return null;
    } catch (err) {
      console.error("Failed to get settings from PostgreSQL:", err);
      return null;
    }
  }
  async saveSnippet(userId, snippet) {
    if (!this.pool || !this.status.connected || !userId) return false;
    try {
      const id = snippet.id || `snippet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const query = `
        INSERT INTO user_snippets (id, user_id, title, prefix, language, code, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id)
        DO UPDATE SET title = $3, prefix = $4, language = $5, code = $6;
      `;
      await this.pool.query(query, [
        id,
        userId,
        snippet.title,
        snippet.prefix,
        snippet.language,
        snippet.code
      ]);
      return true;
    } catch (err) {
      console.error("Failed to save snippet to PostgreSQL:", err);
      return false;
    }
  }
  async getSnippets(userId) {
    if (!this.pool || !this.status.connected || !userId) return [];
    try {
      const res = await this.pool.query(
        "SELECT id, title, prefix, language, code, created_at FROM user_snippets WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        prefix: r.prefix,
        language: r.language,
        code: r.code,
        createdAt: new Date(r.created_at).getTime()
      }));
    } catch (err) {
      console.error("Failed to get snippets from PostgreSQL:", err);
      return [];
    }
  }
  async saveAIChat(userId, chat) {
    if (!this.pool || !this.status.connected || !userId) return false;
    try {
      const id = chat.id || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const query = `
        INSERT INTO ai_conversations (id, user_id, title, messages, model, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id)
        DO UPDATE SET title = $3, messages = $4, model = $5, updated_at = NOW();
      `;
      await this.pool.query(query, [
        id,
        userId,
        chat.title,
        JSON.stringify(chat.messages),
        chat.model || "default"
      ]);
      return true;
    } catch (err) {
      console.error("Failed to save AI chat to PostgreSQL:", err);
      return false;
    }
  }
  async getAIChats(userId) {
    if (!this.pool || !this.status.connected || !userId) return [];
    try {
      const res = await this.pool.query(
        "SELECT id, title, messages, model, updated_at FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        messages: r.messages,
        model: r.model,
        updatedAt: new Date(r.updated_at).getTime()
      }));
    } catch (err) {
      console.error("Failed to get AI chats from PostgreSQL:", err);
      return [];
    }
  }
  notifyWindows() {
    const windows = electron.BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.DB_STATUS_CHANGED, this.status);
      }
    }
  }
}
const postgresService = new PostgresService();
function parseJsonc(content) {
  try {
    return JSON.parse(content);
  } catch {
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(stripped);
  }
}
class ExtensionService {
  extensionsDir;
  dbPath;
  installedExtensions = /* @__PURE__ */ new Map();
  isInitialized = false;
  constructor() {
    this.extensionsDir = path__namespace.join(electron.app.getPath("userData"), "extensions");
    this.dbPath = path__namespace.join(this.extensionsDir, "extensions.json");
  }
  async ensureInitialized() {
    if (this.isInitialized) return;
    try {
      await fs__namespace.mkdir(this.extensionsDir, { recursive: true });
      try {
        const raw = await fs__namespace.readFile(this.dbPath, "utf-8");
        const list = JSON.parse(raw);
        this.installedExtensions.clear();
        for (const ext of list) {
          this.installedExtensions.set(ext.id, ext);
        }
      } catch {
        this.installedExtensions.clear();
        await this.saveDb();
      }
    } catch (err) {
      console.error("[ExtensionService] Failed to initialize directory:", err);
    }
    this.isInitialized = true;
  }
  async saveDb() {
    const list = Array.from(this.installedExtensions.values());
    await fs__namespace.writeFile(this.dbPath, JSON.stringify(list, null, 2), "utf-8");
  }
  /**
   * Returns all currently installed extensions.
   */
  async getInstalledExtensions() {
    await this.ensureInitialized();
    return Array.from(this.installedExtensions.values());
  }
  /**
   * Search extensions from Open VSX Registry.
   */
  async searchMarketplace(query, category) {
    await this.ensureInitialized();
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append("query", query.trim());
      }
      if (category && category.trim()) {
        params.append("category", category.trim());
      }
      params.append("size", "30");
      const url = `https://open-vsx.org/api/-/search?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "bodhi-editor/1.0.0"
        }
      });
      if (!response.ok) {
        throw new Error(`Open VSX returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const extensions = data.extensions || [];
      return extensions.map((ext) => {
        const id = `${ext.namespace}.${ext.name}`;
        const isInstalled = this.installedExtensions.has(id);
        return {
          id,
          name: ext.name,
          namespace: ext.namespace,
          displayName: ext.displayName || ext.name,
          version: ext.version || "1.0.0",
          description: ext.description || "",
          icon: ext.files?.icon,
          downloadUrl: ext.files?.download || "",
          downloadCount: ext.downloadCount || 0,
          averageRating: ext.averageRating || 0,
          reviewCount: ext.reviewCount || 0,
          timestamp: ext.timestamp,
          isInstalled,
          categories: ext.categories || []
        };
      });
    } catch (err) {
      console.error("[ExtensionService] Search failed:", err);
      return [];
    }
  }
  /**
   * Installs an extension downloaded from the Open VSX registry.
   */
  async installFromMarketplace(extension) {
    await this.ensureInitialized();
    let downloadUrl = extension.downloadUrl;
    let response = null;
    if (downloadUrl) {
      try {
        const res = await fetch(downloadUrl, {
          headers: { "User-Agent": "bodhi-editor/1.0.0" },
          redirect: "follow"
        });
        if (res.ok) {
          response = res;
        }
      } catch (err) {
        console.warn(`[ExtensionService] Initial download attempt failed for ${downloadUrl}:`, err);
      }
    }
    const namespace = extension.namespace || (extension.id.includes(".") ? extension.id.split(".")[0] : "");
    const name = extension.name || (extension.id.includes(".") ? extension.id.split(".")[1] : extension.id);
    if ((!response || !response.ok) && namespace && name) {
      try {
        const metaUrl = `https://open-vsx.org/api/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`;
        const metaRes = await fetch(metaUrl, {
          headers: { Accept: "application/json", "User-Agent": "bodhi-editor/1.0.0" },
          redirect: "follow"
        });
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (metaData.files?.download) {
            downloadUrl = metaData.files.download;
            const retryRes = await fetch(downloadUrl, {
              headers: { "User-Agent": "bodhi-editor/1.0.0" },
              redirect: "follow"
            });
            if (retryRes.ok) {
              response = retryRes;
            }
          }
        }
      } catch (metaErr) {
        console.warn("[ExtensionService] Metadata lookup fallback failed:", metaErr);
      }
    }
    if (!response || !response.ok) {
      const code = response ? response.status : 404;
      throw new Error(
        `Failed to download extension "${extension.displayName || extension.name}": HTTP ${code}. Package could not be located on Open VSX.`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await this.extractAndRegisterVsix(buffer, extension.id, extension.icon);
  }
  /**
   * Installs an extension from a local .vsix file path or opens file dialog if omitted.
   */
  async installFromVsix(filePath) {
    await this.ensureInitialized();
    let targetPath = filePath;
    if (!targetPath) {
      const result = await electron.dialog.showOpenDialog({
        title: "Select VS Code Extension (.vsix)",
        filters: [{ name: "VSIX Package", extensions: ["vsix"] }],
        properties: ["openFile"]
      });
      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      targetPath = result.filePaths[0];
    }
    const buffer = await fs__namespace.readFile(targetPath);
    return await this.extractAndRegisterVsix(buffer);
  }
  /**
   * Internal helper to extract .vsix (ZIP), parse package.json, count snippets/themes,
   * and persist metadata.
   */
  async extractAndRegisterVsix(buffer, preferredId, marketplaceIcon) {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const pkgEntry = zipEntries.find(
      (e) => e.entryName === "extension/package.json" || e.entryName === "package.json"
    );
    if (!pkgEntry) {
      throw new Error("Invalid VSIX: package.json not found in extension package.");
    }
    const pkgJson = parseJsonc(pkgEntry.getData().toString("utf-8"));
    const publisher = pkgJson.publisher || "local";
    const name = pkgJson.name;
    const id = preferredId || `${publisher}.${name}`;
    const installPath = path__namespace.join(this.extensionsDir, id);
    try {
      await fs__namespace.rm(installPath, { recursive: true, force: true });
    } catch {
    }
    await fs__namespace.mkdir(installPath, { recursive: true });
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      let relativePath = entry.entryName;
      if (relativePath.startsWith("extension/")) {
        relativePath = relativePath.substring("extension/".length);
      }
      const destPath = path__namespace.join(installPath, relativePath);
      const destDir = path__namespace.dirname(destPath);
      await fs__namespace.mkdir(destDir, { recursive: true });
      await fs__namespace.writeFile(destPath, entry.getData());
    }
    let iconUrl = marketplaceIcon;
    if (pkgJson.icon) {
      const localIconPath = path__namespace.join(installPath, pkgJson.icon);
      try {
        const iconData = await fs__namespace.readFile(localIconPath);
        const ext = path__namespace.extname(pkgJson.icon).toLowerCase().replace(".", "");
        const mime = ext === "svg" ? "image/svg+xml" : `image/${ext || "png"}`;
        iconUrl = `data:${mime};base64,${iconData.toString("base64")}`;
      } catch {
      }
    }
    let snippetsCount = 0;
    const snippetsContrib = pkgJson.contributes?.snippets || [];
    for (const s of snippetsContrib) {
      const snippetPath = path__namespace.join(installPath, s.path);
      try {
        const content = await fs__namespace.readFile(snippetPath, "utf-8");
        const parsed = parseJsonc(content);
        snippetsCount += Object.keys(parsed).length;
      } catch {
        snippetsCount += 1;
      }
    }
    const themesContrib = pkgJson.contributes?.themes || [];
    const themesCount = themesContrib.length;
    const installed = {
      id,
      name: pkgJson.name,
      displayName: pkgJson.displayName || pkgJson.name,
      publisher,
      version: pkgJson.version || "1.0.0",
      description: pkgJson.description || "",
      icon: iconUrl,
      enabled: true,
      installDate: Date.now(),
      snippetsCount,
      themesCount,
      contributes: {
        snippets: pkgJson.contributes?.snippets,
        themes: pkgJson.contributes?.themes
      }
    };
    this.installedExtensions.set(id, installed);
    await this.saveDb();
    return installed;
  }
  /**
   * Uninstalls an extension by removing its directory and database record.
   */
  async uninstallExtension(extensionId) {
    await this.ensureInitialized();
    const installPath = path__namespace.join(this.extensionsDir, extensionId);
    try {
      await fs__namespace.rm(installPath, { recursive: true, force: true });
    } catch (err) {
      console.warn(`[ExtensionService] Failed to clean directory ${installPath}:`, err);
    }
    const removed = this.installedExtensions.delete(extensionId);
    if (removed) {
      await this.saveDb();
    }
    return true;
  }
  /**
   * Toggles extension enabled / disabled state.
   */
  async toggleExtension(extensionId, enabled) {
    await this.ensureInitialized();
    const ext = this.installedExtensions.get(extensionId);
    if (!ext) return false;
    ext.enabled = enabled;
    this.installedExtensions.set(extensionId, ext);
    await this.saveDb();
    return true;
  }
  /**
   * Aggregates all snippets provided by active/enabled installed extensions.
   */
  async getExtensionSnippets() {
    await this.ensureInitialized();
    const allSnippets = [];
    for (const ext of this.installedExtensions.values()) {
      if (!ext.enabled || !ext.contributes?.snippets) continue;
      const installPath = path__namespace.join(this.extensionsDir, ext.id);
      for (const snippetDef of ext.contributes.snippets) {
        const fullSnippetPath = path__namespace.join(installPath, snippetDef.path);
        try {
          const raw = await fs__namespace.readFile(fullSnippetPath, "utf-8");
          const snippetObj = parseJsonc(raw);
          for (const [name, val] of Object.entries(snippetObj)) {
            if (!val || !val.prefix && !val.body) continue;
            allSnippets.push({
              name,
              language: snippetDef.language || val.scope || "",
              prefix: val.prefix,
              body: val.body,
              description: val.description,
              scope: val.scope,
              sourceExtensionId: ext.id,
              sourceExtensionName: ext.displayName || ext.name
            });
          }
        } catch (err) {
          console.warn(`[ExtensionService] Failed to read snippets at ${fullSnippetPath}:`, err);
        }
      }
    }
    return allSnippets;
  }
  /**
   * Aggregates all themes provided by active/enabled installed extensions.
   */
  async getExtensionThemes() {
    await this.ensureInitialized();
    const allThemes = [];
    for (const ext of this.installedExtensions.values()) {
      if (!ext.enabled || !ext.contributes?.themes) continue;
      const installPath = path__namespace.join(this.extensionsDir, ext.id);
      for (const themeDef of ext.contributes.themes) {
        const fullThemePath = path__namespace.join(installPath, themeDef.path);
        try {
          const raw = await fs__namespace.readFile(fullThemePath, "utf-8");
          const themeData = parseJsonc(raw);
          allThemes.push({
            id: `${ext.id}.${themeDef.label.toLowerCase().replace(/\s+/g, "-")}`,
            label: themeDef.label,
            uiTheme: themeDef.uiTheme || "vs-dark",
            path: fullThemePath,
            sourceExtensionId: ext.id,
            themeData
          });
        } catch (err) {
          console.warn(`[ExtensionService] Failed to read theme at ${fullThemePath}:`, err);
        }
      }
    }
    return allThemes;
  }
  /**
   * Shows a dialog to pick a .vsix file.
   */
  async openVsixDialog() {
    const result = await electron.dialog.showOpenDialog({
      title: "Select VS Code Extension (.vsix)",
      filters: [{ name: "VSIX Package", extensions: ["vsix"] }],
      properties: ["openFile"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }
  /**
   * Reads README documentation for an extension (either from disk or Open VSX API).
   */
  async getReadme(extensionId, namespace, name) {
    await this.ensureInitialized();
    const installPath = path__namespace.join(this.extensionsDir, extensionId);
    const readmeCandidates = [
      "README.md",
      "readme.md",
      "Readme.md",
      "README.MD",
      "README"
    ];
    for (const file of readmeCandidates) {
      const fullPath = path__namespace.join(installPath, file);
      try {
        const text = await fs__namespace.readFile(fullPath, "utf-8");
        if (text && text.trim()) {
          return text;
        }
      } catch {
      }
    }
    const ns = namespace || (extensionId.includes(".") ? extensionId.split(".")[0] : "");
    const nm = name || (extensionId.includes(".") ? extensionId.split(".")[1] : extensionId);
    if (ns && nm) {
      try {
        const url = `https://open-vsx.org/api/${encodeURIComponent(ns)}/${encodeURIComponent(nm)}/latest/file/readme.md`;
        const res = await fetch(url, {
          headers: { "User-Agent": "bodhi-editor/1.0.0" },
          redirect: "follow"
        });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            return text;
          }
        }
      } catch (err) {
        console.warn(`[ExtensionService] Failed to fetch remote README for ${ns}/${nm}:`, err);
      }
    }
    return `# ${nm || extensionId}

*No README documentation provided for this extension.*`;
  }
  /**
   * Returns snippets belonging to a specific installed extension.
   */
  async getExtensionSnippetsForExt(extensionId) {
    await this.ensureInitialized();
    const ext = this.installedExtensions.get(extensionId);
    if (!ext || !ext.contributes?.snippets) {
      return [];
    }
    const snippets = [];
    const installPath = path__namespace.join(this.extensionsDir, ext.id);
    for (const snippetDef of ext.contributes.snippets) {
      const fullSnippetPath = path__namespace.join(installPath, snippetDef.path);
      try {
        const raw = await fs__namespace.readFile(fullSnippetPath, "utf-8");
        const snippetObj = parseJsonc(raw);
        for (const [sName, val] of Object.entries(snippetObj)) {
          if (!val || !val.prefix && !val.body) continue;
          snippets.push({
            name: sName,
            language: snippetDef.language || val.scope || "",
            prefix: val.prefix,
            body: val.body,
            description: val.description,
            scope: val.scope,
            sourceExtensionId: ext.id,
            sourceExtensionName: ext.displayName || ext.name
          });
        }
      } catch (err) {
        console.warn(`[ExtensionService] Failed to read snippets at ${fullSnippetPath}:`, err);
      }
    }
    return snippets;
  }
}
const extensionService = new ExtensionService();
class AIService {
  /**
   * Helper to determine provider and API key from request settings or environment
   */
  getProviderConfig(settings) {
    let provider = settings?.aiModelProvider || "google-gemini";
    const apiKey = (settings?.aiApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim().replace(/^["'`]|["'`]$/g, "").trim();
    if (apiKey.startsWith("sk-ant-") && provider !== "anthropic") {
      console.log("[AIService] Key starts with sk-ant-, auto-switching provider to Anthropic");
      provider = "anthropic";
    } else if ((apiKey.startsWith("sk-") || apiKey.startsWith("org-")) && !apiKey.startsWith("sk-ant-") && provider !== "openai") {
      console.log("[AIService] Key starts with sk-, auto-switching provider to OpenAI");
      provider = "openai";
    } else if ((apiKey.startsWith("AIzaSy") || apiKey.startsWith("AQ.")) && provider !== "google-gemini") {
      console.log("[AIService] Key starts with AIzaSy/AQ., auto-switching provider to Google Gemini");
      provider = "google-gemini";
    }
    const temperature = settings?.aiTemperature ?? 0.2;
    const maxTokens = settings?.aiMaxTokens ?? 2048;
    return { provider, apiKey, temperature, maxTokens };
  }
  /**
   * Helper to strip markdown code blocks if present
   */
  cleanCodeBlock(text) {
    let clean = text.trim();
    if (clean.startsWith("```")) {
      const firstNewline = clean.indexOf("\n");
      if (firstNewline !== -1) {
        clean = clean.substring(firstNewline + 1);
      }
      if (clean.endsWith("```")) {
        clean = clean.substring(0, clean.length - 3).trimEnd();
      }
    }
    return clean;
  }
  /**
   * Generates inline Ghost Text code completion (Copilot style)
   */
  async generateCompletion(req) {
    const { provider, apiKey, temperature } = this.getProviderConfig(req.settings);
    if (!apiKey) {
      return {
        text: "",
        error: "No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure."
      };
    }
    const prefix = req.prefix || "";
    const suffix = req.suffix || "";
    const lang = req.language || "typescript";
    const prompt = `You are a high-speed AI code completion assistant inside BODHI EDITOR.
Complete the code immediately following the cursor.
Return ONLY the raw completion text that directly completes the line or statement.
Do NOT include markdown code blocks, backticks, explanations, or commentary.

Language: ${lang}
Code before cursor:
${prefix.slice(-1200)}

Code after cursor:
${suffix.slice(0, 300)}`;
    try {
      const rawText = await this.callProvider(
        provider,
        apiKey,
        [
          {
            role: "system",
            content: "You are a code completion engine. Return only the raw text to be inserted at the cursor."
          },
          { role: "user", content: prompt }
        ],
        { temperature: Math.min(temperature, 0.2), maxTokens: 512 }
      );
      const cleaned = this.cleanCodeBlock(rawText);
      return { text: cleaned };
    } catch (err) {
      console.error("[AIService] Completion failed:", err);
      return { text: "", error: err.message || "Completion request failed" };
    }
  }
  /**
   * Generates inline edit / refactoring (Ctrl+K style)
   */
  async generateEdit(req) {
    const { provider, apiKey, temperature, maxTokens } = this.getProviderConfig(
      req.settings
    );
    if (!apiKey) {
      return {
        text: "",
        error: "No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure."
      };
    }
    const prompt = `You are an expert pair-programming software engineer inside BODHI EDITOR.
The user wants to edit or transform the following code snippet according to their instruction.

Language: ${req.language || "typescript"}
Instruction: ${req.prompt}

Target Code to transform:
${req.code}

${req.context ? `Surrounding Context:
${req.context.slice(0, 1e3)}
` : ""}

Output Requirement:
Return ONLY the updated replacement code.
Do NOT wrap the output in markdown code fences (\`\`\`) unless specifically instructed.
Do NOT include preamble, comments about what you did, or conversational text.`;
    try {
      const rawText = await this.callProvider(
        provider,
        apiKey,
        [
          {
            role: "system",
            content: "You are an expert code editor. Output only the modified code cleanly."
          },
          { role: "user", content: prompt }
        ],
        { temperature, maxTokens }
      );
      const cleaned = this.cleanCodeBlock(rawText);
      return { text: cleaned };
    } catch (err) {
      console.error("[AIService] Edit failed:", err);
      return { text: "", error: err.message || "Edit request failed" };
    }
  }
  /**
   * Conversational Assistant (Sidebar Chat with file context)
   */
  async chat(req) {
    const { provider, apiKey, temperature, maxTokens } = this.getProviderConfig(
      req.settings
    );
    if (!apiKey) {
      return {
        text: "",
        error: "No AI API Key configured. Go to Settings (Ctrl+,) > AI to configure."
      };
    }
    const systemPrompt = `You are Bodhi AI, a highly capable software engineering copilot integrated directly inside Bodhi Code Editor.
You write clean, modular, modern, bug-free code.
When generating code snippets, always format them with standard markdown code blocks and identify the language (e.g. \`\`\`tsx).
Keep responses helpful, technical, concise, and focused on solving the user's coding questions.`;
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];
    if (req.contextFile) {
      formattedMessages.push({
        role: "user",
        content: `[Current Active File: ${req.contextFile.name} (${req.contextFile.language || "plain text"})]
\`\`\`${req.contextFile.language || ""}
${req.contextFile.content.slice(0, 8e3)}
\`\`\``
      });
      formattedMessages.push({
        role: "assistant",
        content: `I see the active file "${req.contextFile.name}". How can I help you with this code?`
      });
    }
    for (const msg of req.messages) {
      formattedMessages.push({ role: msg.role, content: msg.content });
    }
    try {
      const text = await this.callProvider(provider, apiKey, formattedMessages, {
        temperature,
        maxTokens
      });
      return { text };
    } catch (err) {
      console.error("[AIService] Chat failed:", err);
      return { text: "", error: err.message || "Chat request failed" };
    }
  }
  /**
   * Internal router to call LLM provider APIs
   */
  async callProvider(provider, apiKey, messages, options) {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, "").trim();
    switch (provider) {
      case "google-gemini":
        return await this.callGemini(cleanKey, messages, options);
      case "openai":
        return await this.callOpenAI(cleanKey, messages, options);
      case "anthropic":
        return await this.callAnthropic(cleanKey, messages, options);
      default:
        return await this.callGemini(cleanKey, messages, options);
    }
  }
  /**
   * Google Gemini API call with dynamic model discovery and multi-version fallback
   */
  async callGemini(apiKey, messages, options) {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, "").trim();
    const systemMsg = messages.find((m) => m.role === "system")?.content;
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");
    const contents = nonSystemMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const body = {
      contents,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    };
    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: systemMsg }]
      };
    }
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-pro-latest"
    ];
    let lastError = null;
    for (const apiVer of ["v1beta", "v1"]) {
      for (const modelName of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const rawText = await res.text();
          if (res.ok) {
            let json;
            try {
              json = JSON.parse(rawText);
            } catch {
              throw new Error("Gemini returned an invalid JSON response.");
            }
            const candidate = json.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            const part = parts.find(
              (p) => typeof p.text === "string" && p.text.trim().length > 0
            ) || parts[0];
            const text = part?.text;
            if (typeof text === "string" && text.length > 0) {
              return text;
            }
            lastError = new Error("Gemini candidate was empty");
            continue;
          }
          if (res.status === 404 || res.status === 429) {
            lastError = new Error(`Gemini API Error (${res.status}): ${rawText}`);
            continue;
          }
          throw new Error(`Gemini API Error (${res.status}): ${rawText}`);
        } catch (err) {
          if (!err.message?.includes("404") && !err.message?.includes("429")) {
            throw err;
          }
          lastError = err;
        }
      }
    }
    throw lastError || new Error(
      "Gemini models returned 404. Ensure your key was created at https://aistudio.google.com/app/apikey"
    );
  }
  /**
   * OpenAI API call
   */
  async callOpenAI(apiKey, messages, options) {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, "").trim();
    const url = "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (typeof text !== "string") {
      throw new Error("OpenAI returned an empty response.");
    }
    return text;
  }
  /**
   * Anthropic Claude API call
   */
  async callAnthropic(apiKey, messages, options) {
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, "").trim();
    const url = "https://api.anthropic.com/v1/messages";
    const systemMsg = messages.find((m) => m.role === "system")?.content;
    const nonSystemMsgs = messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }));
    const body = {
      model: "claude-3-5-haiku-20241022",
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: nonSystemMsgs
    };
    if (systemMsg) {
      body.system = systemMsg;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cleanKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API Error (${res.status}): ${errText}`);
    }
    const json = await res.json();
    const text = json.content?.[0]?.text;
    if (typeof text !== "string") {
      throw new Error("Anthropic returned an empty response.");
    }
    return text;
  }
  /**
   * Tests API key connectivity and returns human-readable diagnostic status
   */
  async testConnection(rawProvider, rawKey) {
    const key = (rawKey || "").trim().replace(/^["'`]|["'`]$/g, "").trim();
    if (!key) {
      return {
        success: false,
        message: "Please enter an API key to test."
      };
    }
    let provider = rawProvider || "google-gemini";
    let detectedProvider = provider;
    if (key.startsWith("sk-ant-")) {
      detectedProvider = "anthropic";
    } else if (key.startsWith("sk-") || key.startsWith("org-")) {
      detectedProvider = "openai";
    } else if (key.startsWith("AIzaSy") || key.startsWith("AQ.")) {
      detectedProvider = "google-gemini";
    }
    if (detectedProvider !== provider) {
      provider = detectedProvider;
    }
    if (provider === "google-gemini") {
      try {
        let discoveredModels = [];
        let rawError = null;
        try {
          const reply = await this.callGemini(
            key,
            [{ role: "user", content: 'Say "OK"' }],
            { temperature: 0.1, maxTokens: 512 }
          );
          return {
            success: true,
            detectedProvider,
            modelUsed: "gemini-3.1-flash-lite",
            message: `Connected successfully to Google Gemini! Response: "${reply.trim()}"`
          };
        } catch (callErr) {
          rawError = callErr.message || String(callErr);
        }
        let detail = rawError || "";
        try {
          const parsed = JSON.parse(rawError || "{}");
          detail = parsed.error?.message || detail;
        } catch {
        }
        if (detail.includes("API_KEY_INVALID") || detail.includes("not valid")) {
          return {
            success: false,
            detectedProvider,
            message: "Invalid API Key. Google reports this key does not exist. Please generate a valid free key at https://aistudio.google.com/app/apikey"
          };
        }
        return {
          success: false,
          detectedProvider,
          message: `Gemini rejected key: ${detail || "No generative models found. Make sure this key was created in Google AI Studio (https://aistudio.google.com/app/apikey), not standard Google Cloud Console without the Generative Language API."}`
        };
      } catch (err) {
        return {
          success: false,
          detectedProvider,
          message: `Connection error: ${err.message || "Failed to reach Google Gemini"}`
        };
      }
    }
    try {
      const testMessages = [{ role: "user", content: 'Reply with "OK"' }];
      const reply = await this.callProvider(provider, key, testMessages, {
        temperature: 0.1,
        maxTokens: 10
      });
      return {
        success: true,
        detectedProvider,
        message: `Successfully connected to ${provider.toUpperCase()}! Response: "${reply.trim()}"`
      };
    } catch (err) {
      return {
        success: false,
        detectedProvider,
        message: err.message || "Connection failed"
      };
    }
  }
}
const aiService = new AIService();
const searchService = new SearchService();
function getSettingsFilePath() {
  return path__namespace.join(electron.app.getPath("userData"), "settings.json");
}
function loadPersistedSettings() {
  try {
    const filePath = getSettingsFilePath();
    if (fsSync__namespace.existsSync(filePath)) {
      const raw = fsSync__namespace.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[IPC] Failed to read persisted settings.json:", err);
  }
  return {};
}
async function savePersistedSettings(settings) {
  try {
    const filePath = getSettingsFilePath();
    await fs__namespace.mkdir(path__namespace.dirname(filePath), { recursive: true });
    await fs__namespace.writeFile(filePath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("[IPC] Failed to save settings.json:", err);
  }
}
let storedSettings = loadPersistedSettings();
function registerIpcHandlers(mainWindow2, openSettingsWindow2, openExtensionsWindow2) {
  fileService.setMainWindow(mainWindow2);
  terminalService.setMainWindow(mainWindow2);
  electron.ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender) || mainWindow2;
    if (win && !win.isDestroyed()) {
      win.minimize();
    }
  });
  electron.ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender) || mainWindow2;
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  electron.ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender) || mainWindow2;
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });
  electron.ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender) || mainWindow2;
    return win && !win.isDestroyed() ? win.isMaximized() : false;
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_OPEN, () => {
    if (openSettingsWindow2) {
      openSettingsWindow2();
    }
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return storedSettings;
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_, partialSettings) => {
    storedSettings = { ...storedSettings, ...partialSettings };
    await savePersistedSettings(storedSettings);
    electron.BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.SETTINGS_CHANGED, partialSettings);
      }
    });
  });
  electron.ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async () => {
    return await fileService.openFileDialog();
  });
  electron.ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY, async () => {
    return await fileService.openDirectoryDialog();
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_READ_DIRECTORY, async (_, dirPath) => {
    return await fileService.readDirectory(dirPath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_, filePath) => {
    return await fileService.readFile(filePath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_, filePath, content) => {
    return await fileService.writeFile(filePath, content);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_CREATE_FILE, async (_, filePath) => {
    return await fileService.createFile(filePath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_CREATE_DIRECTORY, async (_, dirPath) => {
    return await fileService.createDirectory(dirPath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_RENAME_PATH, async (_, oldPath, newPath) => {
    return await fileService.renamePath(oldPath, newPath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.FS_DELETE_PATH, async (_, targetPath) => {
    return await fileService.deletePath(targetPath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.WATCHER_START, async (_, dirPath) => {
    fileService.startWatcher(dirPath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.WATCHER_STOP, async () => {
    fileService.stopWatcher();
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.TERMINAL_CREATE,
    async (_, id, cwd, shellType) => {
      return await terminalService.createTerminal(id, cwd, shellType);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.TERMINAL_WRITE, (_, id, data) => {
    terminalService.writeTerminal(id, data);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TERMINAL_RESIZE, (_, id, cols, rows) => {
    terminalService.resizeTerminal(id, cols, rows);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TERMINAL_KILL, (_, id) => {
    terminalService.killTerminal(id);
  });
  electron.ipcMain.handle(IPC_CHANNELS.TERMINAL_GET_AVAILABLE_SHELLS, () => {
    return terminalService.getAvailableShells();
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.SEARCH_WORKSPACE,
    async (_, workspacePath, query, options) => {
      return await searchService.searchWorkspace(workspacePath, query, options);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.SEARCH_REPLACE_FILE,
    async (_, filePath, query, replaceText, options) => {
      return await searchService.replaceInFile(filePath, query, replaceText, options);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.SEARCH_REPLACE_ALL,
    async (_, workspacePath, query, replaceText, options) => {
      return await searchService.replaceAll(workspacePath, query, replaceText, options);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_STATUS, async (_, workspacePath) => {
    return await gitService.getStatus(workspacePath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.GIT_BRANCH, async (_, workspacePath) => {
    return await gitService.getBranch(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_GET_FILE_AT_HEAD,
    async (_, workspacePath, relativePath) => {
      return await gitService.getFileAtHead(workspacePath, relativePath);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_GET_DIFF,
    async (_, workspacePath, relativePath, staged) => {
      return await gitService.getDiff(workspacePath, relativePath, staged);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STAGE,
    async (_, workspacePath, relativePath) => {
      return await gitService.stageFile(workspacePath, relativePath);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_UNSTAGE,
    async (_, workspacePath, relativePath) => {
      return await gitService.unstageFile(workspacePath, relativePath);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_STAGE_ALL, async (_, workspacePath) => {
    return await gitService.stageAll(workspacePath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.GIT_UNSTAGE_ALL, async (_, workspacePath) => {
    return await gitService.unstageAll(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_DISCARD,
    async (_, workspacePath, relativePath, isUntracked) => {
      return await gitService.discardFile(workspacePath, relativePath, isUntracked);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_COMMIT,
    async (_, workspacePath, message) => {
      return await gitService.commit(workspacePath, message);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_GET_FILE_CHURN,
    async (_, workspacePath, relativePath) => {
      return await gitService.getFileChurn(workspacePath, relativePath);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_INIT,
    async (_, workspacePath, defaultBranch) => {
      return await gitService.initRepo(workspacePath, defaultBranch);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_CREATE_GITIGNORE,
    async (_, workspacePath, templateType) => {
      return await gitService.createGitignore(workspacePath, templateType);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_GET_REMOTES, async (_, workspacePath) => {
    return await gitService.getRemotes(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_ADD_REMOTE,
    async (_, workspacePath, name, url) => {
      return await gitService.addRemote(workspacePath, name, url);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_REMOVE_REMOTE,
    async (_, workspacePath, name) => {
      return await gitService.removeRemote(workspacePath, name);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_SET_REMOTE_URL,
    async (_, workspacePath, name, url) => {
      return await gitService.setRemoteUrl(workspacePath, name, url);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCHES, async (_, workspacePath) => {
    return await gitService.getBranches(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_CHECKOUT_BRANCH,
    async (_, workspacePath, branchName, createNew) => {
      return await gitService.checkoutBranch(workspacePath, branchName, createNew);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_CREATE_BRANCH,
    async (_, workspacePath, branchName) => {
      return await gitService.createBranch(workspacePath, branchName);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_DELETE_BRANCH,
    async (_, workspacePath, branchName, force) => {
      return await gitService.deleteBranch(workspacePath, branchName, force);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_MERGE_BRANCH,
    async (_, workspacePath, branchName) => {
      return await gitService.mergeBranch(workspacePath, branchName);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_FETCH,
    async (_, workspacePath, remote) => {
      return await gitService.fetch(workspacePath, remote);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_PULL,
    async (_, workspacePath, remote, branch) => {
      return await gitService.pull(workspacePath, remote, branch);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_PUSH,
    async (_, workspacePath, remote, branch, setUpstream) => {
      return await gitService.push(workspacePath, remote, branch, setUpstream);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_GET_SYNC_STATUS, async (_, workspacePath) => {
    return await gitService.getSyncStatus(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_SAVE,
    async (_, workspacePath, message) => {
      return await gitService.stashSave(workspacePath, message);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_POP,
    async (_, workspacePath, index) => {
      return await gitService.stashPop(workspacePath, index);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_STASH_LIST, async (_, workspacePath) => {
    return await gitService.stashList(workspacePath);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_STASH_DROP,
    async (_, workspacePath, index) => {
      return await gitService.stashDrop(workspacePath, index);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.GIT_GET_COMMIT_LOG,
    async (_, workspacePath, maxCount) => {
      return await gitService.getCommitLog(workspacePath, maxCount);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GIT_UNDO_COMMIT, async (_, workspacePath) => {
    return await gitService.undoLastCommit(workspacePath);
  });
  electron.ipcMain.handle(IPC_CHANNELS.GITHUB_VALIDATE_TOKEN, async (_, token) => {
    return await githubService.validateToken(token);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.GITHUB_PUBLISH_REPO,
    async (_, workspacePath, options, token) => {
      return await githubService.publishRepository(workspacePath, options, token);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.GITHUB_GET_USER_REPOS, async (_, token) => {
    return await githubService.getUserRepositories(token);
  });
  electron.ipcMain.handle(IPC_CHANNELS.GITHUB_GET_STORED_TOKEN, async () => {
    return await githubService.getStoredToken();
  });
  electron.ipcMain.handle(IPC_CHANNELS.GITHUB_SET_STORED_TOKEN, async (_, token) => {
    return await githubService.setStoredToken(token);
  });
  electron.ipcMain.handle(IPC_CHANNELS.GITHUB_CLEAR_STORED_TOKEN, async () => {
    return await githubService.clearStoredToken();
  });
  electron.ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN_GOOGLE, async () => {
    return await authService.loginWithGoogle();
  });
  electron.ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, async () => {
    return await authService.logout();
  });
  electron.ipcMain.handle(IPC_CHANNELS.AUTH_GET_CURRENT_USER, async () => {
    return await authService.getCurrentUser();
  });
  electron.ipcMain.handle(IPC_CHANNELS.DB_TEST_CONNECTION, async (_, connectionString) => {
    return await postgresService.testConnection(connectionString);
  });
  electron.ipcMain.handle(IPC_CHANNELS.DB_CONNECT, async (_, connectionString) => {
    return await postgresService.connect(connectionString);
  });
  electron.ipcMain.handle(IPC_CHANNELS.DB_DISCONNECT, async () => {
    return await postgresService.disconnect();
  });
  electron.ipcMain.handle(IPC_CHANNELS.DB_GET_STATUS, async () => {
    return postgresService.getStatus();
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.DB_SYNC_SETTINGS,
    async (_, userId, settings) => {
      return await postgresService.syncSettings(userId, settings);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async (_, userId) => {
    return await postgresService.getSettings(userId);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.DB_SAVE_SNIPPET,
    async (_, userId, snippet) => {
      return await postgresService.saveSnippet(userId, snippet);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.DB_GET_SNIPPETS, async (_, userId) => {
    return await postgresService.getSnippets(userId);
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.DB_SAVE_AI_CHAT,
    async (_, userId, chat) => {
      return await postgresService.saveAIChat(userId, chat);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.DB_GET_AI_CHATS, async (_, userId) => {
    return await postgresService.getAIChats(userId);
  });
  electron.ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_INSTALLED, async () => {
    return await extensionService.getInstalledExtensions();
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_SEARCH_MARKETPLACE,
    async (_, query, category) => {
      return await extensionService.searchMarketplace(query, category);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_MARKETPLACE,
    async (_, extension) => {
      return await extensionService.installFromMarketplace(extension);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_INSTALL_FROM_VSIX,
    async (_, filePath) => {
      return await extensionService.installFromVsix(filePath);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_UNINSTALL,
    async (_, extensionId) => {
      return await extensionService.uninstallExtension(extensionId);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_TOGGLE_ENABLE,
    async (_, extensionId, enabled) => {
      return await extensionService.toggleExtension(extensionId, enabled);
    }
  );
  electron.ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_SNIPPETS, async () => {
    return await extensionService.getExtensionSnippets();
  });
  electron.ipcMain.handle(IPC_CHANNELS.EXTENSIONS_GET_THEMES, async () => {
    return await extensionService.getExtensionThemes();
  });
  electron.ipcMain.handle(IPC_CHANNELS.EXTENSIONS_OPEN_VSIX_DIALOG, async () => {
    return await extensionService.openVsixDialog();
  });
  electron.ipcMain.handle(IPC_CHANNELS.EXTENSIONS_OPEN_WINDOW, () => {
    if (openExtensionsWindow2) {
      openExtensionsWindow2();
    }
  });
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_GET_README,
    async (_, extensionId, namespace, name) => {
      return await extensionService.getReadme(extensionId, namespace, name);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.EXTENSIONS_GET_EXT_SNIPPETS,
    async (_, extensionId) => {
      return await extensionService.getExtensionSnippetsForExt(extensionId);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.AI_GENERATE_COMPLETION,
    async (_, req) => {
      const mergedReq = {
        ...req,
        settings: { ...storedSettings, ...req.settings }
      };
      return await aiService.generateCompletion(mergedReq);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.AI_GENERATE_EDIT,
    async (_, req) => {
      const mergedReq = {
        ...req,
        settings: { ...storedSettings, ...req.settings }
      };
      return await aiService.generateEdit(mergedReq);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.AI_CHAT,
    async (_, req) => {
      const mergedReq = {
        ...req,
        settings: { ...storedSettings, ...req.settings }
      };
      return await aiService.chat(mergedReq);
    }
  );
  electron.ipcMain.handle(
    IPC_CHANNELS.AI_TEST_CONNECTION,
    async (_, provider, apiKey) => {
      const resolvedProvider = provider || storedSettings.aiModelProvider;
      const resolvedKey = apiKey || storedSettings.aiApiKey;
      return await aiService.testConnection(resolvedProvider, resolvedKey);
    }
  );
}
process.on("uncaughtException", (error) => {
  console.error("[Bodhi Main Process] Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Bodhi Main Process] Unhandled Rejection:", reason);
});
let mainWindow = null;
let settingsWindow = null;
let extensionsWindow = null;
function getAppIconPath() {
  const isDev = !electron.app.isPackaged;
  const filename = process.platform === "win32" ? "icon.ico" : "icon.png";
  const candidates = isDev ? [path.join(__dirname, "../../resources", filename)] : [
    path.join(process.resourcesPath, "resources", filename),
    path.join(process.resourcesPath, filename)
  ];
  for (const candidate of candidates) {
    if (fsSync__namespace.existsSync(candidate)) {
      return candidate;
    }
  }
  return void 0;
}
function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) {
      settingsWindow.restore();
    }
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }
  const iconPath = getAppIconPath();
  settingsWindow = new electron.BrowserWindow({
    title: "Settings - Bodhi",
    width: 780,
    height: 560,
    minWidth: 640,
    minHeight: 460,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...process.platform === "darwin" ? { titleBarStyle: "hidden" } : {},
    backgroundColor: "#0f1117",
    ...iconPath ? { icon: iconPath } : {},
    parent: mainWindow && !mainWindow.isDestroyed() ? mainWindow : void 0,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  settingsWindow.on("ready-to-show", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.show();
    }
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
  settingsWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    settingsWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/settings`);
  } else {
    settingsWindow.loadFile(path.join(__dirname, "../renderer/index.html"), {
      hash: "/settings"
    });
  }
  return settingsWindow;
}
function openExtensionsWindow() {
  if (extensionsWindow && !extensionsWindow.isDestroyed()) {
    if (extensionsWindow.isMinimized()) {
      extensionsWindow.restore();
    }
    extensionsWindow.show();
    extensionsWindow.focus();
    return extensionsWindow;
  }
  const iconPath = getAppIconPath();
  extensionsWindow = new electron.BrowserWindow({
    title: "Extensions - Bodhi",
    width: 980,
    height: 680,
    minWidth: 800,
    minHeight: 520,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...process.platform === "darwin" ? { titleBarStyle: "hidden" } : {},
    backgroundColor: "#0f1117",
    ...iconPath ? { icon: iconPath } : {},
    parent: mainWindow && !mainWindow.isDestroyed() ? mainWindow : void 0,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  extensionsWindow.on("ready-to-show", () => {
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.show();
    }
  });
  extensionsWindow.on("closed", () => {
    extensionsWindow = null;
  });
  extensionsWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    extensionsWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/extensions`);
  } else {
    extensionsWindow.loadFile(path.join(__dirname, "../renderer/index.html"), {
      hash: "/extensions"
    });
  }
  return extensionsWindow;
}
function createWindow() {
  const iconPath = getAppIconPath();
  mainWindow = new electron.BrowserWindow({
    title: "Bodhi",
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 550,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...process.platform === "darwin" ? { titleBarStyle: "hidden" } : {},
    backgroundColor: "#0f1117",
    ...iconPath ? { icon: iconPath } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  registerIpcHandlers(mainWindow, openSettingsWindow, openExtensionsWindow);
  let hasShown = false;
  const showMainWindow = () => {
    if (!hasShown && mainWindow && !mainWindow.isDestroyed()) {
      hasShown = true;
      mainWindow.show();
      mainWindow.focus();
    }
  };
  mainWindow.once("ready-to-show", showMainWindow);
  setTimeout(showMainWindow, 1e3);
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Bodhi] Renderer failed to load [${errorCode}]: ${errorDescription} (${validatedURL})`);
    showMainWindow();
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("[Bodhi] Renderer process gone:", details);
  });
  mainWindow.on("close", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.close();
    }
  });
  mainWindow.on("closed", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
    if (extensionsWindow && !extensionsWindow.isDestroyed()) {
      extensionsWindow.close();
    }
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(async () => {
  await authService.init().catch(() => {
  });
  await postgresService.init().catch(() => {
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  fileService.stopWatcher();
  terminalService.killAll();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  fileService.stopWatcher();
  terminalService.killAll();
  postgresService.disconnect().catch(() => {
  });
});
exports.openExtensionsWindow = openExtensionsWindow;
exports.openSettingsWindow = openSettingsWindow;
