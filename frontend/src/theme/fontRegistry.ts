export interface FontTheme {
  id: string
  name: string
  vibe: string
  description: string
  fontFamily: string
  fontLigatures: boolean | string
  letterSpacing: number
  lineHeightMultiplier: number
  fontWeight: string
  className: string
  sampleCode: string
  badge?: string
}

export const FONT_THEMES: Record<string, FontTheme> = {
  'fira-code': {
    id: 'fira-code',
    name: 'Cyber Hacker',
    vibe: '⚡ Modern Ligatures',
    description: 'High-tech coding font with clear programming ligatures (=>, !==, ===, <!--, ->).',
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    letterSpacing: 0.3,
    lineHeightMultiplier: 1.6,
    fontWeight: '400',
    className: 'font-vibe-cyber',
    sampleCode: 'const solve = (a, b) => a !== b && x <= 100 // ligatures',
    badge: 'Popular'
  },
  'jetbrains-mono': {
    id: 'jetbrains-mono',
    name: 'Modern Studio',
    vibe: '💎 Clean & Ergonomic Focus',
    description: 'Crisp, high-legibility geometric letterforms engineered specifically for extended developer focus.',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLigatures: true,
    letterSpacing: 0.2,
    lineHeightMultiplier: 1.65,
    fontWeight: '400',
    className: 'font-vibe-studio',
    sampleCode: 'export async function computeMatrix(data: Float64Array): Promise<void>',
    badge: 'Editor Choice'
  },
  'cascadia-flow': {
    id: 'cascadia-flow',
    name: 'Operator Flow',
    vibe: '✨ Elegant & Cursive Italic',
    description: 'Smooth luxury developer aesthetic with flowing cursive italic comments and keywords.',
    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
    fontLigatures: true,
    letterSpacing: 0.35,
    lineHeightMultiplier: 1.7,
    fontWeight: '400',
    className: 'font-vibe-operator',
    sampleCode: '/* Cursive italic comments with sleek operator balance */',
    badge: 'Aesthetic'
  },
  'retro-crt': {
    id: 'retro-crt',
    name: '80s Cyberdeck / CRT',
    vibe: '🕹️ Retro Sci-Fi Terminal',
    description: 'Nostalgic monospace terminal vibe with generous character spacing.',
    fontFamily: "'Share Tech Mono', 'VT323', 'Courier New', monospace",
    fontLigatures: false,
    letterSpacing: 0.75,
    lineHeightMultiplier: 1.55,
    fontWeight: '400',
    className: 'font-vibe-retro',
    sampleCode: 'SYSTEM.EXEC // AUTH_KEY: 0xDEADBEEF // OVERRIDE_BUFFER(1);',
    badge: 'Retro'
  },
  'space-mono': {
    id: 'space-mono',
    name: 'Typewriter Editorial',
    vibe: '📜 Mechanical Slab-Serif',
    description: 'Geometric slab-serif monospace with mechanical rhythm and eccentric editorial personality.',
    fontFamily: "'Space Mono', 'Courier Prime', Courier, monospace",
    fontLigatures: false,
    letterSpacing: 0.5,
    lineHeightMultiplier: 1.75,
    fontWeight: '400',
    className: 'font-vibe-editorial',
    sampleCode: 'def process_manuscript(edition: int) -> Story:',
    badge: 'Vintage'
  },
  'arcade-pixel': {
    id: 'arcade-pixel',
    name: 'Arcade 8-Bit Pixel',
    vibe: '👾 Chiptune Retro Gaming',
    description: 'Playful pixel-art glyphs bringing a nostalgic arcade cabinet gaming vibe to your source code.',
    fontFamily: "'Silkscreen', 'Press Start 2P', monospace",
    fontLigatures: false,
    letterSpacing: 0.6,
    lineHeightMultiplier: 1.6,
    fontWeight: '400',
    className: 'font-vibe-pixel',
    sampleCode: 'SCORE += 1000; LEVEL_UP(PLAYER_1);',
    badge: 'Arcade'
  },
  'ibm-plex': {
    id: 'ibm-plex',
    name: 'Industrial Precision',
    vibe: '🏢 Modernist Engineering',
    description: 'Stark, engineered modernist clarity designed for high information density and structural precision.',
    fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
    fontLigatures: false,
    letterSpacing: 0.2,
    lineHeightMultiplier: 1.6,
    fontWeight: '400',
    className: 'font-vibe-industrial',
    sampleCode: 'class NetworkProtocolHandler implements SocketListener {',
    badge: 'Minimal'
  },
  'custom': {
    id: 'custom',
    name: 'Custom Monospace',
    vibe: '⚙️ User Configured',
    description: 'Use your custom font family configured in BODHI EDITOR Settings.',
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    letterSpacing: 0,
    lineHeightMultiplier: 1.6,
    fontWeight: '400',
    className: 'font-vibe-custom',
    sampleCode: '// Configured via Editor Settings FontFamily',
    badge: 'Custom'
  }
}

export function getFontTheme(id?: string): FontTheme {
  if (id && FONT_THEMES[id]) {
    return FONT_THEMES[id]
  }
  return FONT_THEMES['fira-code']
}
