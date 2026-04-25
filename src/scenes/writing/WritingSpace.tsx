import { useState } from 'react';

export function WritingSpace() {
  const [_sidebarCollapsed] = useState(false);

  return (
    <div
      className="scene-writing"
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 主内容区 - placeholder for outline sidebar + editor */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{
          width: 240, flexShrink: 0,
          background: 'var(--color-tea-beige)',
          borderRight: '1px solid var(--color-bamboo-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'var(--color-ink-muted)',
        }}>
          大纲侧栏 — 即将上线
        </div>
        <div style={{
          flex: 1,
          background: 'var(--color-editor-paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'var(--color-ink-muted)',
          flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 40, opacity: 0.2 }}>✍</div>
          <div>编辑器 — 即将上线</div>
        </div>
      </div>

      {/* 底部状态栏占位 */}
      <footer style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', fontSize: 13,
        background: 'var(--color-tea-beige)',
        borderTop: '1px solid var(--color-bamboo-white)',
        color: 'var(--color-ink-muted)',
      }}>
        <span>今日 0 字</span>
        <span>状态栏 — 即将上线</span>
      </footer>
    </div>
  );
}
