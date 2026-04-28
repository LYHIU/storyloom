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
  /** Background gradient for VaultHome / VaultSetupPage */
  pageBg: string;
  /** Scene content bg */
  sceneBg: string;
  /** Card / panel bg */
  cardBg: string;
  /** Tab bar bg */
  navBg: string;
}

export const THEMES: Theme[] = [
  {
    key: 'bamboo',
    label: '竹林清风',
    pageBg: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)',
    sceneBg: '#f6f3ed',
    cardBg: '#fff',
    navBg: 'rgba(61, 74, 61, 0.92)',
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
    pageBg: 'linear-gradient(170deg, #fef8f9 0%, #faeff3 30%, #f5e0e8 60%, #edd0db 100%)',
    sceneBg: '#fdf0f4',
    cardBg: '#fff',
    navBg: 'rgba(130, 60, 80, 0.92)',
    colors: {
      '--color-bamboo-white': '#fef5f7',
      '--color-paper-white': '#fffafb',
      '--color-tea-beige': '#fdf0f4',
      '--color-editor-paper': '#fffcfd',
      '--color-bamboo-green': '#d48498',
      '--color-bamboo-deep': '#b86078',
      '--color-ink-green': '#5a2838',
      '--color-ink-muted': 'rgba(90,40,56,0.6)',
      '--color-accent-orange': '#e8987a',
      '--color-accent-purple': '#b088c0',
      '--color-accent-yellow': '#e8c888',
      '--color-accent-blue': '#88b8d0',
    },
  },
  {
    key: 'ocean',
    label: '深海蓝调',
    pageBg: 'linear-gradient(170deg, #f4f8fc 0%, #e8f0f8 30%, #d8e4f0 60%, #c8d8e8 100%)',
    sceneBg: '#edf3f8',
    cardBg: '#fff',
    navBg: 'rgba(30, 50, 80, 0.92)',
    colors: {
      '--color-bamboo-white': '#f2f6fa',
      '--color-paper-white': '#f8fafc',
      '--color-tea-beige': '#edf3f8',
      '--color-editor-paper': '#fafcfe',
      '--color-bamboo-green': '#5888b0',
      '--color-bamboo-deep': '#3a6a90',
      '--color-ink-green': '#203850',
      '--color-ink-muted': 'rgba(32,56,80,0.6)',
      '--color-accent-orange': '#e8a068',
      '--color-accent-purple': '#9488b8',
      '--color-accent-yellow': '#c8c060',
      '--color-accent-blue': '#60a8d0',
    },
  },
  {
    key: 'amber',
    label: '暖阳琥珀',
    pageBg: 'linear-gradient(170deg, #fdf6ee 0%, #faeee0 30%, #f5e2c8 60%, #ecd4b0 100%)',
    sceneBg: '#faf0e4',
    cardBg: '#fff',
    navBg: 'rgba(90, 50, 20, 0.92)',
    colors: {
      '--color-bamboo-white': '#fdf4ea',
      '--color-paper-white': '#fefaf4',
      '--color-tea-beige': '#faf0e4',
      '--color-editor-paper': '#fffbf6',
      '--color-bamboo-green': '#d09860',
      '--color-bamboo-deep': '#b07840',
      '--color-ink-green': '#5a3818',
      '--color-ink-muted': 'rgba(90,56,24,0.6)',
      '--color-accent-orange': '#e08848',
      '--color-accent-purple': '#b09088',
      '--color-accent-yellow': '#d4a048',
      '--color-accent-blue': '#68a0c0',
    },
  },
  {
    key: 'lavender',
    label: '暮紫烟霞',
    pageBg: 'linear-gradient(170deg, #faf8fe 0%, #f2ecf8 30%, #e8dcf2 60%, #dcc8e8 100%)',
    sceneBg: '#f4eef8',
    cardBg: '#fff',
    navBg: 'rgba(60, 30, 80, 0.92)',
    colors: {
      '--color-bamboo-white': '#f8f4fc',
      '--color-paper-white': '#fcfafe',
      '--color-tea-beige': '#f4eef8',
      '--color-editor-paper': '#fdfcfe',
      '--color-bamboo-green': '#9878b8',
      '--color-bamboo-deep': '#7858a0',
      '--color-ink-green': '#382858',
      '--color-ink-muted': 'rgba(56,40,88,0.6)',
      '--color-accent-orange': '#e0a878',
      '--color-accent-purple': '#b890d8',
      '--color-accent-yellow': '#c8b060',
      '--color-accent-blue': '#7898c8',
    },
  },
  {
    key: 'macaron',
    label: '马卡龙乐园',
    pageBg: 'linear-gradient(160deg, #fef9f0 0%, #faf4e8 25%, #f8f0f0 50%, #f2f0f8 75%, #f0f4f8 100%)',
    sceneBg: '#faf5f0',
    cardBg: '#fff',
    navBg: 'linear-gradient(135deg, #e8b4b8 0%, #c8d8b0 25%, #b0cce8 50%, #d0c0e0 75%, #e8ccb0 100%)',
    colors: {
      '--color-bamboo-white': '#fdf6f0',
      '--color-paper-white': '#fefaf5',
      '--color-tea-beige': '#faf3ec',
      '--color-editor-paper': '#fefcf8',
      '--color-bamboo-green': '#c4b8a0',
      '--color-bamboo-deep': '#a89880',
      '--color-ink-green': '#4a3a2a',
      '--color-ink-muted': 'rgba(74,58,42,0.55)',
      '--color-accent-orange': '#f0b888',
      '--color-accent-purple': '#c8a8d8',
      '--color-accent-yellow': '#e8d070',
      '--color-accent-blue': '#90c8d8',
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
  root.style.setProperty('--page-bg', theme.pageBg);
  root.style.setProperty('--scene-bg', theme.sceneBg);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--nav-bg', theme.navBg);
}
