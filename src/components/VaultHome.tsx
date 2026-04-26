import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';
import type { ProjectMeta } from '../lib/tauri';
import * as api from '../lib/tauri';

interface VaultHomeProps {
  onProjectOpened: () => void;
}

const MACARON = [
  // Original 10
  'linear-gradient(160deg, #ecccd0, #d8acb2)',
  'linear-gradient(160deg, #c0d8cc, #a4c0b0)',
  'linear-gradient(160deg, #c0d4e8, #a4bcd8)',
  'linear-gradient(160deg, #cec4dc, #b8accc)',
  'linear-gradient(160deg, #ecd4c8, #d4b8a8)',
  'linear-gradient(160deg, #e4dcc0, #d4c8a8)',
  'linear-gradient(160deg, #c0dce8, #acccd8)',
  'linear-gradient(160deg, #e8c8d4, #d4b0c0)',
  'linear-gradient(160deg, #d4e0c4, #c0ceac)',
  'linear-gradient(160deg, #ecccc8, #d4b8b0)',
  // New from user — saturation adjusted
  'linear-gradient(160deg, #9fc9cc, #8abebe)',
  'linear-gradient(160deg, #e8c8ce, #dba0aa)',
  'linear-gradient(160deg, #efe0a0, #ead89a)',
  'linear-gradient(160deg, #b6ce9a, #a4c0a0)',
  'linear-gradient(160deg, #8ebe9a, #a0c0a8)',
  'linear-gradient(160deg, #c89a60, #bc5c6a)',
  'linear-gradient(160deg, #e8d0d6, #daa0aa)',
  'linear-gradient(160deg, #a8c8c8, #8ab0c8)',
  'linear-gradient(160deg, #dcd8a8, #e8d89a)',
  'linear-gradient(160deg, #8ab0c8, #84baba)',
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
  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState(name);

  useEffect(() => {
    api.readCover(project.directory).then(setCoverUrl).catch(() => setCoverUrl(null));
  }, [project.directory]);

  const handleUploadCover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const selected = await open({ multiple: false, title: '选择封面图片', filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg'] }] });
    if (selected) {
      await api.setCover(project.directory, selected as string);
      setCoverUrl(await api.readCover(project.directory));
    }
  };

  const handleDeleteCover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteCover(project.directory);
    setCoverUrl(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (delConfirm) { onDelete(); } else { setDelConfirm(true); setTimeout(() => setDelConfirm(false), 3000); }
  };

  const handleStartRename = (e: React.MouseEvent) => { e.stopPropagation(); setEditValue(name); setEditingName(true); };
  const handleRenameKey = (e: React.KeyboardEvent) => { e.stopPropagation(); if (e.key === 'Escape') { setEditingName(false); return; } if (e.key === 'Enter') commitRename(); };
  const commitRename = async () => {
    setEditingName(false);
    if (editValue.trim() && editValue.trim() !== name) {
      await api.renameProject(project.directory, editValue.trim());
      useProjectStore.getState().scanVault();
    }
  };

  return (
    <div
      onClick={onOpen}
      style={{ cursor: 'pointer', position: 'relative', transition: 'all 0.25s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; setHovered(true); }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; setHovered(false); }}
    >
      {/* Page block — behind cover, visible on right & bottom */}
      <div style={{
        position: 'absolute',
        left: 4, top: 0, right: -8, bottom: -9,
        background: '#ece5d5',
        borderRadius: '0 6px 6px 0',
        zIndex: 0,
      }}>
        {/* Page lines on right edge */}
        <div style={{
          position: 'absolute', right: 1, top: 3, bottom: 9, width: 2,
          background: `repeating-linear-gradient(180deg,
            rgba(255,255,255,0.5) 0px, rgba(0,0,0,0.04) 1px,
            transparent 2px, transparent 4px)`,
        }} />
        {/* Page lines on bottom edge */}
        <div style={{
          position: 'absolute', bottom: 1, left: 3, right: 7, height: 2,
          background: `repeating-linear-gradient(90deg,
            rgba(255,255,255,0.5) 0px, rgba(0,0,0,0.04) 1px,
            transparent 2px, transparent 4px)`,
        }} />
      </div>

      {/* Cover */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderRadius: '0 6px 6px 0',
        aspectRatio: '3/4',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px 16px 16px',
        boxShadow: '0 4px 14px rgba(61,74,61,0.12), 0 1px 3px rgba(0,0,0,0.06)',
        background: coverUrl ? '#888' : bgColor(name),
        overflow: 'hidden',
      }}>
        {/* Cover image */}
        {coverUrl ? (
          <img src={coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
        {/* Gloss */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(0,0,0,0.04) 100%)',
        }} />

        {/* Spine */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, zIndex: 3,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)',
          borderRadius: '3px 0 0 3px',
        }} />
        {/* Spine highlight */}
        <div style={{
          position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, zIndex: 3,
          background: 'rgba(255,255,255,0.15)',
        }} />

        {/* Delete */}
        <button
          onClick={handleDelete}
          title={delConfirm ? '再点确认删除' : '删除作品'}
          style={{
            position: 'absolute', top: 5, right: 5, zIndex: 4,
            width: 18, height: 18, borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: delConfirm ? 'rgba(211,47,47,0.85)' : 'transparent',
            color: delConfirm ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
            opacity: hovered || delConfirm ? 1 : 0, transition: 'all 0.2s',
          }}
        >{delConfirm ? '?' : '✕'}</button>

        {/* Seal — only when no cover */}
        {!coverUrl && (
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            marginBottom: 20, marginTop: 4,
            border: '1.5px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.06)',
            position: 'relative', zIndex: 2,
          }}>
            <span style={{
              fontSize: 30, fontWeight: 400, color: 'rgba(255,255,255,0.85)',
              fontFamily: '"KaiTi", "STKaiti", "楷体", "FangSong", "仿宋", serif',
              textShadow: '0 -1px 0 rgba(255,255,255,0.3), 0 2px 3px rgba(0,0,0,0.08)',
              lineHeight: 1,
            }}>{initial}</span>
          </div>
        )}

        {/* Title on cover */}
        {editingName ? (
          <input type="text" value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleRenameKey}
            onBlur={() => commitRename()}
            autoFocus onClick={(e) => e.stopPropagation()}
            style={{
              width: '80%', padding: '3px 6px', fontSize: 12,
              border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4,
              outline: 'none', fontFamily: 'inherit', color: '#3d4a3d', background: '#fff',
              position: 'relative', zIndex: 2,
            }}
          />
        ) : (
          <span
            onClick={handleStartRename}
            title="点击重命名"
            style={{
              fontSize: 15, fontWeight: 500, color: 'rgba(61,74,61,0.65)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '100%', cursor: 'text', letterSpacing: 1,
              textAlign: 'left',
              position: 'relative', zIndex: 2,
            }}
          >{name}</span>
        )}

        {/* Upload / Delete cover */}
        {coverUrl ? (
          <button onClick={handleDeleteCover} title="删除封面"
            style={{
              position: 'absolute', bottom: 8, right: 8, zIndex: 4,
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(211,47,47,0.5)', border: 'none',
              cursor: 'pointer', color: '#fff', fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
            }}>🗑</button>
        ) : (
          <button onClick={handleUploadCover} title="上传封面"
            style={{
              position: 'absolute', bottom: 8, right: 8, zIndex: 4,
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(0,0,0,0.25)', border: 'none',
              cursor: 'pointer', color: '#fff', fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
            }}>📷</button>
        )}
      </div>
    </div>
  );
}

type SortMode = 'name' | 'created' | 'manual';

function getOrderKey(vaultPath: string) { return `storyloom-order-${vaultPath}`; }
function loadManualOrder(vaultPath: string): string[] {
  try { const raw = localStorage.getItem(getOrderKey(vaultPath)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveManualOrder(vaultPath: string, order: string[]) { localStorage.setItem(getOrderKey(vaultPath), JSON.stringify(order)); }

export function VaultHome({ onProjectOpened }: VaultHomeProps) {
  const { vaultPath, vaultProjects, isLoading, error, clearError,
    setVaultPath, clearVaultPath, openProject, createProject, deleteProject, scanVault } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleSwitchVault = async () => {
    const selected = await open({ directory: true, multiple: false, title: '选择书库目录' });
    if (selected) await setVaultPath(selected as string);
  };
  const handleOpen = async (project: ProjectMeta) => { await openProject(project.directory); onProjectOpened(); };
  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName(''); setShowCreate(false); onProjectOpened();
  };
  const handleDelete = async (project: ProjectMeta) => { await deleteProject(project.directory); await scanVault(); };

  const sortedProjects = (() => {
    const projects = [...vaultProjects];
    if (sortMode === 'name') return projects.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === 'created') return projects.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const order = vaultPath ? loadManualOrder(vaultPath) : [];
    const known = new Set(order);
    const ordered = order.map(id => projects.find(p => p.directory === id)).filter(Boolean) as typeof projects;
    const rest = projects.filter(p => !known.has(p.directory));
    return [...ordered, ...rest];
  })();

  const handleDragStart = (e: React.DragEvent, dir: string) => { if (sortMode !== 'manual') return; setDragItem(dir); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, targetDir: string) => {
    e.preventDefault(); if (!dragItem || dragItem === targetDir) return;
    const order = sortedProjects.map(p => p.directory);
    const fromIdx = order.indexOf(dragItem), toIdx = order.indexOf(targetDir);
    if (fromIdx === -1 || toIdx === -1) return;
    order.splice(fromIdx, 1); order.splice(toIdx, 0, dragItem);
    if (vaultPath) saveManualOrder(vaultPath, order);
    setDragItem(null);
  };

  const vaultDisplayName = vaultPath ? vaultPath.replace(/\\/g, '/').split('/').filter(Boolean).pop() || vaultPath : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', background: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', backgroundImage: `radial-gradient(circle, #6b9b6b 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 20, fontWeight: 300, letterSpacing: 8, color: 'var(--color-ink-muted)' }}>书织</span>
          <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-green)', opacity: 0.25, alignSelf: 'center' }} />
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{vaultDisplayName}</span>
          {vaultProjects.length > 0 && (
            <><div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-ink-muted)', opacity: 0.3 }} />
            <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 300 }}>{vaultProjects.length} 部作品</span></>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}
            style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980, background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)', fontFamily: 'inherit', outline: 'none' }}>
            <option value="name">按名称</option><option value="created">按时间</option><option value="manual">手动排序</option>
          </select>
          <button onClick={() => { if (window.confirm('返回首页将清除书库路径，确定？')) clearVaultPath(); }}
            style={{ padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(211,47,47,0.15)', borderRadius: 980, background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)', boxShadow: '0 1px 3px rgba(61,74,61,0.04)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(211,47,47,0.3)'; e.currentTarget.style.color = '#d32f2f'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(211,47,47,0.15)'; e.currentTarget.style.color = 'var(--color-ink-muted)'; }}>回到首页</button>
          <button onClick={handleSwitchVault}
            style={{ padding: '8px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980, background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)', boxShadow: '0 1px 3px rgba(61,74,61,0.04)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(107,155,107,0.4)'; e.currentTarget.style.color = 'var(--color-ink-green)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(61,74,61,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(107,155,107,0.2)'; e.currentTarget.style.color = 'var(--color-ink-muted)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(61,74,61,0.04)'; }}>切换书库</button>
        </div>
      </header>

      <div style={{ height: 1, margin: '0 40px', background: 'linear-gradient(90deg, transparent, rgba(107,155,107,0.15), transparent)' }} />

      <div style={{ flex: 1, overflow: 'auto', padding: '36px 40px 48px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 20, background: 'rgba(211,47,47,0.07)', color: '#d32f2f', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            {error}<button onClick={clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>关闭</button>
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
              <button onClick={() => { setShowCreate(false); setNewName(''); }} style={{ padding: '9px 22px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980, background: 'transparent', color: 'var(--color-ink-muted)' }}>取消</button>
              <button onClick={handleCreate} disabled={isLoading}
                style={{ padding: '9px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 980, color: '#fff', background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)', boxShadow: '0 2px 8px rgba(107,155,107,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(107,155,107,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,155,107,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>{isLoading ? '创建中...' : '创建'}</button>
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
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,155,107,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>新 建 作 品</button>
          </div>
        )}

        {vaultProjects.length > 0 && (
          <div
            style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: 36, alignContent: 'center' }}
            onDragOver={handleDragOver}
          >
            {sortedProjects.map((project) => (
              <div key={project.directory}
                draggable={sortMode === 'manual'}
                onDragStart={(e) => handleDragStart(e, project.directory)}
                onDragOver={handleDragOver}
                onDragEnd={() => setDragItem(null)}
                onDrop={(e) => handleDrop(e, project.directory)}
                style={{ cursor: sortMode === 'manual' ? 'grab' : undefined }}>
                <NovelCard project={project} onOpen={() => handleOpen(project)} onDelete={() => handleDelete(project)} />
              </div>
            ))}
            <div onClick={() => setShowCreate(true)} style={{ cursor: 'pointer', position: 'relative', transition: 'all 0.25s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{
                position: 'absolute', left: 4, top: 0, right: -8, bottom: -9,
                background: '#ece5d5', borderRadius: '0 6px 6px 0', zIndex: 0,
              }} />
              <div style={{
                position: 'relative', zIndex: 1, borderRadius: '0 6px 6px 0',
                aspectRatio: '3/4',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 24, gap: 8,
                border: '2px dashed rgba(107,155,107,0.2)',
                background: 'rgba(255,255,255,0.35)',
                boxShadow: '0 3px 10px rgba(61,74,61,0.06)',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6b9b6b, #5a8a5a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 200, boxShadow: '0 2px 8px rgba(107,155,107,0.25)' }}>+</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(61,74,61,0.4)' }}>新建作品</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '12px 40px', borderTop: '1px solid rgba(107,155,107,0.08)', display: 'flex', justifyContent: 'center', gap: 32, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.5 }}>书织 StoryLoom</span>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.35 }}>墨通山海路，梭停万象全。</span>
      </div>
    </div>
  );
}
