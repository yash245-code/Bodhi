import type { Config } from 'tailwindcss'

// Shared color palette — all pointing to --bodhi-* CSS variables defined in index.css
const bodhiColors = {
  bg: 'var(--bodhi-bg, #111111)',
  sidebar: 'var(--bodhi-sidebar, #181818)',
  panel: 'var(--bodhi-panel, #141414)',
  surface: 'var(--bodhi-surface, #252525)',
  border: 'var(--bodhi-border, #2d2d2d)',
  active: 'var(--bodhi-active, #2a2a2a)',
  accent: 'var(--bodhi-accent, #5DD62C)',
  accentHover: 'var(--bodhi-accent-hover, #4ec023)',
  accentSecondary: 'var(--bodhi-selection, #337418)',
  text: 'var(--bodhi-text, #F4F4F4)',
  muted: 'var(--bodhi-muted, #9E9E9E)',
  selection: 'var(--bodhi-selection, #5DD62C33)'
}

export default {
  content: [
    './frontend/index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
    '../frontend/index.html',
    '../frontend/src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BODHI (uppercase) — used in most component files as bg-BODHI-bg, text-BODHI-text etc.
        BODHI: bodhiColors,
        // bodhi (lowercase) — used in App.tsx and some other files
        bodhi: bodhiColors,
        // cortex — legacy alias used in SettingsWindow and ExtensionsWindow
        cortex: bodhiColors
      },
      fontFamily: {
        mono: ['Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
