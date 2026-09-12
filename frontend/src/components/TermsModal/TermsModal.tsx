import React, { useEffect } from 'react'
import { X, ShieldCheck, Scale, FileText, Cpu, Heart, CheckCircle2 } from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { BodhiLogo } from '../common/BodhiLogo'

export const TermsModal: React.FC = () => {
  const { isTermsModalOpen, setTermsModalOpen } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isTermsModalOpen) {
        setTermsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTermsModalOpen, setTermsModalOpen])

  if (!isTermsModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none animate-fade-in"
      onClick={() => setTermsModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-bodhi-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-BODHI-text max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bodhi-accent via-emerald-400 to-indigo-500" />

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-bodhi-surface/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <BodhiLogo size={40} className="rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">Terms & Conditions</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Open Source
                </span>
              </div>
              <p className="text-xs text-bodhi-muted">Developed by BUIMB Research • Version 1.0</p>
            </div>
          </div>

          <button
            onClick={() => setTermsModalOpen(false)}
            className="text-bodhi-muted hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-BODHI-text leading-relaxed select-text">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Scale size={16} className="text-bodhi-accent" />
              <span>1. Open Source License & Permissive Grant</span>
            </div>
            <p className="text-bodhi-muted mb-2">
              BODHI EDITOR is open-source software developed and maintained by <strong className="text-white">BUIMB Research</strong> and the open-source developer community.
            </p>
            <p className="text-bodhi-muted">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 rounded-xl bg-bodhi-bg/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck size={15} className="text-bodhi-accent" />
              <span>2. Local Execution & Privacy Commitment</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-bodhi-muted pl-4 list-disc">
              <li>
                <strong className="text-white">Strictly Local:</strong> Editor buffers, file system watcher, and native terminal sessions execute on your local machine.
              </li>
              <li>
                <strong className="text-white">Zero Hidden Telemetry:</strong> BUIMB Research does not collect, track, or transmit your private codebase, files, or terminal keystrokes.
              </li>
              <li>
                <strong className="text-white">Local Configuration:</strong> Sessions and settings are saved locally on your device in your user app data directory.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Cpu size={16} className="text-bodhi-accent" />
              <span>3. Artificial Intelligence (AI) Features & APIs</span>
            </div>
            <p className="text-bodhi-muted mb-2">
              BODHI includes optional client-side AI capabilities (inline code completions, code refactoring, and AI Chat). Users supply their own API keys (e.g. Google Gemini, OpenAI, Anthropic).
            </p>
            <p className="text-bodhi-muted">
              AI requests travel directly from your client machine to the model provider's endpoints. BUIMB Research operates no middleman proxies, logging servers, or caching databases for your AI prompts.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <FileText size={16} className="text-bodhi-accent" />
              <span>4. Disclaimer of Warranty & Liability</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed uppercase">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL BUIMB RESEARCH OR THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE.
            </div>
          </div>

          {/* Section 5 */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-bodhi-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-bodhi-accent" />
              <span>Copyright &copy; 2025-2026 BUIMB Research</span>
            </span>
            <span className="flex items-center gap-1">
              <span>Open Source for Developers</span>
              <Heart size={11} className="text-rose-400 fill-rose-400/20" />
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-bodhi-surface/40 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-bodhi-muted">
            BUIMB Research Open Source Initiative
          </span>
          <button
            onClick={() => setTermsModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-bodhi-accent hover:brightness-110 active:scale-95 text-xs font-bold text-black transition-all cursor-pointer shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
