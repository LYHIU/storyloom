import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';
import type { ProjectMeta } from '../lib/tauri';
import * as api from '../lib/tauri';

interface VaultHomeProps {
  onProjectOpened: () => void;
}

function BookCard({ project, onOpen }: { project: ProjectMeta; onOpen: () => void }) {
  const name = project.name;
  const initial = name.charAt(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    api.readCover(project.directory).then(setCoverUrl).catch(() => setCoverUrl(null));
  }, [project.directory]);

  // Generate consistent color from name
  const hue = (name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360;

  return (
    <div
      onClick={onOpen}
      style={{
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.35s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Book cover */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: '4px 10px 10px 4px',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(61,74,61,0.12), 0 2px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.35s',
        background: coverUrl
          ? '#fff'
          : `linear-gradient(160deg, hsl(${hue}, 40%, 75%) 0%, hsl(${hue}, 35%, 55%) 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Spine shadow line */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
          background: 'rgba(0,0,0,0.08)',
          borderRadius: '3px 0 0 3px',
        }} />

        {coverUrl ? (
          <img
            src={coverUrl}
            alt={name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />
        ) : (
          /* Generated cover */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, height: '100%', width: '100%',
            padding: 16, boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: 48, fontWeight: 200, color: 'rgba(255,255,255,0.85)',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              {initial}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.6)',
              letterSpacing: 2, writingMode: 'vertical-rl',
            }}>
              {name.length > 4 ? name.slice(0, 4) + '…' : name}
            </div>
          </div>
        )}

        {/* Book edge highlight */}
        <div style={{
          position: 'absolute', left: 6, top: 0, bottom: 0, width: 2,
          background: 'rgba(255,255,255,0.15)',
        }} />
      </div>

      {/* Title below book */}
      <div style={{ padding: '12px 2px 0', textAlign: 'center' }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: 'var(--color-ink-green)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.directory.replace(/\\/g, '/').split('/').filter(Boolean).slice(-2).join('/')}
        </div>
      </div>
    </div>
  );
}

export function VaultHome({ onProjectOpened }: VaultHomeProps) {
  const { vaultPath, vaultProjects, isLoading, error, clearError,
    setVaultPath, clearVaultPath, openProject, createProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSwitchVault = async () => {
    const selected = await open({
      directory: true, multiple: false, title: '选择书库目录',
    });
    if (selected) {
      await setVaultPath(selected as string);
    }
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

  const vaultDisplayName = vaultPath
    ? vaultPath.replace(/\\/g, '/').split('/').filter(Boolean).pop() || vaultPath
    : '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(170deg, #faf8f4 0%, #f2efe8 30%, #e8e4db 60%, #dfdbd1 100%)',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        backgroundImage: `radial-gradient(circle, #6b9b6b 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,155,107,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 40px', flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{
            fontSize: 20, fontWeight: 300, letterSpacing: 8, color: 'var(--color-ink-muted)',
          }}>
            书织
          </span>
          <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-green)', opacity: 0.25, alignSelf: 'center' }} />
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', letterSpacing: 1 }}>
            {vaultDisplayName}
          </span>
          {vaultProjects.length > 0 && (
            <>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-ink-muted)', opacity: 0.3 }} />
              <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 300 }}>
                {vaultProjects.length} 部作品
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { if (window.confirm('返回首页将清除书库路径，确定？')) clearVaultPath(); }}
            style={{
              padding: '8px 16px', fontSize: 12, cursor: 'pointer',
              border: '1px solid rgba(211,47,47,0.15)', borderRadius: 980,
              background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)',
              fontFamily: 'inherit',
              boxShadow: '0 1px 3px rgba(61,74,61,0.04)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = 'rgba(211,47,47,0.3)';
              e.currentTarget.style.color = '#d32f2f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.borderColor = 'rgba(211,47,47,0.15)';
              e.currentTarget.style.color = 'var(--color-ink-muted)';
            }}
          >
            回到首页
          </button>
          <button
            onClick={handleSwitchVault}
            style={{
              padding: '8px 20px', fontSize: 12, cursor: 'pointer',
              border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980,
              background: 'rgba(255,255,255,0.4)', color: 'var(--color-ink-muted)',
              fontFamily: 'inherit', letterSpacing: 1,
              boxShadow: '0 1px 3px rgba(61,74,61,0.04)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = 'rgba(107,155,107,0.4)';
              e.currentTarget.style.color = 'var(--color-ink-green)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(61,74,61,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.borderColor = 'rgba(107,155,107,0.2)';
              e.currentTarget.style.color = 'var(--color-ink-muted)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(61,74,61,0.04)';
            }}
          >
            切换书库
          </button>
        </div>
      </header>

      <div style={{
        height: 1, margin: '0 40px',
        background: 'linear-gradient(90deg, transparent, rgba(107,155,107,0.15), transparent)',
      }} />

      {/* Content */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '36px 40px 48px',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 20,
            background: 'rgba(211,47,47,0.07)', color: '#d32f2f', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {error}
            <button
              onClick={clearError}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d32f2f', fontSize: 13, fontFamily: 'inherit',
                textDecoration: 'underline', whiteSpace: 'nowrap',
              }}
            >
              关闭
            </button>
          </div>
        )}

        {/* Create dialog */}
        {showCreate && (
          <div style={{
            background: '#fff', borderRadius: 14, padding: 28, marginBottom: 24,
            boxShadow: '0 8px 32px rgba(61,74,61,0.1)',
            border: '1px solid rgba(107,155,107,0.15)',
            maxWidth: 420,
          }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 20 }}>
              新建作品
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowCreate(false); setNewName(''); } }}
              placeholder="作品名称"
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 16px', fontSize: 14,
                border: '1px solid rgba(107,155,107,0.3)', borderRadius: 10,
                outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
                background: 'var(--color-paper-white)', marginBottom: 20,
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); }}
                style={{
                  padding: '9px 22px', fontSize: 13, cursor: 'pointer',
                  border: '1px solid rgba(107,155,107,0.2)', borderRadius: 980,
                  background: 'transparent', color: 'var(--color-ink-muted)',
                  fontFamily: 'inherit',
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading}
                style={{
                  padding: '9px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: 'none', borderRadius: 980,
                  background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
                  color: '#fff', fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(107,155,107,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(107,155,107,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,155,107,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {vaultProjects.length === 0 && !showCreate && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(107,155,107,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: 'var(--color-bamboo-green)', marginBottom: 8,
            }}>
              +
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink-green)', letterSpacing: 1 }}>
              书库还是空的
            </div>
            <div style={{
              fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.8, textAlign: 'center',
            }}>
              创建你的第一部作品，以字为经、以章为纬，开始织就故事。
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '13px 36px', fontSize: 14, fontWeight: 500, cursor: 'pointer', letterSpacing: 1,
                border: 'none', borderRadius: 980,
                background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
                color: '#fff', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(107,155,107,0.35)',
                transition: 'all 0.25s', marginTop: 12,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(107,155,107,0.45)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,155,107,0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              新 建 作 品
            </button>
          </div>
        )}

        {/* Book shelf */}
        {vaultProjects.length > 0 && (
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 24,
            alignContent: 'start',
          }}>
            {vaultProjects.map((project) => (
              <BookCard
                key={project.directory}
                project={project}
                onOpen={() => handleOpen(project)}
              />
            ))}

            {/* Add new card — book style */}
            <div
              onClick={() => setShowCreate(true)}
              style={{
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '100%', aspectRatio: '3/4',
                borderRadius: '4px 10px 10px 4px',
                border: '2px dashed rgba(107,155,107,0.25)',
                background: 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6b9b6b, #5a8a5a)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 200,
                    boxShadow: '0 2px 8px rgba(107,155,107,0.25)',
                  }}>
                    +
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 2px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)' }}>
                  新建作品
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        flexShrink: 0, padding: '12px 40px',
        borderTop: '1px solid rgba(107,155,107,0.08)',
        display: 'flex', justifyContent: 'center', gap: 32,
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.5 }}>
          书织 StoryLoom
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.35 }}>
          墨通山海路，梭停万象全。
        </span>
      </div>
    </div>
  );
}
