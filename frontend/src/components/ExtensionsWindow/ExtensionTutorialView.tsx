import React from 'react'
import {
  FolderDown,
  Sparkles
} from 'lucide-react'

interface ExtensionTutorialViewProps {
  onInstallVsix: () => Promise<void>
}

export const ExtensionTutorialView: React.FC<ExtensionTutorialViewProps> = ({
  onInstallVsix
}) => {
  return (
    <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto flex flex-col gap-8 select-text animate-fade-in text-white">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-bodhi-panel via-bodhi-surface to-bodhi-panel border border-BODHI-border shadow-xl flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bodhi-accent/15 border border-bodhi-accent/30 text-bodhi-accent text-xs font-semibold mb-3">
            <Sparkles size={13} />
            Extension Installation Guide
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Installing Any Custom VS Code Extension in Bodhi
          </h2>
          <p className="text-xs text-bodhi-muted mt-1.5 leading-relaxed max-w-2xl">
            BODHI has native compatibility with VS Code extension packages
            (<code className="text-bodhi-accent font-mono">.vsix</code>). You can
            download any snippet or theme extension from the web or export from your
            existing VS Code install.
          </p>
        </div>

        <button
          onClick={onInstallVsix}
          className="shrink-0 py-2.5 px-4 rounded-xl bg-bodhi-accent text-black font-bold text-xs hover:brightness-110 shadow-lg flex items-center gap-2 active:scale-95 transition-all"
        >
          <FolderDown size={16} />
          <span>Install .VSIX Now</span>
        </button>
      </div>

      {/* 3 Step-by-Step Methods */}
      <div className="flex flex-col gap-6">
        {/* Method 1 */}
        <div className="p-6 rounded-2xl bg-bodhi-panel/60 border border-BODHI-border/80 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-bodhi-accent text-black font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                Download .VSIX from Open VSX or Visual Studio Marketplace
              </h3>
              <p className="text-xs text-bodhi-muted">
                The fastest way to install any public VS Code extension
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-bodhi-surface/40 border border-BODHI-border/60">
              <span className="text-bodhi-accent font-bold">Step A</span>
              <p className="text-bodhi-muted mt-1">
                Go to{' '}
                <a
                  href="https://open-vsx.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline hover:text-bodhi-accent"
                >
                  open-vsx.org
                </a>{' '}
                or the Visual Studio Marketplace and search for your desired extension.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-bodhi-surface/40 border border-BODHI-border/60">
              <span className="text-bodhi-accent font-bold">Step B</span>
              <p className="text-bodhi-muted mt-1">
                Under the right sidebar menu (Resources), click{' '}
                <strong className="text-white">"Download Extension"</strong>. It will
                download a <code className="text-emerald-400">.vsix</code> file.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-bodhi-surface/40 border border-BODHI-border/60">
              <span className="text-bodhi-accent font-bold">Step C</span>
              <p className="text-bodhi-muted mt-1">
                In BODHI, click{' '}
                <strong className="text-white">"Install from VSIX..."</strong> at the top
                of this window and select the downloaded file!
              </p>
            </div>
          </div>
        </div>

        {/* Method 2 */}
        <div className="p-6 rounded-2xl bg-bodhi-panel/60 border border-BODHI-border/80 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                Export Installed Extensions from Your Local VS Code
              </h3>
              <p className="text-xs text-bodhi-muted">
                Already have extensions configured in your desktop VS Code? You can load them directly.
              </p>
            </div>
          </div>

          <div className="text-xs text-bodhi-muted space-y-2">
            <p>
              VS Code stores all your installed extensions in a local directory on your machine:
            </p>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-bodhi-surface border border-BODHI-border text-slate-300 flex items-center justify-between">
                <span>Windows: %USERPROFILE%\.vscode\extensions\</span>
                <span className="text-bodhi-muted text-[10px]">C:\Users\&lt;You&gt;\.vscode\extensions</span>
              </div>
              <div className="p-2 rounded-lg bg-bodhi-surface border border-BODHI-border text-slate-300 flex items-center justify-between">
                <span>macOS / Linux: ~/.vscode/extensions/</span>
                <span className="text-bodhi-muted text-[10px]">/Users/&lt;you&gt;/.vscode/extensions</span>
              </div>
            </div>
            <p className="pt-1">
              To use one in BODHI: compress the extension folder into a{' '}
              <code className="text-bodhi-accent">.zip</code>, change the file
              extension from <code className="text-bodhi-accent">.zip</code> to{' '}
              <code className="text-bodhi-accent">.vsix</code>, and install it via the
              button below!
            </p>
          </div>
        </div>

        {/* Method 3 */}
        <div className="p-6 rounded-2xl bg-bodhi-panel/60 border border-BODHI-border/80 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-purple-400 text-black font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                Create Your Own Custom Snippet Pack
              </h3>
              <p className="text-xs text-bodhi-muted">
                Easily write your own personal code snippets with tab stops
              </p>
            </div>
          </div>

          <div className="text-xs text-bodhi-muted space-y-3">
            <p>
              VS Code snippets use standard JSON format. Variables like{' '}
              <code className="text-emerald-400">$1</code>,{' '}
              <code className="text-emerald-400">$2</code>, and{' '}
              <code className="text-emerald-400">$0</code> define where the cursor jumps
              when you press <kbd className="px-1.5 py-0.5 rounded bg-bodhi-surface border text-white">Tab</kbd>:
            </p>

            <pre className="p-3.5 rounded-xl bg-bodhi-surface text-amber-300 font-mono text-[11px] border border-BODHI-border/80 overflow-x-auto">
{`{
  "My Custom Component": {
    "prefix": "mycomp",
    "body": [
      "export const \${1:ComponentName} = () => {",
      "  return (",
      "    <div className=\\"\${2:container}\\">",
      "      \${0}",
      "    </div>",
      "  )",
      "}"
    ],
    "description": "My custom boilerplate snippet"
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="p-6 rounded-2xl bg-bodhi-panel border border-BODHI-border text-center flex flex-col items-center gap-3">
        <h4 className="text-sm font-bold text-white">
          Ready to install your custom extension?
        </h4>
        <p className="text-xs text-bodhi-muted max-w-md">
          Select any <code className="text-bodhi-accent">.vsix</code> package on your
          computer to install it into BODHI now.
        </p>
        <button
          onClick={onInstallVsix}
          className="mt-1 py-2 px-5 rounded-xl bg-bodhi-accent text-black font-bold text-xs hover:brightness-110 active:scale-95 shadow-lg flex items-center gap-2"
        >
          <FolderDown size={14} />
          <span>Browse and Select .VSIX File</span>
        </button>
      </div>
    </div>
  )
}
