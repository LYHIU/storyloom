import { useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';

interface VaultSetupPageProps {
  onVaultReady: () => void;
}

export function VaultSetupPage({ onVaultReady }: VaultSetupPageProps) {
  const { setVaultPath, vaultPath, vaultProjects, isLoading } = useProjectStore();

  // Auto-navigate when vault with projects is loaded (e.g., from saved path on mount)
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
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(160deg, #f7f3ed 0%, #eae8e0 40%, #dde0d4 100%)',
    }}>
      {/* Decorative corner glows */}
      <div style={{
        position: 'absolute', top: -80, left: -80, width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,155,107,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: -60, width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,155,107,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%236b9b6b' stroke-width='0.5'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 1,
      }}>
        {/* Brand */}
        <div style={{
          fontSize: 20, fontWeight: 300, letterSpacing: 12,
          color: 'var(--color-ink-muted)', marginBottom: 48,
          textTransform: 'uppercase',
        }}>
          书 织
        </div>

        {/* Decorative line */}
        <div style={{
          width: 60, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--color-bamboo-green), transparent)',
          marginBottom: 48,
        }} />

        {/* Poem */}
        <div style={{
          fontSize: 32, fontWeight: 300, lineHeight: 1.8, textAlign: 'center',
          color: 'var(--color-ink-green)', letterSpacing: 6,
          marginBottom: 40,
        }}>
          <div>书织回文锦，</div>
          <div>无因寄陇头。</div>
        </div>

        {/* Decorative ornament */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40,
        }}>
          <div style={{ width: 32, height: 1, background: 'var(--color-bamboo-green)', opacity: 0.4 }} />
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-bamboo-green)', opacity: 0.5,
          }} />
          <div style={{ width: 32, height: 1, background: 'var(--color-bamboo-green)', opacity: 0.4 }} />
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 14, fontWeight: 300, lineHeight: 1.8,
          color: 'var(--color-ink-muted)', textAlign: 'center', letterSpacing: 2,
          maxWidth: 400, marginBottom: 56,
        }}>
          以字为经、以章为纬，陪你织起人物、情节与世界。
          <br />
          当梭声停下，万象俱全。
        </div>

        {/* Button with depth */}
        <button
          onClick={handlePickVault}
          disabled={isLoading}
          style={{
            padding: '14px 40px', fontSize: 15, fontWeight: 500, letterSpacing: 2,
            cursor: 'pointer',
            border: 'none', borderRadius: 980,
            background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
            color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(107,155,107,0.35), 0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.25s',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 8px 24px rgba(107,155,107,0.4), 0 4px 8px rgba(0,0,0,0.12)';
            btn.style.transform = 'translateY(-2px)';
            btn.style.background = 'linear-gradient(135deg, #7aab7a 0%, #6b9b6b 100%)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 4px 12px rgba(107,155,107,0.35), 0 2px 4px rgba(0,0,0,0.1)';
            btn.style.transform = 'translateY(0)';
            btn.style.background = 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)';
          }}
          onMouseDown={(e) => {
            const btn = e.currentTarget;
            btn.style.boxShadow = '0 2px 4px rgba(107,155,107,0.3)';
            btn.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? '扫描中...' : '打开书库'}
        </button>

        {isLoading && (
          <div style={{ marginTop: 24, fontSize: 13, color: 'var(--color-ink-muted)' }}>
            正在扫描作品...
          </div>
        )}
      </div>
    </div>
  );
}
