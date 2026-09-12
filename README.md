<div align="center">

<a href="#-bodhi-code-editor">
  <img src="resources/banner.svg" alt="Bodhi Editor Banner" width="100%" />
</a>

<br/><br/>

<a href="https://github.com/your-username/Bodhi">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1200&color=34D399&center=true&vCenter=true&width=750&lines=Next-Generation+Desktop+Code+Editor;Speed.+Extensibility.+Native+Intelligence.;Multi-Model+AI+(Gemini+2.5+%E2%80%A2+GPT-4o+%E2%80%A2+Claude+3.5);Monaco+Engine+%E2%80%A2+Dual-Pane+Split+%E2%80%A2+Live+Markdown;Native+PTY+Terminal+%E2%80%A2+Git+Churn+Heatmaps;Integrated+PostgreSQL+Explorer+%E2%80%A2+Open+VSX" alt="Bodhi Typing Subtitle" />
</a>

<br/>

[![Release](https://img.shields.io/badge/Release-v1.0.0--beta.1%20(Public%20Beta)-10B981?style=for-the-badge&logo=rocket&logoColor=white)](https://github.com/)
[![Electron](https://img.shields.io/badge/Electron-34.3.0-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-0.52.2-0E70C0?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.3-4338CA?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

<p align="center">
  <a href="#-features-at-a-glance"><b>Features</b></a> •
  <a href="#-architecture"><b>Architecture</b></a> •
  <a href="#-keyboard-shortcuts"><b>Shortcuts</b></a> •
  <a href="#-project-structure"><b>Repository</b></a> •
  <a href="#-getting-started"><b>Getting Started</b></a> •
  <a href="#-ai-engine-setup"><b>AI Setup</b></a> •
  <a href="#-security"><b>Security</b></a>
</p>

---

</div>

## 🌟 Overview

**Bodhi** is an ultra-fast, modern desktop code editor designed for developers who demand peak performance, sleek dark glassmorphism, and native developer workflows. 

Engineered with **Electron 34**, **React 18**, **Monaco Editor**, and **xterm.js**, Bodhi unifies code editing, multi-model AI copilot integration, an Open VSX extension marketplace, Git code-churn heatmaps, multi-session PTY terminal emulation, and an integrated PostgreSQL explorer into a single, cohesive developer workspace.

---

## ✨ Features at a Glance

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📝 Monaco Editor Engine</h3>
      <ul>
        <li><b>Multi-Tab Buffer Workspace</b>: Fast tab switching, unsaved indicators (<code>●</code>), drag reordering, and middle-click closing.</li>
        <li><b>Split Editor Mode (<kbd>Ctrl</kbd> + <kbd>\</kbd>)</b>: Dual-pane side-by-side editing with synchronized active buffers.</li>
        <li><b>Real-Time Markdown Preview (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>)</b>: High-speed live HTML rendering with GitHub-flavored markdown.</li>
        <li><b>Rich Ligature Registry</b>: First-class support for JetBrains Mono, Fira Code, Cascadia Code, and custom developer fonts.</li>
        <li><b>Configurable Auto-Save</b>: Debounced background saving with atomic disk writes.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🧠 Multi-Model AI Copilot</h3>
      <ul>
        <li><b>Multi-Provider Gateway</b>: Native client integrations for <b>Google Gemini</b> (<i>2.5 Pro / 2.0 Flash</i>), <b>OpenAI</b> (<i>GPT-4o / GPT-4o-mini</i>), and <b>Anthropic</b> (<i>Claude 3.5 Sonnet</i>).</li>
        <li><b>Key Auto-Detection</b>: Automatically detects providers based on API key prefix signatures.</li>
        <li><b>Context-Aware AI Chat (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>)</b>: Sidebar drawer aware of the active buffer, language, and selected code.</li>
        <li><b>Inline AI Code Editor (<kbd>Ctrl</kbd> + <kbd>K</kbd>)</b>: In-place code generation, refactoring, unit tests, and bug fixes directly within Monaco.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔀 Git & Churn Heatmap Engine</h3>
      <ul>
        <li><b>Visual Git Workspace</b>: Live tracking for staged, unstaged, and untracked files with status badges.</li>
        <li><b>Monaco Diff Viewer</b>: Interactive side-by-side diff against <code>HEAD</code>.</li>
        <li><b>🔥 Line Churn Heatmap</b>: 5-level flame scale mapping commit frequency and author recency per line to highlight code hot paths.</li>
        <li><b>GitHub Integration</b>: One-click repository publishing and interactive branch switcher.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>💻 Native Multi-Shell Terminal</h3>
      <ul>
        <li><b>Native PTY Spawner</b>: Low-latency interactive terminals powered by <code>node-pty</code> and <code>@xterm/xterm</code>.</li>
        <li><b>Multi-Shell Profiles</b>: Automatic discovery for <b>PowerShell</b>, <b>Command Prompt</b>, <b>WSL (Bash)</b>, and custom shells.</li>
        <li><b>Split Terminals (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>5</kbd>)</b>: Run concurrent side-by-side shells in the dock.</li>
        <li><b>Buffer Search (<kbd>Ctrl</kbd> + <kbd>F</kbd>)</b>: Built-in terminal search widget with live match highlighting.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🐘 PostgreSQL Explorer</h3>
      <ul>
        <li><b>Direct Connection Testing</b>: Connect to local or remote PostgreSQL instances directly from your editor.</li>
        <li><b>Live Health Checks</b>: Monitor latency, server version, and connection state.</li>
        <li><b>Integrated Credential Store</b>: Secure configuration persistence for active development databases.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🧩 Open VSX Extensions & Themes</h3>
      <ul>
        <li><b>Open VSX Registry</b>: Browse, search, and install extensions directly from the open ecosystem.</li>
        <li><b>VSIX Sideloading</b>: Drag-and-drop or browse local <code>.vsix</code> archives for offline installation.</li>
        <li><b>Snippet Autocompletions</b>: Dynamically injects extension snippets into Monaco autocompletions.</li>
        <li><b>Theme Importer</b>: Supports VS Code JSON & TextMate color themes.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏛️ Architecture

Bodhi adopts a clean multi-process model with strict process isolation, typed asynchronous IPC channels, and dedicated background services:

```mermaid
graph TB
    subgraph Main_Process ["🖥️ Electron Main Process (Node.js 22 Runtime)"]
        direction TB
        AppLifecycle["⚡ App Lifecycle & Window Manager<br/>(Main Window, Settings & Extensions Modals)"]
        
        subgraph Backend_Services ["Native Backend Services (`backend/services/`)"]
            FileSvc["📁 FileService<br/>• Disk I/O & Traversal<br/>• Chokidar Live Watcher"]
            TermSvc["💻 TerminalService<br/>• node-pty Native Bridge<br/>• Multi-shell PTY Sessions"]
            GitSvc["🔀 GitService<br/>• CLI Status / Stage / Commit<br/>• Line Churn Heatmap Engine"]
            AISvc["🧠 AIService<br/>• Multi-Model Router<br/>• Gemini / OpenAI / Claude"]
            PostgresSvc["🐘 PostgresService<br/>• Connection Pool Manager<br/>• Health & Diagnostic Engine"]
            ExtSvc["🧩 ExtensionService<br/>• Open VSX Marketplace<br/>• VSIX Unpacker & Theme Parser"]
            SearchSvc["🔍 SearchService<br/>• Workspace Regex Search<br/>• Batch File Replacements"]
        end

        IPCHandlers["📡 Secure IPC Handler Layer (`backend/ipcHandlers.ts`)"]
        AppLifecycle --> Backend_Services
        Backend_Services <--> IPCHandlers
    end

    subgraph Security_Boundary ["🛡️ Context Isolation Boundary (`preload/`)"]
        PreloadBridge["🔒 BodhiAPI Context Bridge (`preload/index.ts`)<br/>• Strongly-typed Promises<br/>• Unidirectional Event Listeners<br/>• Zero Raw Node.js Exposure in Renderer"]
    end

    subgraph Renderer_Process ["🎨 Renderer Layer (`frontend/src/` — React 18 + Monaco + Zustand)"]
        direction TB
        
        subgraph Global_Stores ["State Management (`frontend/src/store/`)"]
            StoreEditor["useEditorStore<br/>(Tabs, Buffers, Layout)"]
            StoreWorkspace["useWorkspaceStore<br/>(File Tree, Watchers)"]
            StoreGit["useGitStore<br/>(Status, Staging, Diffs)"]
            StoreDb["useDatabaseStore<br/>(PostgreSQL Connections)"]
            StoreExt["useExtensionStore<br/>(Marketplace, Themes)"]
        end

        subgraph UI_Modules ["High-Performance UI Modules"]
            TitleBar["🪟 Custom TitleBar & Menu System"]
            Sidebar["📂 Sidebar (Explorer | Search | Git | AI | DB | Ext)"]
            EditorEngine["📝 Monaco Multi-Tab & Split Editor Engine"]
            DiffEngine["⚖️ Side-by-Side Diff Viewer"]
            MarkdownEngine["👁️ Real-Time Markdown Preview"]
            TerminalPanel["💻 Multi-Session xterm.js Terminal Dock"]
            CommandPal["⚡ Fuzzy Command Palette & Quick Open"]
            SettingsWin["⚙️ Dedicated Preferences Manager"]
        end

        Global_Stores <--> UI_Modules
    end

    IPCHandlers <==>|Typed IPC Channels (`shared/constants.ts`)| PreloadBridge
    PreloadBridge <==>|window.bodhiAPI (`shared/types.ts`)| Global_Stores
```

---

## 📁 Project Structure

```text
Bodhi/
├── backend/                     # Electron Main Process (Node.js)
│   ├── services/                # Specialized OS, PTY, Git, and AI services
│   │   ├── aiService.ts         # Multi-model LLM router (Gemini, OpenAI, Claude)
│   │   ├── authService.ts       # GitHub OAuth & authentication service
│   │   ├── extensionService.ts  # Open VSX marketplace client & VSIX unpacker
│   │   ├── fileService.ts       # File I/O operations & Chokidar watcher
│   │   ├── gitService.ts        # Git CLI status, diffs, commits, & line churn
│   │   ├── githubService.ts     # GitHub API repository publisher & sync
│   │   ├── postgresService.ts   # PostgreSQL client connection manager
│   │   ├── searchService.ts     # Multi-file regex search & batch replace
│   │   └── terminalService.ts   # node-pty shell sessions & stream manager
│   ├── index.ts                 # BrowserWindow lifecycle & window router
│   └── ipcHandlers.ts           # Type-safe IPC channels & registration
│
├── frontend/                    # Vite + React 18 + Monaco Renderer
│   ├── src/
│   │   ├── assets/              # Branding, icons, and SVG graphics
│   │   ├── components/          # Modular React UI components
│   │   │   ├── Editor/          # Monaco editor, tabs, diff, markdown preview
│   │   │   ├── ExtensionsWindow/# Dedicated extensions marketplace window
│   │   │   ├── SettingsWindow/  # Dedicated preferences & AI configuration window
│   │   │   ├── Sidebar/         # Explorer, search, git, AI chat, & database panels
│   │   │   ├── Terminal/        # xterm.js instance & search widgets
│   │   │   ├── TitleBar/        # Custom frameless title bar & menu bar
│   │   │   └── WelcomeWalkthrough/ # Interactive onboarding tour
│   │   ├── hooks/               # Keyboard shortcuts & window hooks
│   │   ├── store/               # Zustand state stores (editor, git, database, etc.)
│   │   ├── theme/               # Monaco themes & font registry
│   │   ├── utils/               # Command registry & path helpers
│   │   ├── App.tsx              # Root editor layout orchestrator
│   │   ├── index.css            # Tailwind directives & design tokens
│   │   └── main.tsx             # React DOM entry point
│   └── index.html               # Frontend HTML root
│
├── preload/                     # Preload Context Isolation Boundary
│   ├── index.ts                 # window.bodhiAPI implementation via contextBridge
│   └── index.d.ts               # Global Window.bodhiAPI TypeScript definitions
│
├── shared/                      # Isomorphic TypeScript Types & Constants
│   ├── constants.ts             # IPC channels & editor defaults
│   └── types.ts                 # Shared data models & IPC contracts
│
├── config/                      # Build & Tooling Configurations
│   ├── electron.vite.config.ts  # Multi-target Vite bundler configuration
│   ├── electron-builder.yml     # Desktop packaging & installer specifications
│   ├── tailwind.config.ts       # Tailwind design tokens & themes
│   ├── postcss.config.cjs       # PostCSS configuration
│   ├── tsconfig.json            # Solution tsconfig
│   ├── tsconfig.node.json       # Node target compiler options
│   └── tsconfig.web.json        # Web renderer compiler options
│
├── resources/                   # Desktop icons, banner, & license terms
└── tsconfig.json                # Root TypeScript solution configuration
```

---

## ⌨️ Keyboard Shortcuts

<details open>
<summary><b>View Complete Keyboard Shortcuts Matrix</b></summary>
<br/>

| Category | Windows / Linux | macOS | Action |
|---|---|---|---|
| **Navigation** | <kbd>Ctrl</kbd> + <kbd>P</kbd> | <kbd>Cmd</kbd> + <kbd>P</kbd> | Quick Open File |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Universal Command Palette |
| | <kbd>Ctrl</kbd> + <kbd>R</kbd> | <kbd>Cmd</kbd> + <kbd>R</kbd> | Switch Recent Workspace |
| | <kbd>F1</kbd> | <kbd>F1</kbd> | Open Interactive Walkthrough |
| **Editor** | <kbd>Ctrl</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>S</kbd> | Save Active Buffer |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Save All Open Buffers |
| | <kbd>Ctrl</kbd> + <kbd>W</kbd> | <kbd>Cmd</kbd> + <kbd>W</kbd> | Close Active Tab |
| | <kbd>Ctrl</kbd> + <kbd>\</kbd> | <kbd>Cmd</kbd> + <kbd>\</kbd> | Toggle Split Editor (Dual Pane) |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> | Toggle Markdown Live Preview |
| | <kbd>Ctrl</kbd> + <kbd>K</kbd> | <kbd>Cmd</kbd> + <kbd>K</kbd> | Inline AI Code Assistant |
| | <kbd>Ctrl</kbd> + <kbd>,</kbd> | <kbd>Cmd</kbd> + <kbd>,</kbd> | Open Preferences & Settings |
| **Views & Panels** | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>B</kbd> | Toggle Sidebar Drawer |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> | Focus File Explorer |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Focus Global Search & Replace |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd> | Focus Source Control (Git) |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> | Focus AI Assistant Chat |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | Open Extensions Marketplace |
| **Terminal** | <kbd>Ctrl</kbd> + <kbd>`</kbd> | <kbd>Cmd</kbd> + <kbd>`</kbd> | Toggle Integrated Terminal Dock |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd> | Create New Shell Session |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>5</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>5</kbd> | Split Terminal Session |
| | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>F</kbd> | Search in Terminal Buffer |
| **Zoom & View** | <kbd>Ctrl</kbd> + <kbd>=</kbd> / <kbd>-</kbd> / <kbd>0</kbd> | <kbd>Cmd</kbd> + <kbd>=</kbd> / <kbd>-</kbd> / <kbd>0</kbd> | Zoom In / Out / Reset Zoom |

</details>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**: Installed and available on your system `$PATH`
- **Native Build Tools** (for compiling `node-pty`):
  - **Windows**: Visual Studio C++ Build Tools or `windows-build-tools`
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `sudo apt install build-essential python3`

---

### Quick Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Bodhi.git
cd Bodhi

# 2. Install project dependencies
npm install

# 3. Launch live development environment (Vite + Electron)
npm run dev
```

---

### Build & Packaging

```bash
# Run type checking across both Node and Web targets
npm run typecheck

# Compile production bundles
npm run build

# Package unpacked desktop distribution
npm run build:unpack

# Build platform-specific distribution installers
npm run build:win      # Windows (.exe NSIS Installer & Portable)
npm run build:mac      # macOS (.dmg / .zip)
npm run build:linux    # Linux (AppImage / .deb)
```

---

## ⚙️ AI Engine Setup

Bodhi supports multiple frontier AI models out-of-the-box. Configure your credentials in **Settings (<kbd>Ctrl</kbd> + <kbd>,</kbd>) → AI Assistant**:

```json
{
  "aiModelProvider": "google-gemini", // "google-gemini" | "openai" | "anthropic"
  "aiApiKey": "your-api-key-here",
  "aiTemperature": 0.2,
  "aiMaxTokens": 2048
}
```

> **Tip**: You can also supply API keys via environment variables or a `.env` file:
> ```bash
> GEMINI_API_KEY=AIzaSy...
> OPENAI_API_KEY=sk-...
> ANTHROPIC_API_KEY=sk-ant-...
> ```

---

## 🛡️ Security

Bodhi is architected with a security-first stance:

- **Strict Sandbox & Context Isolation**: The renderer runs with `contextIsolation: true`, `nodeIntegration: false`, and secure content security policies.
- **Controlled File System Access**: File modifications and process execution are restricted to the main process behind explicit IPC contracts.
- **Direct AI Endpoint Communication**: AI queries communicate directly from the main process to official provider endpoints over encrypted HTTPS. Zero intermediate proxy servers or telemetry.

---

## 📄 Terms & Credits

Bodhi is distributed under the terms outlined in [TERMS.md](resources/TERMS.txt).  
Crafted with passion for high-performance developer experiences.
