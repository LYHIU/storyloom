export type Scene = 'writing' | 'ideation' | 'polishing' | 'analytics';

interface SceneTabsProps {
  active: Scene;
  onChange: (scene: Scene) => void;
  onBackToVault: () => void;
}

const tabs: { key: Scene; label: string }[] = [
  { key: 'ideation', label: '构思' },
  { key: 'writing', label: '码字' },
  { key: 'polishing', label: '润色' },
  { key: 'analytics', label: '分析' },
];

export function SceneTabs({ active, onChange, onBackToVault }: SceneTabsProps) {
  return (
    <nav
      style={{
        display: 'flex',
        gap: 0,
        background: 'rgba(61, 74, 61, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 12px',
        height: 48,
        alignItems: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* 返回书库 — 左侧 */}
      <button
        onClick={onBackToVault}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: 13,
          padding: '6px 12px',
          borderRadius: 6,
          fontFamily: 'inherit',
          marginRight: 8,
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
        }}
      >
        ← 返回书库
      </button>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', marginRight: 8 }} />

      {/* 中间占位 */}
      <div style={{ flex: 1 }} />

      {/* 场景标签 */}
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            background: active === tab.key ? 'var(--color-bamboo-green)' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '6px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: active === tab.key ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            if (active !== tab.key) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (active !== tab.key) {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
