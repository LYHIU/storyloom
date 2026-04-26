import { useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';

interface VaultSetupPageProps {
  onVaultReady: () => void;
}

const features = [
  { icon: '✧', label: '构思空间', desc: '起名 · 情节 · 人设 · 世界观', color: '#e8c560' },
  { icon: '◇', label: '码字空间', desc: '编辑器 · 大纲 · 小黑屋', color: '#f0a060' },
  { icon: '○', label: '润色空间', desc: '纠错 · 节奏 · 一致性', color: '#b895b0' },
  { icon: '□', label: '分析空间', desc: '日历 · 统计 · 伙伴图鉴', color: '#7db8c4' },
];

export function VaultSetupPage({ onVaultReady }: VaultSetupPageProps) {
  const { setVaultPath, vaultPath, vaultProjects, isLoading } = useProjectStore();

  useEffect(() => {
    if (vaultPath && vaultProjects.length > 0) {
      onVaultReady();
    }
  }, [vaultPath, vaultProjects, onVaultReady]);

  const handlePickVault = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择书库目录',
    });
    if (selected) {
      await setVaultPath(selected as string);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,155,107,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 60, left: -100, width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,197,96,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -30%)',
        width: 600, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(107,155,107,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle dot pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `radial-gradient(circle, #6b9b6b 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Hero section */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '64px 32px 0', position: 'relative', zIndex: 1,
      }}>
        {/* Brand */}
        <div style={{
          fontSize: 16, fontWeight: 300, letterSpacing: 14,
          color: 'var(--color-ink-muted)', marginBottom: 40,
          textTransform: 'uppercase',
        }}>
          书 织
        </div>

        {/* Poem */}
        <div style={{
          fontSize: 40, fontWeight: 200, lineHeight: 1.6, textAlign: 'center',
          color: 'var(--color-ink-green)', letterSpacing: 8,
          marginBottom: 20,
        }}>
          <div>书织回文锦，</div>
          <div>无因寄陇头。</div>
        </div>

        {/* Ornament */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
        }}>
          <div style={{ width: 40, height: 1, background: 'var(--color-bamboo-green)', opacity: 0.35 }} />
          <div style={{
            width: 8, height: 8, border: '1.5px solid var(--color-bamboo-green)',
            borderRadius: '50%', opacity: 0.45,
          }} />
          <div style={{ width: 40, height: 1, background: 'var(--color-bamboo-green)', opacity: 0.35 }} />
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 14, fontWeight: 300, lineHeight: 1.8,
          color: 'var(--color-ink-muted)', textAlign: 'center', letterSpacing: 2,
          maxWidth: 460, marginBottom: 36,
        }}>
          以字为经、以章为纬，陪你织起人物、情节与世界。
          <br />
          当梭声停下，万象俱全。
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePickVault}
          disabled={isLoading}
          style={{
            padding: '14px 48px', fontSize: 15, fontWeight: 500, letterSpacing: 3,
            cursor: 'pointer',
            border: 'none', borderRadius: 980,
            background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
            color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(107,155,107,0.35), 0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.25s',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 8px 28px rgba(107,155,107,0.45), 0 4px 8px rgba(0,0,0,0.1)';
            btn.style.transform = 'translateY(-2px)';
            btn.style.background = 'linear-gradient(135deg, #7aab7a 0%, #6b9b6b 100%)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 4px 16px rgba(107,155,107,0.35), 0 2px 4px rgba(0,0,0,0.08)';
            btn.style.transform = 'translateY(0)';
            btn.style.background = 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)';
          }}
          onMouseDown={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 2px 6px rgba(107,155,107,0.3)';
            btn.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? '扫描中...' : '打 开 书 库'}
        </button>

        {isLoading && (
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--color-ink-muted)' }}>
            正在扫描作品...
          </div>
        )}
      </div>

      {/* Bottom feature cards — fill remaining space */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-end',
        padding: '0 48px 48px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          width: '100%', maxWidth: 800, margin: '0 auto',
        }}>
          {features.map((f) => (
            <div
              key={f.label}
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '20px 16px',
                textAlign: 'center',
                border: '1px solid rgba(107,155,107,0.08)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.8)';
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = '0 8px 24px rgba(61,74,61,0.08)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.55)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: 22, marginBottom: 8, color: f.color, lineHeight: 1,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 4 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
                {f.desc.split('·').map((part, i) => (
                  <span key={i}>{part}{i < f.desc.split('·').length - 1 ? <br /> : null}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
