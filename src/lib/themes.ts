const retroPlayfulPlaidBg = new URL('../assets/retro-playful-plaid.jpg', import.meta.url).href;

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
  coverPalette?: string[];
  /** Background for VaultHome / VaultSetupPage */
  pageBg: string;
  /** Optional texture layer above the page background */
  pageBgImage?: string;
  pageBgImageOpacity?: string;
  pageBgImageSize?: string;
  pageBgImageRepeat?: string;
  pageDotOpacity?: string;
  pageDecorOpacity?: string;
  /** Scene content bg */
  sceneBg: string;
  /** Card / panel bg */
  cardBg: string;
  /** Tab bar bg */
  navBg: string;
  /** Book page block behind covers */
  pageBlockBg?: string;
}

export const THEMES: Theme[] = [
  {
    key: 'bamboo',
    label: '竹林清风',
    pageBg: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)',
    sceneBg: '#f6f3ed',
    cardBg: '#fff',
    navBg: 'rgba(61, 74, 61, 0.92)',
    pageBlockBg: '#ece5d5',
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
    pageBlockBg: '#ece5d5',
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
    pageBlockBg: '#ece5d5',
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
    pageBlockBg: '#ece5d5',
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
    pageBlockBg: '#ece5d5',
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
    key: 'oxygen-pearl',
    label: '氧雾珍珠',
    pageBg: 'linear-gradient(165deg, #f7f4ea 0%, #f4f8f6 30%, #dff3f1 58%, #ded9e2 100%)',
    sceneBg: '#eef6f5',
    cardBg: '#fffefa',
    navBg: 'rgba(47, 58, 86, 0.92)',
    pageBlockBg: '#e4f0ef',
    colors: {
      '--color-bamboo-white': '#f4f8f6',
      '--color-paper-white': '#fffefa',
      '--color-tea-beige': '#dff3f1',
      '--color-editor-paper': '#fffefa',
      '--color-bamboo-green': '#75c9c8',
      '--color-bamboo-deep': '#4fa8ad',
      '--color-ink-green': '#2f3a56',
      '--color-ink-muted': 'rgba(47,58,86,0.62)',
      '--color-accent-orange': '#e7b27e',
      '--color-accent-purple': '#c0b9dd',
      '--color-accent-yellow': '#eadc9a',
      '--color-accent-blue': '#80a1d4',
    },
    coverPalette: [
      'linear-gradient(160deg, #f7f4ea, #75c9c8)',
      'linear-gradient(160deg, #f4f8f6, #a9dedd)',
      'linear-gradient(160deg, #dff3f1, #75c9c8)',
      'linear-gradient(160deg, #75c9c8, #4fa8ad)',
      'linear-gradient(160deg, #a9dedd, #80a1d4)',
      'linear-gradient(160deg, #f7f4ea, #ded9e2)',
      'linear-gradient(160deg, #ded9e2, #75c9c8)',
      'linear-gradient(160deg, #f7f4ea, #c0b9dd)',
      'linear-gradient(160deg, #ded9e2, #c0b9dd)',
      'linear-gradient(160deg, #c0b9dd, #80a1d4)',
      'linear-gradient(160deg, #f7f4ea, #80a1d4)',
      'linear-gradient(160deg, #dff3f1, #c0b9dd)',
      'linear-gradient(160deg, #75c9c8, #ded9e2)',
      'linear-gradient(160deg, #4fa8ad, #2f3a56)',
      'linear-gradient(160deg, #2f8d8b, #75c9c8)',
      'linear-gradient(160deg, #b7e7e5, #c0b9dd)',
      'linear-gradient(160deg, #f7f4ea, #eadc9a)',
      'linear-gradient(160deg, #eadc9a, #75c9c8)',
      'linear-gradient(160deg, #e7b27e, #f7f4ea)',
      'linear-gradient(160deg, #2f3a56, #75c9c8)',
    ],
  },
  {
    key: 'macaron',
    label: '糖霜圆舞',
    pageBg: 'linear-gradient(170deg, #fffdf8 0%, #f7e0e5 34%, #f9eaa0 68%, #dff3f1 100%)',
    sceneBg: '#f7e0e5',
    cardBg: '#fffdf8',
    navBg: 'rgba(63, 74, 77, 0.92)',
    pageBlockBg: '#f8e4d8',
    colors: {
      '--color-bamboo-white': '#eaf7f4',
      '--color-paper-white': '#fffdf8',
      '--color-tea-beige': '#f7e0e5',
      '--color-editor-paper': '#fffefa',
      '--color-bamboo-green': '#8bceca',
      '--color-bamboo-deep': '#6ab8b4',
      '--color-ink-green': '#3f4a4d',
      '--color-ink-muted': 'rgba(63,74,77,0.62)',
      '--color-accent-orange': '#d29b51',
      '--color-accent-purple': '#d05165',
      '--color-accent-yellow': '#f9eaa0',
      '--color-accent-blue': '#93c1df',
    },
    coverPalette: [
      'linear-gradient(160deg, #9ad4d9, #7fc4cb)',
      'linear-gradient(160deg, #f3d3db, #e7aeba)',
      'linear-gradient(160deg, #f9eaa0, #f2d979)',
      'linear-gradient(160deg, #bedc9e, #93c58b)',
      'linear-gradient(160deg, #8cca9c, #6faf86)',
      'linear-gradient(160deg, #d29b51, #bf7c36)',
      'linear-gradient(160deg, #d05165, #b83e53)',
      'linear-gradient(160deg, #b5d7d7, #90c2c5)',
      'linear-gradient(160deg, #aed0b5, #85b69a)',
      'linear-gradient(160deg, #e7e5b1, #d8d487)',
      'linear-gradient(160deg, #f7e0e5, #f1a7b8)',
      'linear-gradient(160deg, #fae3a5, #f3c96f)',
      'linear-gradient(160deg, #8bceca, #93c1df)',
      'linear-gradient(160deg, #b5d7d7, #a0c8bf)',
      'linear-gradient(160deg, #f3d3db, #c8a7dc)',
      'linear-gradient(160deg, #e7e5b1, #bedc9e)',
      'linear-gradient(160deg, #93c1df, #78a9ca)',
      'linear-gradient(160deg, #f1a7b8, #d05165)',
      'linear-gradient(160deg, #d29b51, #e7e5b1)',
      'linear-gradient(160deg, #8cca9c, #9ad4d9)',
    ],
  },
  {
    key: 'baroque',
    label: '鎏金剧场',
    pageBg: 'linear-gradient(165deg, #f2e2c2 0%, #fcdebd 22%, #dcd1c4 46%, #cbb1a0 68%, #b59473 88%, #965036 100%)',
    sceneBg: '#e6d5c6',
    cardBg: '#fff1d8',
    navBg: 'rgba(93, 60, 46, 0.94)',
    pageBlockBg: '#d3b79e',
    colors: {
      '--color-bamboo-white': '#f2e2c2',
      '--color-paper-white': '#fff1d8',
      '--color-tea-beige': '#e6d5c6',
      '--color-editor-paper': '#fff4df',
      '--color-bamboo-green': '#ca9640',
      '--color-bamboo-deep': '#5d3c2e',
      '--color-ink-green': '#332213',
      '--color-ink-muted': 'rgba(51,34,19,0.64)',
      '--color-accent-orange': '#965036',
      '--color-accent-purple': '#7f191e',
      '--color-accent-yellow': '#ca9640',
      '--color-accent-blue': '#29746e',
    },
    coverPalette: [
      'linear-gradient(160deg, #5d3c2e, #332213)',
      'linear-gradient(160deg, #dcd1c4, #b59473)',
      'linear-gradient(160deg, #fcdebd, #ca9640)',
      'linear-gradient(160deg, #965036, #5d3c2e)',
      'linear-gradient(160deg, #f2e2c2, #cbb1a0)',
      'linear-gradient(160deg, #b59473, #965036)',
      'linear-gradient(160deg, #cbb1a0, #a38878)',
      'linear-gradient(160deg, #ca9640, #5d3c2e)',
      'linear-gradient(160deg, #7f191e, #b59473)',
      'linear-gradient(160deg, #29746e, #ca9640)',
      'linear-gradient(160deg, #244a62, #dcd1c4)',
      'linear-gradient(160deg, #fcdebd, #965036)',
      'linear-gradient(160deg, #b67485, #cbb1a0)',
      'linear-gradient(160deg, #5b2925, #fcdebd)',
      'linear-gradient(160deg, #a38878, #332213)',
      'linear-gradient(160deg, #f2e2c2, #7f191e)',
      'linear-gradient(160deg, #29746e, #dcd1c4)',
      'linear-gradient(160deg, #ca9640, #f2e2c2)',
      'linear-gradient(160deg, #332213, #29746e)',
      'linear-gradient(160deg, #965036, #ca9640)',
    ],
  },
  {
    key: 'retro-playful',
    label: '跳格童年',
    pageBg: '#f5e4ba',
    pageBgImage: retroPlayfulPlaidBg,
    pageBgImageOpacity: '0.19',
    pageBgImageSize: '220px auto',
    pageBgImageRepeat: 'repeat',
    pageDotOpacity: '0',
    pageDecorOpacity: '0',
    sceneBg: '#f2e7c4',
    cardBg: '#fff4d6',
    navBg: 'rgba(117, 64, 33, 0.92)',
    pageBlockBg: '#d9c898',
    colors: {
      '--color-bamboo-white': '#f7ecce',
      '--color-paper-white': '#fff4d6',
      '--color-tea-beige': '#f2e7c4',
      '--color-editor-paper': '#fff5d6',
      '--color-bamboo-green': '#cfb15a',
      '--color-bamboo-deep': '#827430',
      '--color-ink-green': '#3a3028',
      '--color-ink-muted': 'rgba(58,48,40,0.64)',
      '--color-accent-orange': '#df5b3b',
      '--color-accent-purple': '#dc5090',
      '--color-accent-yellow': '#eeaa3e',
      '--color-accent-blue': '#2f557a',
    },
    coverPalette: [
      // 色系0: 粉/红 (索引 0-4)
      'linear-gradient(160deg, #f0c4cb, #e099b6)',
      'linear-gradient(160deg, #e099b6, #c97e8b)',
      'linear-gradient(160deg, #c97e8b, #dc5090)',
      '#dc5090',
      '#9395b2',
      // 色系1: 高明度冷调撞色 (索引 5-9)
      '#4f8fd6',
      '#36b8b2',
      '#8f78d8',
      '#e86fa8',
      '#55c7d8',
      // 色系2: 橙/棕 (索引 10-14)
      'linear-gradient(160deg, #eeaa3e, #ec9f38)',
      'linear-gradient(160deg, #ec9f38, #df5b3b)',
      'linear-gradient(160deg, #df5b3b, #bb774f)',
      'linear-gradient(160deg, #bb774f, #c58252)',
      'linear-gradient(160deg, #c58252, #9e726c)',
      // 色系3: 大地/蓝绿 (索引 15-19)
      'linear-gradient(160deg, #9e726c, #754021)',
      'linear-gradient(160deg, #754021, #5e3525)',
      'linear-gradient(160deg, #5e3525, #574932)',
      'linear-gradient(160deg, #8ebb9b, #94bfb7)',
      'linear-gradient(160deg, #94bfb7, #2f557a)',
    ],
  },
];

const THEME_KEY = 'storyloom-theme';

export function getSavedTheme(): string {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'candy-garden') return 'macaron';
    if (saved === 'oxygen-lavender') return 'oxygen-pearl';
    return saved || 'bamboo';
  } catch { return 'bamboo'; }
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
  if (theme.pageBgImage) {
    root.style.setProperty('--page-bg-image', `url(${theme.pageBgImage})`);
    root.style.setProperty('--page-bg-image-opacity', theme.pageBgImageOpacity || '0');
    root.style.setProperty('--page-bg-image-size', theme.pageBgImageSize || 'auto');
    root.style.setProperty('--page-bg-image-repeat', theme.pageBgImageRepeat || 'repeat');
  } else {
    root.style.setProperty('--page-bg-image', 'none');
    root.style.setProperty('--page-bg-image-opacity', '0');
  }
  root.style.setProperty('--page-dot-opacity', theme.pageDotOpacity || '0.025');
  root.style.setProperty('--page-decor-opacity', theme.pageDecorOpacity || '1');
  root.style.setProperty('--page-block-bg', theme.pageBlockBg || '#ece5d5');
}
