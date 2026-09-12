import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Palette,
  Terminal,
  Columns,
  Rocket,
  Check,
  FolderOpen,
  Play,
  KeyRound
} from 'lucide-react'
import { useEditorStore } from '../../store/useEditorStore'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { BodhiLogo } from '../common/BodhiLogo'
import { PLAYGROUND_SAMPLE_CODE } from './WalkthroughPlayground'

interface StepDef {
  id: number
  title: string
  subtitle: string
  icon: React.ReactNode
}

const STEPS: StepDef[] = [
  {
    id: 1,
    title: 'Choose your look & feel',
    subtitle: 'Select your preferred visual style. It updates live across the entire editor.',
    icon: <Palette size={16} className="text-bodhi-accent" />
  },
  {
    id: 2,
    title: 'Ambient AI Superpowers',
    subtitle: 'Context-aware code completion, ghost text, and inline refactoring (Ctrl + I).',
    icon: <Sparkles size={16} className="text-bodhi-accent" />
  },
  {
    id: 3,
    title: 'Built-in Developer Tools',
    subtitle: 'High-speed node-pty terminal drawer and side-by-side split editing at your fingertips.',
    icon: <Terminal size={16} className="text-bodhi-accent" />
  },
  {
    id: 4,
    title: "You're ready to build",
    subtitle: 'Launch a project folder or explore the interactive keyboard shortcuts playground.',
    icon: <Rocket size={16} className="text-bodhi-accent" />
  }
]

export const WelcomeWalkthrough: React.FC = () => {
  const {
    isWalkthroughOpen,
    setWalkthroughOpen,
    completeWalkthrough,
    settings,
    updateSettings,
    openTab,
    toggleTerminal,
    toggleSplitEditor,
    isSplitEditorOpen,
    isTerminalOpen
  } = useEditorStore()

  const { openFolder } = useWorkspaceStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [apiKeyInput, setApiKeyInput] = useState(settings.aiApiKey || '')
  const [isApiKeySaved, setIsApiKeySaved] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(true)
  const [confettiActive, setConfettiActive] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    if (!isWalkthroughOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        if (currentStep < STEPS.length) handleNext()
        else handleClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentStep > 1) handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isWalkthroughOpen, currentStep])

  // Trigger confetti on final step
  useEffect(() => {
    if (currentStep === 4) {
      setConfettiActive(true)
      const timer = setTimeout(() => setConfettiActive(false), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [currentStep])

  if (!isWalkthroughOpen) return null

  const handleNext = (): void => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleClose = (): void => {
    if (dontShowAgain) {
      completeWalkthrough()
    } else {
      setWalkthroughOpen(false)
    }
  }

  const handleSaveApiKey = (): void => {
    const key = apiKeyInput.trim()
    if (!key) return
    updateSettings({ aiApiKey: key })
    setIsApiKeySaved(true)
    setTimeout(() => setIsApiKeySaved(false), 2500)
  }

  const handleLaunchPlayground = async (): Promise<void> => {
    handleClose()
    await openTab('welcome.ts', PLAYGROUND_SAMPLE_CODE)
  }

  const handleOpenFolderChoice = async (): Promise<void> => {
    handleClose()
    await openFolder()
  }

  return (
    <div
      className="fixed top-11 inset-x-0 bottom-0 z-[60] flex items-center justify-center p-4 select-none animate-fade-in overflow-hidden"
      style={{ backgroundColor: 'rgba(7, 9, 15, 0.82)', backdropFilter: 'blur(20px)' }}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 -left-10 w-72 h-72 rounded-full bg-bodhi-accent/15 blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/3 -right-10 w-72 h-72 rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Confetti Animation Elements */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[65]">
          {Array.from({ length: 35 }).map((_, i) => {
            const colors = ['#5DD62C', '#38BDF8', '#F43F5E', '#FBBF24', '#A855F7', '#34D399']
            const color = colors[i % colors.length]
            const left = `${(i * 2.8 + 2) % 96}%`
            const delay = `${(i % 8) * 0.12}s`
            const size = `${(i % 4) + 6}px`
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: i % 2 === 0 ? '50%' : '2px',
                  animation: `confetti-fall ${1.6 + (i % 3) * 0.3}s ease-out forwards`,
                  animationDelay: delay
                }}
              />
            )
          })}
        </div>
      )}

      {/* Clean Glassmorphic Card */}
      <div
        className="glass-panel-walkthrough relative w-full max-w-xl rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-bodhi-accent via-emerald-400 to-indigo-500" />

        {/* Header Bar */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <BodhiLogo size={32} className="rounded-lg animate-float-slow" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">BODHI</span>
              <span className="ml-2 text-[11px] text-bodhi-muted">Welcome Tour</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            title="Close (Esc)"
            className="p-1 rounded-lg text-bodhi-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step Content Container */}
        <div className="px-6 py-4 min-h-[290px] flex flex-col justify-between">
          <div className="animate-fade-in key={currentStep}">
            {/* Title & Subtitle */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                {STEPS[currentStep - 1].icon}
                <h2 className="text-lg font-bold text-white">
                  {STEPS[currentStep - 1].title}
                </h2>
              </div>
              <p className="text-xs text-bodhi-muted leading-relaxed">
                {STEPS[currentStep - 1].subtitle}
              </p>
            </div>

            {/* STEP 1: Themes & Styling */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'bodhi-cyber', label: 'Bodhi Cyber', color: '#5DD62C' },
                    { id: 'tokyo-night', label: 'Tokyo Night', color: '#7AA2F7' },
                    { id: 'night-owl', label: 'Night Owl', color: '#82AAFF' },
                    { id: 'monokai-pro', label: 'Monokai Pro', color: '#FFD866' },
                    { id: 'one-dark-pro', label: 'One Dark Pro', color: '#61AFEF' },
                    { id: 'nord', label: 'Nord Frost', color: '#88C0D0' }
                  ].map((item) => {
                    const isSelected = settings.theme === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => updateSettings({ theme: item.id, accentColor: item.color })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-bodhi-surface border-bodhi-accent shadow-sm shadow-bodhi-accent/20 scale-[1.02]'
                            : 'bg-bodhi-panel/50 border-white/5 hover:border-white/20 hover:bg-bodhi-surface/50'
                        }`}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`text-xs truncate ${isSelected ? 'text-white font-semibold' : 'text-bodhi-muted'}`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Font selector */}
                <div className="p-2.5 rounded-xl bg-bodhi-panel/40 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-bodhi-muted">Editor Font:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'fira-code', label: 'Fira Code' },
                      { id: 'cascadia-code', label: 'Cascadia' },
                      { id: 'jetbrains-mono', label: 'JetBrains' }
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => updateSettings({ fontTheme: font.id as any })}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors ${
                          settings.fontTheme === font.id
                            ? 'bg-bodhi-accent/20 text-bodhi-accent font-semibold border border-bodhi-accent/30'
                            : 'text-bodhi-muted hover:text-white'
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Ambient AI */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                {/* Clean Code Preview */}
                <div className="p-3.5 rounded-xl bg-bodhi-panel/60 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed shadow-inner">
                  <div className="text-bodhi-muted text-[11px] mb-1">// Press Ctrl + I on any selection to refactor</div>
                  <div>
                    <span className="text-indigo-400">async function</span> <span className="text-emerald-400">getUserData</span>(id: <span className="text-sky-400">string</span>) &#123;
                  </div>
                  <div className="pl-4 text-emerald-300/80 italic animate-pulse">
                    // ✨ Bodhi AI: streaming inline suggestions...
                  </div>
                  <div className="pl-4">
                    <span className="text-indigo-400">return await</span> db.users.findUnique(&#123; where: &#123; id &#125; &#125;);
                  </div>
                  <div>&#125;</div>
                </div>

                {/* Quick Key Entry */}
                <div className="p-3 rounded-xl bg-bodhi-panel/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-1.5 text-bodhi-accent font-medium">
                      <KeyRound size={13} />
                      <span>Configure AI API Key (Optional)</span>
                    </span>
                    <span className="text-[10px] text-bodhi-muted">Gemini or OpenAI</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                      placeholder="Paste your API key here..."
                      className="flex-1 bg-bodhi-surface px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-white placeholder-bodhi-muted focus:border-bodhi-accent outline-none font-mono"
                    />
                    <button
                      onClick={handleSaveApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="px-3 py-1.5 bg-bodhi-accent text-black font-bold text-xs rounded-lg hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                    >
                      {isApiKeySaved ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                  {isApiKeySaved && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 animate-fade-in mt-0.5">
                      <Check size={12} />
                      <span>Saved permanently on disk for all AI features.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Developer Power Tools */}
            {currentStep === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {/* Terminal Card */}
                <div className="p-4 rounded-xl bg-bodhi-panel/50 border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                      <Terminal size={15} className="text-bodhi-accent" />
                      <span>Integrated Terminal</span>
                    </div>
                    <p className="text-[11px] text-bodhi-muted leading-relaxed mb-3">
                      High-frequency 60fps shell running PowerShell, CMD, or Git Bash.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleTerminal()}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-bodhi-surface hover:bg-white/10 border border-white/10 text-xs font-medium text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isTerminalOpen ? 'Close Terminal' : 'Open Terminal'}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-bodhi-muted border border-white/10">
                      Ctrl + `
                    </kbd>
                  </button>
                </div>

                {/* Split Panes Card */}
                <div className="p-4 rounded-xl bg-bodhi-panel/50 border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                      <Columns size={15} className="text-bodhi-accent" />
                      <span>Split Panes</span>
                    </div>
                    <p className="text-[11px] text-bodhi-muted leading-relaxed mb-3">
                      Edit two files side-by-side with independent tab groups.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSplitEditor()}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-bodhi-surface hover:bg-white/10 border border-white/10 text-xs font-medium text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isSplitEditorOpen ? 'Single Pane' : 'Split Panes'}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-bodhi-muted border border-white/10">
                      Ctrl + \
                    </kbd>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Ready to Build */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Sandbox Guide */}
                  <button
                    onClick={handleLaunchPlayground}
                    className="p-4 rounded-xl bg-bodhi-accent/15 border-2 border-bodhi-accent hover:bg-bodhi-accent/20 text-left transition-all group flex flex-col justify-between shadow-md shadow-bodhi-accent/10 cursor-pointer"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-bodhi-accent text-black flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                        <Play size={14} />
                      </div>
                      <div className="text-xs font-bold text-white mb-1">Interactive Sandbox</div>
                      <div className="text-[11px] text-bodhi-muted leading-relaxed">
                        Practice shortcuts & AI with hands-on exercises in <code className="text-bodhi-accent font-mono">welcome.ts</code>.
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] font-bold text-bodhi-accent flex items-center gap-1">
                      <span>Launch</span>
                      <ArrowRight size={10} />
                    </div>
                  </button>

                  {/* Open Project */}
                  <button
                    onClick={handleOpenFolderChoice}
                    className="p-4 rounded-xl bg-bodhi-panel/60 border border-white/10 hover:border-white/30 hover:bg-bodhi-surface text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-bodhi-surface text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <FolderOpen size={14} />
                      </div>
                      <div className="text-xs font-bold text-white mb-1">Open Existing Folder</div>
                      <div className="text-[11px] text-bodhi-muted leading-relaxed">
                        Browse your disk to open a project repository right away.
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-bodhi-muted group-hover:text-white flex items-center gap-1 transition-colors">
                      <span>Browse</span>
                      <ArrowRight size={10} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Dots & Navigation Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    title={`Step ${step.id}: ${step.title}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step.id === currentStep
                        ? 'w-6 bg-bodhi-accent shadow-sm shadow-bodhi-accent/40'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <label className="flex items-center gap-1.5 text-[11px] text-bodhi-muted hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="accent-bodhi-accent rounded w-3 h-3 cursor-pointer"
                />
                <span>Don't show again</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-bodhi-surface hover:bg-white/10 text-xs text-bodhi-muted hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-bodhi-accent hover:brightness-110 active:scale-95 text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-md shadow-bodhi-accent/20 cursor-pointer"
              >
                <span>{currentStep === STEPS.length ? 'Start Coding' : 'Next'}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
