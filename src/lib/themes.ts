export interface ThemeColors {
  '--color-bamboo-white': string;
  '--color-paper-white': string;
  '--color-tea-beige': string;
  '--color-editor-paper': string;
  '--color-bamboo-green': string;
  '--color-bamboo-deep': string;
  '--color-ink-green': string;
  '--color-ink-muted': string;
  '--color-accent-orange': string;
  '--color-accent-purple': string;
  '--color-accent-yellow': string;
  '--color-accent-blue': string;
}

export interface Theme {
  key: string;
  label: string;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    key: 'bamboo',
    label: '竹林清风',
    colors: {
      '--color-bamboo-white': '#f2f6f0',
      '--color-paper-white': '#fafaf7',
      '--color-tea-beige': '#f6f3ed',
      '--color-editor-paper': '#fffef9',
      '--color-bamboo-green': '#6b9b6b',
      '--color-bamboo-deep': '#4a7c4a',
      '--color-ink-green': '#3d4a3d',
      '--color-ink-muted': 'rgba(61,74,61,0.6)',
      '--color-accent-orange': '#f0a060',
      '--color-accent-purple': '#b895b0',
      '--color-accent-yellow': '#e8c560',
      '--color-accent-blue': '#7db8c4',
    },
  },
  {
    key: 'sakura',
    label: '樱吹雪',
    colors: {
      '--color-bamboo-white': '#fdf5f7',
      '--color-paper-white': '#fefafb',
      '--color-tea-beige': '#faf0f3',
      '--color-editor-paper': '#fffafa',
      '--color-bamboo-green': '#c4828e',
      '--color-bamboo-deep': '#a86878',
      '--color-ink-green': '#4a2c34',
      '--color-ink-muted': 'rgba(74,44,52,0.6)',
      '--color-accent-orange': '#e8987a',
      '--color-accent-purple': '#a888b8',
      '--color-accent-yellow': '#e8c8a0',
      '--color-accent-blue': '#88b8c8',
    },
  },
  {
    key: 'ocean',
    label: '深海蓝调',
    colors: {
      '--color-bamboo-white': '#f0f4f8',
      '--color-paper-white': '#f7fafc',
      '--color-tea-beige': '#edf2f7',
      '--color-editor-paper': '#f8fbfe',
      '--color-bamboo-green': '#5b8ba8',
      '--color-bamboo-deep': '#3d6d8a',
      '--color-ink-green': '#2a3d54',
      '--color-ink-muted': 'rgba(42,61,84,0.6)',
      '--color-accent-orange': '#e8a070',
      '--color-accent-purple': '#9088b8',
      '--color-accent-yellow': '#c8c060',
      '--color-accent-blue': '#68a8c8',
    },
  },
  {
    key: 'amber',
    label: '暖阳琥珀',
    colors: {
      '--color-bamboo-white': '#fdf8f2',
      '--color-paper-white': '#fefaf5',
      '--color-tea-beige': '#faf2e8',
      '--color-editor-paper': '#fffaf3',
      '--color-bamboo-green': '#c8986a',
      '--color-bamboo-deep': '#a87a50',
      '--color-ink-green': '#4a3028',
      '--color-ink-muted': 'rgba(74,48,40,0.6)',
      '--color-accent-orange': '#e09060',
      '--color-accent-purple': '#a88090',
      '--color-accent-yellow': '#d4a050',
      '--color-accent-blue': '#78a0b8',
    },
  },
  {
    key: 'lavender',
    label: '暮紫烟霞',
    colors: {
      '--color-bamboo-white': '#f6f4fa',
      '--color-paper-white': '#faf8fd',
      '--color-tea-beige': '#f2eff8',
      '--color-editor-paper': '#f9f7fc',
      '--color-bamboo-green': '#9088b8',
      '--color-bamboo-deep': '#7068a0',
      '--color-ink-green': '#383058',
      '--color-ink-muted': 'rgba(56,48,88,0.6)',
      '--color-accent-orange': '#e0a080',
      '--color-accent-purple': '#b098d0',
      '--color-accent-yellow': '#c8b068',
      '--color-accent-blue': '#78a0c8',
    },
  },
];

const THEME_KEY = 'storyloom-theme';

export function getSavedTheme(): string {
  try { return localStorage.getItem(THEME_KEY) || 'bamboo'; } catch { return 'bamboo'; }
}

export function saveTheme(key: string) {
  try { localStorage.setItem(THEME_KEY, key); } catch { /* ignore */ }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
