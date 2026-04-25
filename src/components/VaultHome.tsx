import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../stores/projectStore';
import type { ProjectMeta } from '../lib/tauri';

interface VaultHomeProps {
  onProjectOpened: () => void;
}

function NovelCard({ project, onOpen }: { project: ProjectMeta; onOpen: () => void }) {
  const name = project.name;
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(61,74,61,0.08), 0 1px 2px rgba(61,74,61,0.06)',
        transition: 'all 0.25s',
        border: '1px solid rgba(107,155,107,0.1)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = '0 8px 24px rgba(61,74,61,0.12), 0 4px 8px rgba(61,74,61,0.08)';
        el.style.transform = 'translateY(-4px)';
        el.style.borderColor = 'rgba(107,155,107,0.3)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = '0 2px 8px rgba(61,74,61,0.08), 0 1px 2px rgba(61,74,61,0.06)';
        el.style.transform = 'translateY(0)';
        el.style.borderColor = 'rgba(107,155,107,0.1)';
      }}
    >
      {/* Novel icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--color-bamboo-green), var(--color-deep-green))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: '#fff', fontWeight: 300, marginBottom: 4,
      }}>
        {name.charAt(0)}
      </div>

      <div style={{
        fontSize: 15, fontWeight: 600, color: 'var(--color-ink-green)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {name}
      </div>

      <div style={{
        fontSize: 12, color: 'var(--color-ink-muted)',
      }}>
        点击编辑
      </div>
    </div>
  );
}

export function VaultHome({ onProjectOpened }: VaultHomeProps) {
  const { vaultPath, vaultProjects, isLoading, error, clearError,
    setVaultPath, openProject, createProject } = useProjectStore();
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

  // Derive vault name for display
  const vaultDisplayName = vaultPath
    ? vaultPath.replace(/\\/g, '/').split('/').filter(Boolean).pop() || vaultPath
    : '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(160deg, #f7f3ed 0%, #eae8e0 40%, #dde0d4 100%)',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontSize: 18, fontWeight: 300, letterSpacing: 6, color: 'var(--color-ink-muted)',
          }}>
            书织
          </span>
          <div style={{ width: 1, height: 20, background: 'var(--color-bamboo-green)', opacity: 0.3 }} />
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', letterSpacing: 1 }}>
            {vaultDisplayName}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSwitchVault}
            style={{
              padding: '8px 20px', fontSize: 13, cursor: 'pointer',
              border: '1px solid rgba(107,155,107,0.3)', borderRadius: 980,
              background: 'rgba(255,255,255,0.6)', color: 'var(--color-ink-green)',
              fontFamily: 'inherit',
              boxShadow: '0 1px 3px rgba(61,74,61,0.06)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(61,74,61,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(61,74,61,0.06)';
            }}
          >
            切换书库
          </button>
        </div>
      </header>

      {/* Decorative divider */}
      <div style={{
        height: 1, margin: '0 32px',
        background: 'linear-gradient(90deg, transparent, rgba(107,155,107,0.2), transparent)',
      }} />

      {/* Content */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '32px',
      }}>
        {/* Grid title */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-ink-green)', letterSpacing: 2 }}>
            作品
          </span>
          <span style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginLeft: 12 }}>
            {vaultProjects.length} 部
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 16,
            background: 'rgba(211,47,47,0.08)', color: '#d32f2f', fontSize: 13,
          }}>
            {error}
            <button
              onClick={clearError}
              style={{
                marginLeft: 12, background: 'none', border: 'none',
                cursor: 'pointer', color: '#d32f2f', fontSize: 13,
                textDecoration: 'underline', fontFamily: 'inherit',
              }}
            >
              关闭
            </button>
          </div>
        )}

        {/* Create dialog */}
        {showCreate && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20,
            boxShadow: '0 4px 16px rgba(61,74,61,0.1)',
            border: '1px solid rgba(107,155,107,0.2)',
            maxWidth: 400,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 16 }}>
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
                padding: '10px 16px', fontSize: 14,
                border: '1px solid rgba(107,155,107,0.3)', borderRadius: 8,
                outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
                background: 'var(--color-paper-white)', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); }}
                style={{
                  padding: '8px 20px', fontSize: 13, cursor: 'pointer',
                  border: '1px solid rgba(107,155,107,0.3)', borderRadius: 980,
                  background: 'transparent', color: 'var(--color-ink-green)',
                  fontFamily: 'inherit',
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading}
                style={{
                  padding: '8px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: 'none', borderRadius: 980,
                  background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
                  color: '#fff', fontFamily: 'inherit',
                  boxShadow: '0 2px 6px rgba(107,155,107,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107,155,107,0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(107,155,107,0.3)';
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
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 0', gap: 16,
          }}>
            <div style={{
              fontSize: 14, color: 'var(--color-ink-muted)', letterSpacing: 1,
            }}>
              书库还是空的
            </div>
            <div style={{
              fontSize: 13, color: 'var(--color-ink-muted)', opacity: 0.7,
            }}>
              创建你的第一部作品，开始织就故事
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '12px 32px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                border: 'none', borderRadius: 980,
                background: 'linear-gradient(135deg, #6b9b6b 0%, #5a8a5a 100%)',
                color: '#fff', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(107,155,107,0.35)',
                transition: 'all 0.25s', marginTop: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,155,107,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(107,155,107,0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              新建作品
            </button>
          </div>
        )}

        {/* Novel grid */}
        {vaultProjects.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}>
              {vaultProjects.map((project) => (
                <NovelCard
                  key={project.directory}
                  project={project}
                  onOpen={() => handleOpen(project)}
                />
              ))}

              {/* Add new card */}
              <div
                onClick={() => setShowCreate(true)}
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: 12, padding: 24,
                  cursor: 'pointer',
                  border: '2px dashed rgba(107,155,107,0.25)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8, minHeight: 140,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.8)';
                  el.style.borderColor = 'rgba(107,155,107,0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.5)';
                  el.style.borderColor = 'rgba(107,155,107,0.25)';
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--color-bamboo-green)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 300,
                }}>
                  +
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
                  新建作品
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
