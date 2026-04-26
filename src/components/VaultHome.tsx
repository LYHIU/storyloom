import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';
import type { ProjectMeta } from '../lib/tauri';
import * as api from '../lib/tauri';

interface VaultHomeProps {
  onProjectOpened: () => void;
}

const MACARON = [
  'linear-gradient(145deg, #f2c9ca, #e8b0b2)',
  'linear-gradient(145deg, #c8e0d0, #aed4b8)',
  'linear-gradient(145deg, #c8daf0, #aec4e8)',
  'linear-gradient(145deg, #d6cce8, #c4b8dc)',
  'linear-gradient(145deg, #f2d8c8, #e8c4b0)',
  'linear-gradient(145deg, #f0e8c4, #e8dcb0)',
  'linear-gradient(145deg, #c8e2f0, #aed2e8)',
  'linear-gradient(145deg, #f0cdd8, #e8b8c6)',
  'linear-gradient(145deg, #dce6c8, #ccd8b0)',
  'linear-gradient(145deg, #f2d0c8, #e8bcb0)',
];

function bgColor(name: string): string {
  const idx = (name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % MACARON.length;
  return MACARON[idx];
}

function NovelCard({ project, onOpen, onDelete }: {
  project: ProjectMeta; onOpen: () => void; onDelete: () => void;
}) {
  const name = project.name;
  const initial = name.charAt(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    api.readCover(project.directory).then(setCoverUrl).catch(() => setCoverUrl(null));
  }, [project.directory]);

  const handleUploadCover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const selected = await open({
      multiple: false,
      title: '选择封面图片',
      filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg'] }],
    });
    if (selected) {
      await api.setCover(project.directory, selected as string);
      // Reload cover
      const url = await api.readCover(project.directory);
      setCoverUrl(url);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (delConfirm) {
      onDelete();
    } else {
      setDelConfirm(true);
      setTimeout(() => setDelConfirm(false), 3000);
    }
  };

  return (
    <div
      onClick={onOpen}
      style={{
        cursor: 'pointer', position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; setHovered(true); }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; setHovered(false); }}
    >
      {/* Stacked paper layers */}
      <div style={{
        position: 'absolute', inset: '5px 3px -5px 3px',
        background: '#e3ded2', borderRadius: 2,
        transform: 'rotate(0.7deg)',
      }} />
      <div style={{
        position: 'absolute', inset: '2px 1.5px -2px 1.5px',
        background: '#ebe6db', borderRadius: 2,
        transform: 'rotate(-0.4deg)',
      }} />

      {/* Main notepad */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #fdfaf4 0%, #f7f1e6 100%)',
        borderRadius: '2px 8px 8px 2px',
        boxShadow: '0 2px 10px rgba(61,74,61,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* Ring binder hole */}
        <div style={{
          position: 'absolute', top: 14, left: 10, zIndex: 4,
          width: 14, height: 14, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, #d4cfc4 0%, #b8b0a0 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)',
        }} />

        {/* Cover image */}
        <div style={{
          margin: '20px 14px 8px 30px',
          borderRadius: 3, overflow: 'hidden',
          aspectRatio: '2/3',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          background: coverUrl ? '#e0e0e0' : bgColor(name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {coverUrl ? (
            <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontSize: 36, fontWeight: 200,
              color: 'rgba(255,255,255,0.75)',
              textShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {initial}
            </span>
          )}

          {/* Upload cover button */}
          <button
            onClick={handleUploadCover}
            title="上传封面"
            style={{
              position: 'absolute', bottom: 6, right: 6,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)',
              border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
            }}
          >
            📷
          </button>
        </div>

        {/* Ruled lines */}
        <div style={{ padding: '0 14px 4px 30px' }}>
          <div style={{ height: 1, background: 'rgba(107,155,107,0.1)', marginBottom: 5 }} />
          <div style={{ height: 1, background: 'rgba(107,155,107,0.06)', marginBottom: 5 }} />
          <div style={{ height: 1, background: 'rgba(107,155,107,0.03)', marginBottom: 8 }} />
        </div>

        {/* Title + actions */}
        <div style={{
          padding: '0 14px 12px 30px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-ink-green)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </span>
          <button
            onClick={handleDelete}
            title={delConfirm ? '再次点击确认删除' : '删除作品'}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: delConfirm ? '#d32f2f' : 'transparent',
              color: delConfirm ? '#fff' : 'var(--color-ink-muted)',
              fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered || delConfirm ? 1 : 0, transition: 'all 0.2s',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            {delConfirm ? '?' : '✕'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VaultHome({ onProjectOpened }: VaultHomeProps) {
  const { vaultPath, vaultProjects, isLoading, error, clearError,
    setVaultPath, clearVaultPath, openProject, createProject, deleteProject, scanVault } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSwitchVault = async () => {
    const selected = await open({ directory: true, multiple: false, title: '选择书库目录' });
    if (selected) await setVaultPath(selected as string);
  };

  const handleOpen = async (project: ProjectMeta) => {
    await openProject(project.directory);
    onProjectOpened();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName('');
    setShowCreate(false);
    onProjectOpened();
  };

  const handleDelete = async (project: ProjectMeta) => {
    await deleteProject(project.directory);
    await scanVault();
  };

  const vaultDisplayName = vaultPath
    ? vaultPath.replace(/\\/g, '/').split('/').filter(Boolean).pop() || vaultPath : '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, #6b9b6b 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 40px', flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 20, fontWeight: 300, letterSpacing: 8, color: 'var(--color-ink-muted)' }}>书织</span>
          <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-green)', opacity: 0.25, alignSelf: 'center' }} />
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{vaultDisplayName}</span>
          {vaultProjects.length > 0 && (
            <>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-ink-muted)', opacity: 0.3 }} />
              <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 300 }}>{vaultProjects.length} 部作品</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { if (window.confirm('返回首页将清除书库路径，确定？')) clearVaultPath(); }}
            style={{ padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(211,47,47,0.15)', borderRadius: 980, background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)', boxShadow: '0 1px 3px rgba(61,74,61,0.04)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(211,47,47,0.3)'; e.currentTarget.style.color = '#d32f2f'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(211,47,47,0.15)'; e.currentTarget.style.color = 'var(--color-ink-muted)'; }}>
            回到首页
          </button>
          <button onClick={handleSwitchVault}
            style={{ padding: '8px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980, background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)', boxShadow: '0 1px 3px rgba(61,74,61,0.04)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(107,155,107,0.4)'; e.currentTarget.style.color = 'var(--color-ink-green)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(61,74,61,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(107,155,107,0.2)'; e.currentTarget.style.color = 'var(--color-ink-muted)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(61,74,61,0.04)'; }}>
            切换书库
          </button>
        </div>
      </header>

      <div style={{ height: 1, margin: '0 40px', background: 'linear-gradient(90deg, transparent, rgba(107,155,107,0.15), transparent)' }} />

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 40px 48px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 20, background: 'rgba(211,47,47,0.07)', color: '#d32f2f', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            {error}
            <button onClick={clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>关闭</button>
          </div>
        )}

        {showCreate && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(61,74,61,0.1)', border: '1px solid rgba(107,155,107,0.15)', maxWidth: 420 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 20 }}>新建作品</div>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowCreate(false); setNewName(''); } }}
              placeholder="作品名称" autoFocus
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', fontSize: 14, border: '1px solid rgba(107,155,107,0.3)', borderRadius: 10, outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)', background: 'var(--color-paper-white)', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); }}
                style={{ padding: '9px 22px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980, background: 'transparent', color: 'var(--color-ink-muted)' }}>取消</button>
              <button onClick={handleCreate} disabled={isLoading}
                style={{ padding: '9px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 980, color: '#fff', background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)', boxShadow: '0 2px 8px rgba(107,155,107,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(107,155,107,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,155,107,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {isLoading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        )}

        {vaultProjects.length === 0 && !showCreate && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(107,155,107,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--color-bamboo-green)', marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink-green)' }}>书库还是空的</div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.8, textAlign: 'center' }}>创建你的第一部作品，以字为经、以章为纬，开始织就故事。</div>
            <button onClick={() => setShowCreate(true)}
              style={{ padding: '13px 36px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 980, color: '#fff', background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)', boxShadow: '0 4px 16px rgba(107,155,107,0.35)', transition: 'all 0.25s', marginTop: 12 }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(107,155,107,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,155,107,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              新 建 作 品
            </button>
          </div>
        )}

        {vaultProjects.length > 0 && (
          <div style={{
            flex: 1, display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 20, alignContent: 'center',
          }}>
            {vaultProjects.map((project) => (
              <NovelCard key={project.directory} project={project}
                onOpen={() => handleOpen(project)}
                onDelete={() => handleDelete(project)} />
            ))}
            {/* Add-new card */}
            <div onClick={() => setShowCreate(true)} style={{ cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ position: 'absolute', inset: '5px 3px -5px 3px', background: '#e3ded2', borderRadius: 2, transform: 'rotate(0.7deg)' }} />
              <div style={{ position: 'absolute', inset: '2px 1.5px -2px 1.5px', background: '#ebe6db', borderRadius: 2, transform: 'rotate(-0.4deg)' }} />
              <div style={{ position: 'relative', background: 'linear-gradient(180deg, #fdfaf4 0%, #f7f1e6 100%)', borderRadius: '2px 8px 8px 2px', boxShadow: '0 2px 10px rgba(61,74,61,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 10 }}>
                <div style={{ position: 'absolute', top: 14, left: 10, width: 14, height: 14, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #d4cfc4 0%, #b8b0a0 100%)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }} />
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #6b9b6b, #5a8a5a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 200, boxShadow: '0 2px 8px rgba(107,155,107,0.25)' }}>+</div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>新建作品</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0, padding: '12px 40px',
        borderTop: '1px solid rgba(107,155,107,0.08)',
        display: 'flex', justifyContent: 'center', gap: 32, position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.5 }}>书织 StoryLoom</span>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.35 }}>墨通山海路，梭停万象全。</span>
      </div>
    </div>
  );
}
