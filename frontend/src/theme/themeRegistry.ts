import * as monaco from 'monaco-editor'

export interface AccentColorOption {
  id: string
  name: string
  color: string
  hoverColor: string
  glowColor: string
}

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  type: 'dark' | 'light'
  previewColors: {
    bg: string
    sidebar: string
    panel: string
    accent: string
    text: string
  }
  cssVariables: {
    bg: string
    sidebar: string
    panel: string
    surface: string
    border: string
    active: string
    text: string
    muted: string
    selection: string
    accent: string
  }
  accentOptions: AccentColorOption[]
  monacoTheme: monaco.editor.IStandaloneThemeData
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    color: '#5DD62C',
    hoverColor: '#4ec023',
    glowColor: 'rgba(93, 214, 44, 0.35)'
  },
  {
    id: 'sage-jade',
    name: 'Sage Jade',
    color: '#8EB69B',
    hoverColor: '#7ea38b',
    glowColor: 'rgba(142, 182, 155, 0.35)'
  },
  {
    id: 'mint-foam',
    name: 'Mint Foam',
    color: '#DAF1DE',
    hoverColor: '#c5e6cb',
    glowColor: 'rgba(218, 241, 222, 0.35)'
  },
  {
    id: 'forest-pine',
    name: 'Forest Pine',
    color: '#235347',
    hoverColor: '#1d453b',
    glowColor: 'rgba(35, 83, 71, 0.35)'
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    color: '#38BDF8',
    hoverColor: '#0EA5E9',
    glowColor: 'rgba(56, 189, 248, 0.35)'
  },
  {
    id: 'purple-mauve',
    name: 'Neon Violet',
    color: '#C084FC',
    hoverColor: '#A855F7',
    glowColor: 'rgba(192, 132, 252, 0.35)'
  },
  {
    id: 'cyber-cyan',
    name: 'Aqua Cyan',
    color: '#22D3EE',
    hoverColor: '#06B6D4',
    glowColor: 'rgba(34, 211, 238, 0.35)'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Gold',
    color: '#FBBF24',
    hoverColor: '#F59E0B',
    glowColor: 'rgba(251, 191, 36, 0.35)'
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Rose',
    color: '#FB7185',
    hoverColor: '#F43F5E',
    glowColor: 'rgba(251, 113, 133, 0.35)'
  },
  {
    id: 'hot-pink',
    name: 'Hyper Pink',
    color: '#F472B6',
    hoverColor: '#EC4899',
    glowColor: 'rgba(244, 114, 182, 0.35)'
  }
]

export const THEMES: Record<string, ThemeDefinition> = {
  'bodhi-cyber': {
    id: 'bodhi-cyber',
    name: 'Bodhi Cyber Dark',
    description: 'Sleek modern dark (#111111) with shiny green accents, warm peach strings, sky-blue tags, and soothing syntax.',
    type: 'dark',
    previewColors: {
      bg: '#111111',
      sidebar: '#181818',
      panel: '#141414',
      accent: '#5DD62C',
      text: '#F4F4F4'
    },
    cssVariables: {
      bg: '#111111',
      sidebar: '#181818',
      panel: '#141414',
      surface: '#252525',
      border: '#2d2d2d',
      active: '#2a2a2a',
      text: '#F4F4F4',
      muted: '#9E9E9E',
      selection: '#5DD62C33',
      accent: '#5DD62C'
    },
    accentOptions: [
      { id: 'cc-emerald', name: 'Cyber Emerald', color: '#5DD62C', hoverColor: '#4ec023', glowColor: 'rgba(93, 214, 44, 0.35)' },
      { id: 'cc-cyan', name: 'Sky Cyan', color: '#38BDF8', hoverColor: '#0EA5E9', glowColor: 'rgba(56, 189, 248, 0.35)' },
      { id: 'cc-peach', name: 'Warm Peach', color: '#FB923C', hoverColor: '#F97316', glowColor: 'rgba(251, 146, 60, 0.35)' },
      { id: 'cc-rose', name: 'Rose Pink', color: '#F472B6', hoverColor: '#EC4899', glowColor: 'rgba(244, 114, 182, 0.35)' },
      { id: 'cc-sage', name: 'Sage Jade', color: '#8EB69B', hoverColor: '#7ea38b', glowColor: 'rgba(142, 182, 155, 0.35)' },
      { id: 'cc-gold', name: 'Sunset Gold', color: '#FBBF24', hoverColor: '#F59E0B', glowColor: 'rgba(251, 191, 36, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '788596', fontStyle: 'italic' },
        { token: 'keyword', foreground: '5DD62C' },
        { token: 'keyword.control', foreground: 'F472B6' },
        { token: 'keyword.flow', foreground: 'F472B6' },
        { token: 'identifier', foreground: 'F4F4F4' },
        { token: 'variable', foreground: 'F4F4F4' },
        { token: 'string', foreground: 'FB923C' },
        { token: 'string.quote', foreground: 'FB923C' },
        { token: 'string.html', foreground: 'FB923C' },
        { token: 'number', foreground: '86EFAC' },
        { token: 'type', foreground: '5EEAD4' },
        { token: 'function', foreground: '60A5FA' },
        { token: 'operator', foreground: 'CBD5E1' },
        { token: 'delimiter', foreground: 'CBD5E1' },
        { token: 'tag', foreground: '38BDF8' },
        { token: 'tag.html', foreground: '38BDF8' },
        { token: 'tag.xml', foreground: '38BDF8' },
        { token: 'attribute.name', foreground: 'FB923C' },
        { token: 'attribute.name.html', foreground: 'FB923C' },
        { token: 'attribute.value', foreground: 'FCD34D' },
        { token: 'constant.language', foreground: '38BDF8' },
        { token: 'heading.markdown', foreground: '5DD62C' },
        { token: 'header.markdown', foreground: '5DD62C' }
      ],
      colors: {
        'editor.background': '#111111',
        'editor.foreground': '#F4F4F4',
        'editor.lineHighlightBackground': '#282828',
        'editor.selectionBackground': '#5DD62C33',
        'editorCursor.foreground': '#5DD62C',
        'editorWhitespace.foreground': '#333333',
        'editorIndentGuide.background': '#2a2a2a',
        'editorIndentGuide.activeBackground': '#5DD62C88',
        'editorLineNumber.foreground': '#5a5a5a',
        'editorLineNumber.activeForeground': '#5DD62C',
        'editorGutter.background': '#111111'
      }
    }
  },

  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Clean dark theme inspired by the lights of downtown Tokyo. Soft and easy on the eyes.',
    type: 'dark',
    previewColors: {
      bg: '#1a1b26',
      sidebar: '#16161e',
      panel: '#1f2335',
      accent: '#7aa2f7',
      text: '#c0caf5'
    },
    cssVariables: {
      bg: '#1a1b26',
      sidebar: '#16161e',
      panel: '#1f2335',
      surface: '#24283b',
      border: '#292e42',
      active: '#2f354d',
      text: '#c0caf5',
      muted: '#787c99',
      selection: '#515c7e44',
      accent: '#7aa2f7'
    },
    accentOptions: [
      { id: 'tn-blue', name: 'Tokyo Sky', color: '#7aa2f7', hoverColor: '#608de8', glowColor: 'rgba(122, 162, 247, 0.35)' },
      { id: 'tn-purple', name: 'Neon Violet', color: '#bb9af7', hoverColor: '#a785e0', glowColor: 'rgba(187, 154, 247, 0.35)' },
      { id: 'tn-cyan', name: 'Laser Cyan', color: '#7dcfff', hoverColor: '#63bfe8', glowColor: 'rgba(125, 207, 255, 0.35)' },
      { id: 'tn-green', name: 'Spring Lime', color: '#9ece6a', hoverColor: '#88b857', glowColor: 'rgba(158, 206, 106, 0.35)' },
      { id: 'tn-red', name: 'Sunset Coral', color: '#f7768e', hoverColor: '#e05f77', glowColor: 'rgba(247, 118, 142, 0.35)' },
      { id: 'tn-orange', name: 'Tokyo Amber', color: '#ff9e64', hoverColor: '#e8874f', glowColor: 'rgba(255, 158, 100, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'bb9af7' },
        { token: 'identifier', foreground: 'c0caf5' },
        { token: 'string', foreground: '9ece6a' },
        { token: 'number', foreground: 'ff9e64' },
        { token: 'type', foreground: '2ac3de' },
        { token: 'function', foreground: '7aa2f7' },
        { token: 'operator', foreground: '89ddff' },
        { token: 'delimiter', foreground: '787c99' },
        { token: 'tag', foreground: 'f7768e' },
        { token: 'tag.html', foreground: 'f7768e' },
        { token: 'tag.xml', foreground: 'f7768e' },
        { token: 'attribute.name', foreground: 'bb9af7' },
        { token: 'attribute.name.html', foreground: 'bb9af7' },
        { token: 'attribute.value', foreground: '9ece6a' },
        { token: 'attribute.value.html', foreground: '9ece6a' },
        { token: 'heading.markdown', foreground: '7aa2f7' }
      ],
      colors: {
        'editor.background': '#1a1b26',
        'editor.foreground': '#c0caf5',
        'editor.lineHighlightBackground': '#1f2335',
        'editor.selectionBackground': '#515c7e44',
        'editorCursor.foreground': '#7aa2f7',
        'editorWhitespace.foreground': '#292e42',
        'editorIndentGuide.background': '#24283b',
        'editorIndentGuide.activeBackground': '#7aa2f766',
        'editorLineNumber.foreground': '#565f89',
        'editorLineNumber.activeForeground': '#7aa2f7',
        'editorGutter.background': '#1a1b26'
      }
    }
  },

  'catppuccin-mocha': {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    description: 'Soothing pastel dark theme with gentle contrast and warm accents.',
    type: 'dark',
    previewColors: {
      bg: '#1e1e2e',
      sidebar: '#181825',
      panel: '#11111b',
      accent: '#cba6f7',
      text: '#cdd6f4'
    },
    cssVariables: {
      bg: '#1e1e2e',
      sidebar: '#181825',
      panel: '#11111b',
      surface: '#313244',
      border: '#45475a',
      active: '#585b70',
      text: '#cdd6f4',
      muted: '#a6adc8',
      selection: '#585b7044',
      accent: '#cba6f7'
    },
    accentOptions: [
      { id: 'cat-mauve', name: 'Mocha Mauve', color: '#cba6f7', hoverColor: '#b48fee', glowColor: 'rgba(203, 166, 247, 0.35)' },
      { id: 'cat-lavender', name: 'Lavender Sky', color: '#b4befe', hoverColor: '#9ba7f5', glowColor: 'rgba(180, 190, 254, 0.35)' },
      { id: 'cat-sapphire', name: 'Sapphire Teal', color: '#74c7ec', hoverColor: '#5bb1d7', glowColor: 'rgba(116, 199, 236, 0.35)' },
      { id: 'cat-green', name: 'Pastel Green', color: '#a6e3a1', hoverColor: '#8ec989', glowColor: 'rgba(166, 227, 161, 0.35)' },
      { id: 'cat-peach', name: 'Warm Peach', color: '#fab387', hoverColor: '#e09b71', glowColor: 'rgba(250, 179, 135, 0.35)' },
      { id: 'cat-pink', name: 'Flamingo Pink', color: '#f5c2e7', hoverColor: '#dfa8d0', glowColor: 'rgba(245, 194, 231, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cba6f7' },
        { token: 'identifier', foreground: 'cdd6f4' },
        { token: 'string', foreground: 'a6e3a1' },
        { token: 'number', foreground: 'fab387' },
        { token: 'type', foreground: '89dceb' },
        { token: 'function', foreground: '89b4fa' },
        { token: 'operator', foreground: '94e2d5' },
        { token: 'delimiter', foreground: '9399b2' },
        { token: 'tag', foreground: 'f38ba8' },
        { token: 'tag.html', foreground: 'f38ba8' },
        { token: 'tag.xml', foreground: 'f38ba8' },
        { token: 'attribute.name', foreground: 'f9e2af' },
        { token: 'attribute.name.html', foreground: 'f9e2af' },
        { token: 'attribute.value', foreground: 'a6e3a1' },
        { token: 'heading.markdown', foreground: 'cba6f7' }
      ],
      colors: {
        'editor.background': '#1e1e2e',
        'editor.foreground': '#cdd6f4',
        'editor.lineHighlightBackground': '#31324444',
        'editor.selectionBackground': '#585b7044',
        'editorCursor.foreground': '#cba6f7',
        'editorWhitespace.foreground': '#45475a',
        'editorIndentGuide.background': '#313244',
        'editorIndentGuide.activeBackground': '#cba6f766',
        'editorLineNumber.foreground': '#6c7086',
        'editorLineNumber.activeForeground': '#cba6f7',
        'editorGutter.background': '#1e1e2e'
      }
    }
  },

  'one-dark-pro': {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    description: "Atom's legendary balanced syntax and UI theme with gentle contrast.",
    type: 'dark',
    previewColors: {
      bg: '#282c34',
      sidebar: '#21252b',
      panel: '#1b1d23',
      accent: '#61afef',
      text: '#abb2bf'
    },
    cssVariables: {
      bg: '#282c34',
      sidebar: '#21252b',
      panel: '#1b1d23',
      surface: '#2c313a',
      border: '#3e4451',
      active: '#4b5263',
      text: '#abb2bf',
      muted: '#5c6370',
      selection: '#3e445166',
      accent: '#61afef'
    },
    accentOptions: [
      { id: 'one-blue', name: 'Atom Blue', color: '#61afef', hoverColor: '#4b98d9', glowColor: 'rgba(97, 175, 239, 0.35)' },
      { id: 'one-cyan', name: 'Atom Cyan', color: '#56b6c2', hoverColor: '#429ea9', glowColor: 'rgba(86, 182, 194, 0.35)' },
      { id: 'one-green', name: 'Atom Green', color: '#98c379', hoverColor: '#80ab61', glowColor: 'rgba(152, 195, 121, 0.35)' },
      { id: 'one-purple', name: 'Atom Purple', color: '#c678dd', hoverColor: '#b060c7', glowColor: 'rgba(198, 120, 221, 0.35)' },
      { id: 'one-amber', name: 'Atom Amber', color: '#d19a66', hoverColor: '#b8824f', glowColor: 'rgba(209, 154, 102, 0.35)' },
      { id: 'one-coral', name: 'Atom Coral', color: '#e06c75', hoverColor: '#c8545e', glowColor: 'rgba(224, 108, 117, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'identifier', foreground: 'abb2bf' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' },
        { token: 'operator', foreground: '56b6c2' },
        { token: 'delimiter', foreground: 'abb2bf' },
        { token: 'tag', foreground: 'e06c75' },
        { token: 'tag.html', foreground: 'e06c75' },
        { token: 'tag.xml', foreground: 'e06c75' },
        { token: 'attribute.name', foreground: 'd19a66' },
        { token: 'attribute.name.html', foreground: 'd19a66' },
        { token: 'attribute.value', foreground: '98c379' },
        { token: 'heading.markdown', foreground: 'e06c75' }
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#2c313a',
        'editor.selectionBackground': '#3e445166',
        'editorCursor.foreground': '#528bff',
        'editorWhitespace.foreground': '#3b4048',
        'editorIndentGuide.background': '#3b4048',
        'editorIndentGuide.activeBackground': '#61afef66',
        'editorLineNumber.foreground': '#5c6370',
        'editorLineNumber.activeForeground': '#abb2bf',
        'editorGutter.background': '#282c34'
      }
    }
  },

  'nord-frost': {
    id: 'nord-frost',
    name: 'Nord Frost',
    description: 'Arctic darkness inspired by Scandinavian minimalism. Highly relaxing for long coding sessions.',
    type: 'dark',
    previewColors: {
      bg: '#2e3440',
      sidebar: '#242933',
      panel: '#1e222a',
      accent: '#88c0d0',
      text: '#eceff4'
    },
    cssVariables: {
      bg: '#2e3440',
      sidebar: '#242933',
      panel: '#1e222a',
      surface: '#3b4252',
      border: '#434c5e',
      active: '#4c566a',
      text: '#eceff4',
      muted: '#7b88a1',
      selection: '#434c5e66',
      accent: '#88c0d0'
    },
    accentOptions: [
      { id: 'nord-frost', name: 'Arctic Frost', color: '#88c0d0', hoverColor: '#70a8b8', glowColor: 'rgba(136, 192, 208, 0.35)' },
      { id: 'nord-glacier', name: 'Glacier Blue', color: '#81a1c1', hoverColor: '#6a8aa9', glowColor: 'rgba(129, 161, 193, 0.35)' },
      { id: 'nord-aurora-green', name: 'Aurora Green', color: '#a3be8c', hoverColor: '#8ca775', glowColor: 'rgba(163, 190, 140, 0.35)' },
      { id: 'nord-aurora-yellow', name: 'Aurora Gold', color: '#ebcb8b', hoverColor: '#d2b274', glowColor: 'rgba(235, 203, 139, 0.35)' },
      { id: 'nord-aurora-purple', name: 'Aurora Violet', color: '#b48ead', hoverColor: '#9c7695', glowColor: 'rgba(180, 142, 173, 0.35)' },
      { id: 'nord-aurora-orange', name: 'Aurora Sun', color: '#d08770', hoverColor: '#b76f59', glowColor: 'rgba(208, 135, 112, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
        { token: 'keyword', foreground: '81a1c1' },
        { token: 'identifier', foreground: 'eceff4' },
        { token: 'string', foreground: 'a3be8c' },
        { token: 'number', foreground: 'b48ead' },
        { token: 'type', foreground: '8fbcbb' },
        { token: 'function', foreground: '88c0d0' },
        { token: 'operator', foreground: '81a1c1' },
        { token: 'delimiter', foreground: 'd8dee9' },
        { token: 'tag', foreground: 'bf616a' },
        { token: 'tag.html', foreground: 'bf616a' },
        { token: 'tag.xml', foreground: 'bf616a' },
        { token: 'attribute.name', foreground: 'ebcb8b' },
        { token: 'attribute.name.html', foreground: 'ebcb8b' },
        { token: 'attribute.value', foreground: 'a3be8c' },
        { token: 'heading.markdown', foreground: '88c0d0' }
      ],
      colors: {
        'editor.background': '#2e3440',
        'editor.foreground': '#eceff4',
        'editor.lineHighlightBackground': '#3b4252',
        'editor.selectionBackground': '#434c5e66',
        'editorCursor.foreground': '#88c0d0',
        'editorWhitespace.foreground': '#434c5e',
        'editorIndentGuide.background': '#3b4252',
        'editorIndentGuide.activeBackground': '#88c0d066',
        'editorLineNumber.foreground': '#616e88',
        'editorLineNumber.activeForeground': '#88c0d0',
        'editorGutter.background': '#2e3440'
      }
    }
  },

  'gruvbox-dark': {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    description: 'Warm retro earthy palette with soft orange, amber, and olive tones for minimal eye strain.',
    type: 'dark',
    previewColors: {
      bg: '#282828',
      sidebar: '#1d2021',
      panel: '#141617',
      accent: '#fe8019',
      text: '#ebdbb2'
    },
    cssVariables: {
      bg: '#282828',
      sidebar: '#1d2021',
      panel: '#141617',
      surface: '#32302f',
      border: '#3c3836',
      active: '#504945',
      text: '#ebdbb2',
      muted: '#928374',
      selection: '#50494566',
      accent: '#fe8019'
    },
    accentOptions: [
      { id: 'gruv-orange', name: 'Warm Orange', color: '#fe8019', hoverColor: '#e06b0d', glowColor: 'rgba(254, 128, 25, 0.35)' },
      { id: 'gruv-yellow', name: 'Earthy Gold', color: '#fabd2f', hoverColor: '#dda31e', glowColor: 'rgba(250, 189, 47, 0.35)' },
      { id: 'gruv-green', name: 'Forest Moss', color: '#b8bb26', hoverColor: '#9fa11d', glowColor: 'rgba(184, 187, 38, 0.35)' },
      { id: 'gruv-aqua', name: 'Retro Aqua', color: '#8ec07c', hoverColor: '#74a663', glowColor: 'rgba(142, 192, 124, 0.35)' },
      { id: 'gruv-red', name: 'Rust Red', color: '#fb4934', hoverColor: '#dc3320', glowColor: 'rgba(251, 73, 52, 0.35)' },
      { id: 'gruv-purple', name: 'Dusty Purple', color: '#d3869b', hoverColor: '#ba6e83', glowColor: 'rgba(211, 134, 155, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '928374', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'fb4934' },
        { token: 'identifier', foreground: 'ebdbb2' },
        { token: 'string', foreground: 'b8bb26' },
        { token: 'number', foreground: 'd3869b' },
        { token: 'type', foreground: 'fabd2f' },
        { token: 'function', foreground: 'fe8019' },
        { token: 'operator', foreground: '8ec07c' },
        { token: 'delimiter', foreground: 'a89984' },
        { token: 'tag', foreground: 'fb4934' },
        { token: 'tag.html', foreground: 'fb4934' },
        { token: 'tag.xml', foreground: 'fb4934' },
        { token: 'attribute.name', foreground: 'fabd2f' },
        { token: 'attribute.name.html', foreground: 'fabd2f' },
        { token: 'attribute.value', foreground: 'b8bb26' },
        { token: 'heading.markdown', foreground: 'fe8019' }
      ],
      colors: {
        'editor.background': '#282828',
        'editor.foreground': '#ebdbb2',
        'editor.lineHighlightBackground': '#32302f',
        'editor.selectionBackground': '#50494566',
        'editorCursor.foreground': '#fe8019',
        'editorWhitespace.foreground': '#3c3836',
        'editorIndentGuide.background': '#32302f',
        'editorIndentGuide.activeBackground': '#fe801966',
        'editorLineNumber.foreground': '#7c6f64',
        'editorLineNumber.activeForeground': '#fe8019',
        'editorGutter.background': '#282828'
      }
    }
  },

  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    description: 'Iconic gothic dark theme with gentle purple, pink, and cyan tones.',
    type: 'dark',
    previewColors: {
      bg: '#282a36',
      sidebar: '#21222c',
      panel: '#191a21',
      accent: '#bd93f9',
      text: '#f8f8f2'
    },
    cssVariables: {
      bg: '#282a36',
      sidebar: '#21222c',
      panel: '#191a21',
      surface: '#44475a',
      border: '#6272a4',
      active: '#6272a488',
      text: '#f8f8f2',
      muted: '#6272a4',
      selection: '#44475a66',
      accent: '#bd93f9'
    },
    accentOptions: [
      { id: 'drac-purple', name: 'Vampire Purple', color: '#bd93f9', hoverColor: '#a578e2', glowColor: 'rgba(189, 147, 249, 0.35)' },
      { id: 'drac-pink', name: 'Gothic Pink', color: '#ff79c6', hoverColor: '#e85ea9', glowColor: 'rgba(255, 121, 198, 0.35)' },
      { id: 'drac-cyan', name: 'Ghost Cyan', color: '#8be9fd', hoverColor: '#70d2e6', glowColor: 'rgba(139, 233, 253, 0.35)' },
      { id: 'drac-green', name: 'Slime Green', color: '#50fa7b', hoverColor: '#39e063', glowColor: 'rgba(80, 250, 123, 0.35)' },
      { id: 'drac-orange', name: 'Blood Orange', color: '#ffb86c', hoverColor: '#e89f53', glowColor: 'rgba(255, 184, 108, 0.35)' },
      { id: 'drac-yellow', name: 'Crypt Yellow', color: '#f1fa8c', hoverColor: '#d6df73', glowColor: 'rgba(241, 250, 140, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'type', foreground: '8be9fd' },
        { token: 'function', foreground: '50fa7b' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'delimiter', foreground: 'f8f8f2' },
        { token: 'tag', foreground: 'ff79c6' },
        { token: 'tag.html', foreground: 'ff79c6' },
        { token: 'tag.xml', foreground: 'ff79c6' },
        { token: 'attribute.name', foreground: '50fa7b' },
        { token: 'attribute.name.html', foreground: '50fa7b' },
        { token: 'attribute.value', foreground: 'f1fa8c' },
        { token: 'heading.markdown', foreground: 'bd93f9' }
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a44',
        'editor.selectionBackground': '#44475a66',
        'editorCursor.foreground': '#ff79c6',
        'editorWhitespace.foreground': '#44475a',
        'editorIndentGuide.background': '#44475a',
        'editorIndentGuide.activeBackground': '#bd93f966',
        'editorLineNumber.foreground': '#6272a4',
        'editorLineNumber.activeForeground': '#f8f8f2',
        'editorGutter.background': '#282a36'
      }
    }
  },

  'monokai-pro': {
    id: 'monokai-pro',
    name: 'Monokai Pro',
    description: 'Sophisticated professional developer palette with balanced amber, magenta, and cyan text.',
    type: 'dark',
    previewColors: {
      bg: '#2d2a2e',
      sidebar: '#221f22',
      panel: '#19181a',
      accent: '#ffd866',
      text: '#fcfcfa'
    },
    cssVariables: {
      bg: '#2d2a2e',
      sidebar: '#221f22',
      panel: '#19181a',
      surface: '#363337',
      border: '#403e41',
      active: '#4d4a4e',
      text: '#fcfcfa',
      muted: '#939293',
      selection: '#5b595c55',
      accent: '#ffd866'
    },
    accentOptions: [
      { id: 'mono-amber', name: 'Monokai Gold', color: '#ffd866', hoverColor: '#e6be4e', glowColor: 'rgba(255, 216, 102, 0.35)' },
      { id: 'mono-magenta', name: 'Hot Magenta', color: '#ff6188', hoverColor: '#e6476e', glowColor: 'rgba(255, 97, 136, 0.35)' },
      { id: 'mono-lime', name: 'Electric Lime', color: '#a9dc76', hoverColor: '#90c25d', glowColor: 'rgba(169, 220, 118, 0.35)' },
      { id: 'mono-cyan', name: 'Bright Cyan', color: '#78dce8', hoverColor: '#5ec2ce', glowColor: 'rgba(120, 220, 232, 0.35)' },
      { id: 'mono-lavender', name: 'Pro Violet', color: '#ab9df2', hoverColor: '#9284d9', glowColor: 'rgba(171, 157, 242, 0.35)' },
      { id: 'mono-orange', name: 'Pro Tangerine', color: '#fc9867', hoverColor: '#e37f4e', glowColor: 'rgba(252, 152, 103, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '727072', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff6188' },
        { token: 'identifier', foreground: 'fcfcfa' },
        { token: 'string', foreground: 'ffd866' },
        { token: 'number', foreground: 'ab9df2' },
        { token: 'type', foreground: '78dce8' },
        { token: 'function', foreground: 'a9dc76' },
        { token: 'operator', foreground: 'ff6188' },
        { token: 'delimiter', foreground: '939293' },
        { token: 'tag', foreground: 'ff6188' },
        { token: 'tag.html', foreground: 'ff6188' },
        { token: 'tag.xml', foreground: 'ff6188' },
        { token: 'attribute.name', foreground: '78dce8' },
        { token: 'attribute.name.html', foreground: '78dce8' },
        { token: 'attribute.value', foreground: 'ffd866' },
        { token: 'heading.markdown', foreground: 'ffd866' }
      ],
      colors: {
        'editor.background': '#2d2a2e',
        'editor.foreground': '#fcfcfa',
        'editor.lineHighlightBackground': '#363337',
        'editor.selectionBackground': '#5b595c55',
        'editorCursor.foreground': '#ffd866',
        'editorWhitespace.foreground': '#403e41',
        'editorIndentGuide.background': '#363337',
        'editorIndentGuide.activeBackground': '#ffd86666',
        'editorLineNumber.foreground': '#727072',
        'editorLineNumber.activeForeground': '#ffd866',
        'editorGutter.background': '#2d2a2e'
      }
    }
  },

  'synthwave-84': {
    id: 'synthwave-84',
    name: 'Synthwave ’84',
    description: 'Neon magenta, laser cyan, and golden sunset glow inspired by 80s outrun aesthetics.',
    type: 'dark',
    previewColors: {
      bg: '#241b2f',
      sidebar: '#1d1526',
      panel: '#17101f',
      accent: '#ff7edb',
      text: '#f0eff1'
    },
    cssVariables: {
      bg: '#241b2f',
      sidebar: '#1d1526',
      panel: '#17101f',
      surface: '#2e223c',
      border: '#3c2c4f',
      active: '#493660',
      text: '#f0eff1',
      muted: '#847496',
      selection: '#ff7edb33',
      accent: '#ff7edb'
    },
    accentOptions: [
      { id: 'sw-magenta', name: 'Laser Magenta', color: '#ff7edb', hoverColor: '#e665c2', glowColor: 'rgba(255, 126, 219, 0.35)' },
      { id: 'sw-cyan', name: 'Grid Cyan', color: '#36f9f6', hoverColor: '#1de0dd', glowColor: 'rgba(54, 249, 246, 0.35)' },
      { id: 'sw-sunset', name: 'Sunset Gold', color: '#fed37f', hoverColor: '#e5ba66', glowColor: 'rgba(254, 211, 127, 0.35)' },
      { id: 'sw-orange', name: 'Outrun Orange', color: '#ff8b39', hoverColor: '#e67220', glowColor: 'rgba(255, 139, 57, 0.35)' },
      { id: 'sw-crimson', name: 'Neon Crimson', color: '#fe4450', hoverColor: '#e52b37', glowColor: 'rgba(254, 68, 80, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '614d85', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7edb' },
        { token: 'identifier', foreground: 'f0eff1' },
        { token: 'string', foreground: 'ff8b39' },
        { token: 'number', foreground: 'f97e72' },
        { token: 'type', foreground: 'fe4450' },
        { token: 'function', foreground: '36f9f6' },
        { token: 'operator', foreground: 'fed37f' },
        { token: 'delimiter', foreground: 'b6b1be' },
        { token: 'tag', foreground: 'ff7edb' },
        { token: 'tag.html', foreground: 'ff7edb' },
        { token: 'tag.xml', foreground: 'ff7edb' },
        { token: 'attribute.name', foreground: '36f9f6' },
        { token: 'attribute.name.html', foreground: '36f9f6' },
        { token: 'attribute.value', foreground: 'ff8b39' },
        { token: 'heading.markdown', foreground: 'ff7edb' }
      ],
      colors: {
        'editor.background': '#241b2f',
        'editor.foreground': '#f0eff1',
        'editor.lineHighlightBackground': '#2e223c',
        'editor.selectionBackground': '#ff7edb33',
        'editorCursor.foreground': '#ff7edb',
        'editorWhitespace.foreground': '#3c2c4f',
        'editorIndentGuide.background': '#2e223c',
        'editorIndentGuide.activeBackground': '#ff7edb66',
        'editorLineNumber.foreground': '#614d85',
        'editorLineNumber.activeForeground': '#ff7edb',
        'editorGutter.background': '#241b2f'
      }
    }
  },

  'matrix-green': {
    id: 'matrix-green',
    name: 'Matrix Phosphor CRT',
    description: 'Clean monochrome phosphor green terminal matrix code theme without eye fatigue.',
    type: 'dark',
    previewColors: {
      bg: '#050c05',
      sidebar: '#030803',
      panel: '#020502',
      accent: '#00ff66',
      text: '#44ff88'
    },
    cssVariables: {
      bg: '#050c05',
      sidebar: '#030803',
      panel: '#020502',
      surface: '#091709',
      border: '#0f290f',
      active: '#143814',
      text: '#44ff88',
      muted: '#1e5e2e',
      selection: '#00ff6622',
      accent: '#00ff66'
    },
    accentOptions: [
      { id: 'mx-phosphor', name: 'Phosphor Green', color: '#00ff66', hoverColor: '#00e65c', glowColor: 'rgba(0, 255, 102, 0.35)' },
      { id: 'mx-mint', name: 'Matrix Mint', color: '#44ff88', hoverColor: '#2be66f', glowColor: 'rgba(68, 255, 136, 0.35)' },
      { id: 'mx-lime', name: 'Digital Lime', color: '#88ffaa', hoverColor: '#6fe691', glowColor: 'rgba(136, 255, 170, 0.35)' },
      { id: 'mx-emerald', name: 'Deep Emerald', color: '#00dd55', hoverColor: '#00c44b', glowColor: 'rgba(0, 221, 85, 0.35)' },
      { id: 'mx-cyan', name: 'Terminal Cyan', color: '#00ffcc', hoverColor: '#00e6b8', glowColor: 'rgba(0, 255, 204, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '1f6932', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00ff66' },
        { token: 'identifier', foreground: '44ff88' },
        { token: 'string', foreground: '88ffaa' },
        { token: 'number', foreground: '00dd55' },
        { token: 'type', foreground: '00ffaa' },
        { token: 'function', foreground: '66ff99' },
        { token: 'operator', foreground: '00ff66' },
        { token: 'delimiter', foreground: '33cc66' },
        { token: 'tag', foreground: '00ffaa' },
        { token: 'tag.html', foreground: '00ffaa' },
        { token: 'tag.xml', foreground: '00ffaa' },
        { token: 'attribute.name', foreground: '88ffaa' },
        { token: 'attribute.name.html', foreground: '88ffaa' },
        { token: 'attribute.value', foreground: '33ff77' },
        { token: 'heading.markdown', foreground: '00ff66' }
      ],
      colors: {
        'editor.background': '#050c05',
        'editor.foreground': '#44ff88',
        'editor.lineHighlightBackground': '#0a1a0a',
        'editor.selectionBackground': '#00ff6622',
        'editorCursor.foreground': '#00ff66',
        'editorWhitespace.foreground': '#0f290f',
        'editorIndentGuide.background': '#091709',
        'editorIndentGuide.activeBackground': '#00ff6666',
        'editorLineNumber.foreground': '#1e5e2e',
        'editorLineNumber.activeForeground': '#00ff66',
        'editorGutter.background': '#050c05'
      }
    }
  },

  'cyberpunk-2077': {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    description: 'Electric yellow, cyber cyan, and magenta text aesthetics.',
    type: 'dark',
    previewColors: {
      bg: '#121016',
      sidebar: '#0c0b0f',
      panel: '#070609',
      accent: '#fcee0a',
      text: '#f2f1f5'
    },
    cssVariables: {
      bg: '#121016',
      sidebar: '#0c0b0f',
      panel: '#070609',
      surface: '#1c1924',
      border: '#2a2538',
      active: '#39334c',
      text: '#f2f1f5',
      muted: '#82789e',
      selection: '#fcee0a25',
      accent: '#fcee0a'
    },
    accentOptions: [
      { id: 'cp-yellow', name: 'Night City Yellow', color: '#fcee0a', hoverColor: '#e3d508', glowColor: 'rgba(252, 238, 10, 0.35)' },
      { id: 'cp-cyan', name: 'Trauma Cyan', color: '#00f0ff', hoverColor: '#00d7e5', glowColor: 'rgba(0, 240, 255, 0.35)' },
      { id: 'cp-magenta', name: 'Hot Pink', color: '#ff007f', hoverColor: '#e50072', glowColor: 'rgba(255, 0, 127, 0.35)' },
      { id: 'cp-red', name: 'Arasaka Red', color: '#ff003c', hoverColor: '#e50036', glowColor: 'rgba(255, 0, 60, 0.35)' },
      { id: 'cp-violet', name: 'Neon Violet', color: '#9d00ff', hoverColor: '#8c00e5', glowColor: 'rgba(157, 0, 255, 0.35)' },
      { id: 'cp-green', name: 'Netrunner Green', color: '#00ff9f', hoverColor: '#00e58e', glowColor: 'rgba(0, 255, 159, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5d5573', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'fcee0a' },
        { token: 'identifier', foreground: 'f2f1f5' },
        { token: 'string', foreground: '00f0ff' },
        { token: 'number', foreground: 'ff003c' },
        { token: 'type', foreground: '00ff9f' },
        { token: 'function', foreground: 'ff007f' },
        { token: 'operator', foreground: 'fcee0a' },
        { token: 'delimiter', foreground: '9d00ff' },
        { token: 'tag', foreground: 'ff007f' },
        { token: 'tag.html', foreground: 'ff007f' },
        { token: 'tag.xml', foreground: 'ff007f' },
        { token: 'attribute.name', foreground: '00f0ff' },
        { token: 'attribute.name.html', foreground: '00f0ff' },
        { token: 'attribute.value', foreground: 'fcee0a' },
        { token: 'heading.markdown', foreground: 'fcee0a' }
      ],
      colors: {
        'editor.background': '#121016',
        'editor.foreground': '#f2f1f5',
        'editor.lineHighlightBackground': '#1c1924',
        'editor.selectionBackground': '#fcee0a25',
        'editorCursor.foreground': '#fcee0a',
        'editorWhitespace.foreground': '#2a2538',
        'editorIndentGuide.background': '#1c1924',
        'editorIndentGuide.activeBackground': '#fcee0a66',
        'editorLineNumber.foreground': '#5d5573',
        'editorLineNumber.activeForeground': '#fcee0a',
        'editorGutter.background': '#121016'
      }
    }
  },

  'shades-of-purple': {
    id: 'shades-of-purple',
    name: 'Shades of Purple',
    description: 'Royal violet background with warm yellow & electric cyan text.',
    type: 'dark',
    previewColors: {
      bg: '#2d2b55',
      sidebar: '#222044',
      panel: '#1a1835',
      accent: '#fad000',
      text: '#ffffff'
    },
    cssVariables: {
      bg: '#2d2b55',
      sidebar: '#222044',
      panel: '#1a1835',
      surface: '#363366',
      border: '#454180',
      active: '#545099',
      text: '#ffffff',
      muted: '#a599e9',
      selection: '#b362ff33',
      accent: '#fad000'
    },
    accentOptions: [
      { id: 'sop-gold', name: 'Electric Gold', color: '#fad000', hoverColor: '#e0ba00', glowColor: 'rgba(250, 208, 0, 0.35)' },
      { id: 'sop-cyan', name: 'Electric Cyan', color: '#00f6ff', hoverColor: '#00dcde', glowColor: 'rgba(0, 246, 255, 0.35)' },
      { id: 'sop-pink', name: 'Royal Pink', color: '#ff628c', hoverColor: '#e64f77', glowColor: 'rgba(255, 98, 140, 0.35)' },
      { id: 'sop-green', name: 'Laser Lime', color: '#a5ff90', hoverColor: '#8ee679', glowColor: 'rgba(165, 255, 144, 0.35)' },
      { id: 'sop-purple', name: 'Neon Violet', color: '#b362ff', hoverColor: '#9e4ee6', glowColor: 'rgba(179, 98, 255, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'b362ff', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff628c' },
        { token: 'identifier', foreground: 'ffffff' },
        { token: 'string', foreground: 'a5ff90' },
        { token: 'number', foreground: 'ff9d00' },
        { token: 'type', foreground: '00f6ff' },
        { token: 'function', foreground: 'fad000' },
        { token: 'operator', foreground: 'ff628c' },
        { token: 'delimiter', foreground: '9effff' },
        { token: 'tag', foreground: 'ff628c' },
        { token: 'tag.html', foreground: 'ff628c' },
        { token: 'tag.xml', foreground: 'ff628c' },
        { token: 'attribute.name', foreground: 'fad000' },
        { token: 'attribute.name.html', foreground: 'fad000' },
        { token: 'attribute.value', foreground: 'a5ff90' },
        { token: 'heading.markdown', foreground: 'fad000' }
      ],
      colors: {
        'editor.background': '#2d2b55',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#363366',
        'editor.selectionBackground': '#b362ff33',
        'editorCursor.foreground': '#fad000',
        'editorWhitespace.foreground': '#454180',
        'editorIndentGuide.background': '#363366',
        'editorIndentGuide.activeBackground': '#fad00066',
        'editorLineNumber.foreground': '#a599e9',
        'editorLineNumber.activeForeground': '#fad000',
        'editorGutter.background': '#2d2b55'
      }
    }
  },

  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark',
    description: 'Official GitHub dark color palette with easy-on-the-eyes syntax.',
    type: 'dark',
    previewColors: {
      bg: '#0d1117',
      sidebar: '#16161b',
      panel: '#010409',
      accent: '#58a6ff',
      text: '#c9d1d9'
    },
    cssVariables: {
      bg: '#0d1117',
      sidebar: '#16161b',
      panel: '#010409',
      surface: '#21262d',
      border: '#30363d',
      active: '#383e47',
      text: '#c9d1d9',
      muted: '#8b949e',
      selection: '#1f6feb33',
      accent: '#58a6ff'
    },
    accentOptions: [
      { id: 'gh-blue', name: 'GitHub Blue', color: '#58a6ff', hoverColor: '#4290e6', glowColor: 'rgba(88, 166, 255, 0.35)' },
      { id: 'gh-green', name: 'Commit Green', color: '#3fb950', hoverColor: '#2ea03e', glowColor: 'rgba(63, 185, 80, 0.35)' },
      { id: 'gh-purple', name: 'Merged Purple', color: '#bc8cff', hoverColor: '#a673ee', glowColor: 'rgba(188, 140, 255, 0.35)' },
      { id: 'gh-orange', name: 'Issue Orange', color: '#ffa657', hoverColor: '#e69042', glowColor: 'rgba(255, 166, 87, 0.35)' },
      { id: 'gh-pink', name: 'Sponsor Pink', color: '#f778ba', hoverColor: '#df61a3', glowColor: 'rgba(247, 120, 186, 0.35)' },
      { id: 'gh-cyan', name: 'Action Cyan', color: '#56d4dd', hoverColor: '#40bbc4', glowColor: 'rgba(86, 212, 221, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'identifier', foreground: 'c9d1d9' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'operator', foreground: 'ff7b72' },
        { token: 'delimiter', foreground: 'c9d1d9' },
        { token: 'tag', foreground: '7ee787' },
        { token: 'tag.html', foreground: '7ee787' },
        { token: 'tag.xml', foreground: '7ee787' },
        { token: 'attribute.name', foreground: '79c0ff' },
        { token: 'attribute.name.html', foreground: '79c0ff' },
        { token: 'attribute.value', foreground: 'a5d6ff' },
        { token: 'heading.markdown', foreground: '58a6ff' }
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#161b22',
        'editor.selectionBackground': '#1f6feb33',
        'editorCursor.foreground': '#58a6ff',
        'editorWhitespace.foreground': '#30363d',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#58a6ff66',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#c9d1d9',
        'editorGutter.background': '#0d1117'
      }
    }
  },

  'github-light': {
    id: 'github-light',
    name: 'GitHub Light',
    description: 'Crisp and elegant GitHub light workspace with classic syntax text.',
    type: 'light',
    previewColors: {
      bg: '#ffffff',
      sidebar: '#f6f8fa',
      panel: '#eaeef2',
      accent: '#0969da',
      text: '#1f2328'
    },
    cssVariables: {
      bg: '#ffffff',
      sidebar: '#f6f8fa',
      panel: '#eaeef2',
      surface: '#f3f4f6',
      border: '#d0d7de',
      active: '#e5e7eb',
      text: '#1f2328',
      muted: '#656d76',
      selection: '#0969da18',
      accent: '#0969da'
    },
    accentOptions: [
      { id: 'ghl-blue', name: 'Premier Blue', color: '#0969da', hoverColor: '#0553b1', glowColor: 'rgba(9, 105, 218, 0.35)' },
      { id: 'ghl-green', name: 'Success Green', color: '#1a7f37', hoverColor: '#12672b', glowColor: 'rgba(26, 127, 55, 0.35)' },
      { id: 'ghl-purple', name: 'Purple Plum', color: '#8250df', hoverColor: '#6e3bc7', glowColor: 'rgba(130, 80, 223, 0.35)' },
      { id: 'ghl-orange', name: 'Amber Orange', color: '#bc4c00', hoverColor: '#9f3e00', glowColor: 'rgba(188, 76, 0, 0.35)' },
      { id: 'ghl-red', name: 'Coral Red', color: '#cf222e', hoverColor: '#b01924', glowColor: 'rgba(207, 34, 46, 0.35)' }
    ],
    monacoTheme: {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cf222e' },
        { token: 'identifier', foreground: '1f2328' },
        { token: 'string', foreground: '0a3069' },
        { token: 'number', foreground: '0550ae' },
        { token: 'type', foreground: '953800' },
        { token: 'function', foreground: '8250df' },
        { token: 'operator', foreground: 'cf222e' },
        { token: 'delimiter', foreground: '1f2328' },
        { token: 'tag', foreground: '116329' },
        { token: 'tag.html', foreground: '116329' },
        { token: 'tag.xml', foreground: '116329' },
        { token: 'attribute.name', foreground: '0550ae' },
        { token: 'attribute.name.html', foreground: '0550ae' },
        { token: 'attribute.value', foreground: '0a3069' },
        { token: 'heading.markdown', foreground: '0969da' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1f2328',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editor.selectionBackground': '#0969da18',
        'editorCursor.foreground': '#0969da',
        'editorWhitespace.foreground': '#d0d7de',
        'editorIndentGuide.background': '#e5e7eb',
        'editorIndentGuide.activeBackground': '#0969da66',
        'editorLineNumber.foreground': '#8c959f',
        'editorLineNumber.activeForeground': '#1f2328',
        'editorGutter.background': '#ffffff'
      }
    }
  }
}

/**
 * Returns at least 5-6 curated accent color options tailored for the given theme
 */
export function getAccentsForTheme(themeId?: string): AccentColorOption[] {
  const theme = (themeId && THEMES[themeId]) ? THEMES[themeId] : THEMES['bodhi-cyber']
  return theme.accentOptions && theme.accentOptions.length >= 5 ? theme.accentOptions : ACCENT_COLORS
}

/**
 * Registers all themes with Monaco Editor, dynamically harmonizing syntax text colors
 */
export function registerMonacoThemes(
  monacoInstance: typeof monaco,
  customAccent = '#5DD62C'
): void {
  const accentHex = customAccent.replace('#', '')

  for (const [themeId, theme] of Object.entries(THEMES)) {
    try {
      if (themeId === 'bodhi-cyber') {
        // Dynamically tailor keywords, operators, cursor and line highlight to active accent color
        const dynamicCyberTheme: monaco.editor.IStandaloneThemeData = {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '788596', fontStyle: 'italic' },
            { token: 'keyword', foreground: accentHex },
            { token: 'keyword.control', foreground: 'F472B6' },
            { token: 'keyword.flow', foreground: 'F472B6' },
            { token: 'identifier', foreground: 'F4F4F4' },
            { token: 'variable', foreground: 'F4F4F4' },
            { token: 'string', foreground: 'FB923C' },
            { token: 'string.quote', foreground: 'FB923C' },
            { token: 'string.html', foreground: 'FB923C' },
            { token: 'number', foreground: '86EFAC' },
            { token: 'type', foreground: '5EEAD4' },
            { token: 'function', foreground: '60A5FA' },
            { token: 'operator', foreground: 'CBD5E1' },
            { token: 'delimiter', foreground: 'CBD5E1' },
            { token: 'tag', foreground: '38BDF8' },
            { token: 'tag.html', foreground: '38BDF8' },
            { token: 'tag.xml', foreground: '38BDF8' },
            { token: 'attribute.name', foreground: 'FB923C' },
            { token: 'attribute.name.html', foreground: 'FB923C' },
            { token: 'attribute.value', foreground: 'FCD34D' },
            { token: 'constant.language', foreground: '38BDF8' },
            { token: 'heading.markdown', foreground: accentHex },
            { token: 'header.markdown', foreground: accentHex }
          ],
          colors: {
            'editor.background': '#111111',
            'editor.foreground': '#F4F4F4',
            'editor.lineHighlightBackground': '#282828',
            'editor.selectionBackground': `#${accentHex}33`,
            'editorCursor.foreground': `#${accentHex}`,
            'editorWhitespace.foreground': '#333333',
            'editorIndentGuide.background': '#2a2a2a',
            'editorIndentGuide.activeBackground': `#${accentHex}88`,
            'editorLineNumber.foreground': '#5a5a5a',
            'editorLineNumber.activeForeground': `#${accentHex}`,
            'editorGutter.background': '#111111'
          }
        }
        monacoInstance.editor.defineTheme('bodhi-cyber', dynamicCyberTheme)
      } else {
        monacoInstance.editor.defineTheme(themeId, theme.monacoTheme)
      }
    } catch {
      // Ignore if already registered
    }
  }
}

/**
 * Applies CSS variables and sets Monaco editor theme dynamically
 */
export function applyThemeAndAccent(themeId: string, customAccent?: string): void {
  const theme = THEMES[themeId] || THEMES['bodhi-cyber']
  const root = document.documentElement

  const activeAccent = customAccent || theme.cssVariables.accent

  // Set CSS variables on root
  root.style.setProperty('--bodhi-bg', theme.cssVariables.bg)
  root.style.setProperty('--bodhi-sidebar', theme.cssVariables.sidebar)
  root.style.setProperty('--bodhi-panel', theme.cssVariables.panel)
  root.style.setProperty('--bodhi-surface', theme.cssVariables.surface)
  root.style.setProperty('--bodhi-border', theme.cssVariables.border)
  root.style.setProperty('--bodhi-active', theme.cssVariables.active)
  root.style.setProperty('--bodhi-text', theme.cssVariables.text)
  root.style.setProperty('--bodhi-muted', theme.cssVariables.muted)
  root.style.setProperty('--bodhi-selection', theme.cssVariables.selection)
  root.style.setProperty('--bodhi-accent', activeAccent)

  // Derive accent hover and subtle glow
  root.style.setProperty('--bodhi-accent-hover', activeAccent)
  root.style.setProperty('--bodhi-accent-glow', `${activeAccent}40`)

  if (theme.type === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
  }

  // Update Monaco theme and dynamic text syntax token colors if loaded
  if (typeof monaco !== 'undefined' && typeof monaco.editor?.defineTheme === 'function') {
    try {
      registerMonacoThemes(monaco, activeAccent)
      monaco.editor.setTheme(themeId)
    } catch {
      // Fallback
    }
  }
}
