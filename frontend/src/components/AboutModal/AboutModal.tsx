import React, { useEffect } from 'react'
import { X, Cpu, Terminal, Check } from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { BodhiLogo } from '../common/BodhiLogo'

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setAboutModalOpen, setTermsModalOpen } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isAboutModalOpen) {
        setAboutModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAboutModalOpen, setAboutModalOpen])

  if (!isAboutModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setAboutModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-bodhi-panel border border-BODHI-border rounded-xl shadow-2xl overflow-hidden p-6 text-BODHI-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bodhi-accent via-white/40 to-bodhi-accent/30" />

        {/* Close Button */}
        <button
          onClick={() => setAboutModalOpen(false)}
          className="absolute top-4 right-4 text-bodhi-muted hover:text-white p-1 rounded-md hover:bg-bodhi-surface transition-colors"
        >
          <X size={16} />
        </button>

        {/* Brand Icon & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg border border-white/10 flex items-center justify-center shrink-0">
            <BodhiLogo size={56} className="rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wide text-white">BODHI</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-bodhi-accent/20 text-bodhi-accent border border-bodhi-accent/40">
                v1.0.0-beta.1 (Beta)
              </span>
            </div>
            <p className="text-xs text-bodhi-muted">Developed by BUIMB Research • Open Source</p>
          </div>
        </div>

        {/* Tech Stack / Architecture Badges */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-bodhi-surface/70 border border-BODHI-border text-xs">
            <Cpu size={14} className="text-bodhi-accent shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-white">Monaco Core</div>
              <div className="text-[10px] text-bodhi-muted">VS Code Editor Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-bodhi-surface/70 border border-BODHI-border text-xs">
            <Terminal size={14} className="text-bodhi-accent shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-white">node-pty</div>
              <div className="text-[10px] text-bodhi-muted">Native Shell Engine</div>
            </div>
          </div>
        </div>

        {/* Key Features List */}
        <div className="space-y-1.5 text-xs text-bodhi-muted mb-5">
          <div className="flex items-center gap-2">
            <Check size={13} className="text-bodhi-accent shrink-0" />
            <span>Multi-buffer tabbed editing with dirty status</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={13} className="text-bodhi-accent shrink-0" />
            <span>Interactive Quick Open & Command Palette (<code className="text-bodhi-accent font-mono text-[11px]">Ctrl+P</code>)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={13} className="text-bodhi-accent shrink-0" />
            <span>High-frequency PTY integrated terminal drawer</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={13} className="text-bodhi-accent shrink-0" />
            <span>Chokidar live workspace file watcher</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-BODHI-border flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setAboutModalOpen(false)
              setTermsModalOpen(true)
            }}
            className="text-[11px] text-bodhi-muted hover:text-bodhi-accent transition-colors underline decoration-white/20 cursor-pointer"
          >
            Terms & Open Source License (BUIMB Research)
          </button>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="px-4 py-1.5 bg-bodhi-accent text-black font-semibold text-xs rounded-lg hover:bg-bodhi-accentHover active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
