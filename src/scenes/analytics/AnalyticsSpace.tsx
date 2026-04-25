export function AnalyticsSpace() {
  return (
    <div
      className="scene-analytics"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12,
      }}
    >
      <div style={{ fontSize: 40, opacity: 0.3 }}>📊</div>
      <div style={{ color: 'var(--color-ink-muted)', fontSize: 15 }}>分析空间</div>
      <div style={{ color: 'var(--color-ink-muted)', fontSize: 13, opacity: 0.6 }}>即将在 Phase 3 上线</div>
    </div>
  );
}
