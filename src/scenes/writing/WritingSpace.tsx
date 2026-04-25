import { useState } from 'react';
import { OutlineSidebar } from './components/OutlineSidebar';
import { Editor } from './components/Editor';

export function WritingSpace() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className="scene-writing"
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <OutlineSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Editor />
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
