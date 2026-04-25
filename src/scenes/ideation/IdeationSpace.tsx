export function IdeationSpace() {
  return (
    <div
      className="scene-ideation"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12,
      }}
    >
      <div style={{ fontSize: 40, opacity: 0.3 }}>💡</div>
      <div style={{ color: 'var(--color-ink-muted)', fontSize: 15 }}>构思空间</div>
      <div style={{ color: 'var(--color-ink-muted)', fontSize: 13, opacity: 0.6 }}>即将在 Phase 2 上线</div>
    </div>
  );
}
