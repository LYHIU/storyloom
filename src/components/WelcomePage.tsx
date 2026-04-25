import { useProjectStore } from '../stores/projectStore';
import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

interface WelcomePageProps {
  onProjectOpened: () => void;
}

export function WelcomePage({ onProjectOpened }: WelcomePageProps) {
  const { createProject, openProject, isLoading, error, clearError } = useProjectStore();
  const [mode, setMode] = useState<'menu' | 'create' | 'open'>('menu');
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');
  const [openPath, setOpenPath] = useState('');
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  const RECENT_KEY = 'storyloom-recent-projects';

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) {
      try { setRecentProjects(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const saveRecent = (path: string) => {
    const updated = [path, ...recentProjects.filter(p => p !== path)].slice(0, 10);
    setRecentProjects(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const pickDirectory = async () => {
    const selected = await open({ directory: true, multiple: false, title: '选择目录' });
    if (selected) {
      setDirectory(selected as string);
    }
  };

  const pickOpenPath = async () => {
    const selected = await open({ directory: true, multiple: false, title: '选择项目目录' });
    if (selected) {
      setOpenPath(selected as string);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !directory.trim()) return;
    await createProject(name.trim(), directory.trim());
    saveRecent(`${directory.trim()}\\${name.trim()}`);
    onProjectOpened();
  };

  const handleOpen = async () => {
    if (!openPath.trim()) return;
    await openProject(openPath.trim());
    saveRecent(openPath.trim());
    onProjectOpened();
  };

  const handleRecentOpen = async (path: string) => {
    setOpenPath(path);
    await openProject(path);
    saveRecent(path);
    onProjectOpened();
  };

  if (mode === 'create') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16,
        background: 'var(--color-paper-white)',
      }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 8 }}>
          新建作品
        </div>

        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="作品名称"
          style={{
            width: 300, padding: '10px 16px', fontSize: 15,
            border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
            outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
            background: '#fff', boxSizing: 'border-box',
          }}
        />

        <div style={{ width: 300, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={directory} onChange={(e) => setDirectory(e.target.value)}
              placeholder="存储目录路径 (如 D:\Novels)"
              style={{
                flex: 1, padding: '10px 16px', fontSize: 15, boxSizing: 'border-box',
                border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
                outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
                background: '#fff',
              }}
            />
            <button
              onClick={pickDirectory}
              style={{
                padding: '10px 16px', fontSize: 14, cursor: 'pointer',
                background: 'var(--color-bamboo-green)', color: '#fff',
                border: 'none', borderRadius: 8, fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              浏览
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: '#d32f2f', fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => { setMode('menu'); clearError(); }}
            style={{
              padding: '8px 24px', fontSize: 14, cursor: 'pointer',
              background: 'transparent', color: 'var(--color-bamboo-green)',
              border: '1px solid var(--color-bamboo-green)', borderRadius: 980,
              fontFamily: 'inherit',
            }}
          >
            返回
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            style={{
              padding: '8px 24px', fontSize: 14, cursor: 'pointer',
              background: 'var(--color-bamboo-green)', color: '#fff',
              border: 'none', borderRadius: 980, fontFamily: 'inherit',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '创建中...' : '创建作品'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'open') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16,
        background: 'var(--color-paper-white)',
      }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 8 }}>
          打开作品
        </div>
        <div style={{ width: 300, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={openPath} onChange={(e) => setOpenPath(e.target.value)}
              placeholder="项目目录路径 (如 D:\Novels\MyBook)"
              style={{
                flex: 1, padding: '10px 16px', fontSize: 15,
                border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
                outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
                background: '#fff', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={pickOpenPath}
              style={{
                padding: '10px 16px', fontSize: 14, cursor: 'pointer',
                background: 'var(--color-bamboo-green)', color: '#fff',
                border: 'none', borderRadius: 8, fontFamily: 'inherit',
              }}
            >
              浏览
            </button>
          </div>
        </div>
        {error && (
          <div style={{ color: '#d32f2f', fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => { setMode('menu'); clearError(); }}
            style={{
              padding: '8px 24px', fontSize: 14, cursor: 'pointer',
              background: 'transparent', color: 'var(--color-bamboo-green)',
              border: '1px solid var(--color-bamboo-green)', borderRadius: 980,
              fontFamily: 'inherit',
            }}
          >
            返回
          </button>
          <button
            onClick={handleOpen}
            disabled={isLoading}
            style={{
              padding: '8px 24px', fontSize: 14, cursor: 'pointer',
              background: 'var(--color-bamboo-green)', color: '#fff',
              border: 'none', borderRadius: 980, fontFamily: 'inherit',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '打开中...' : '打开作品'}
          </button>
        </div>
      </div>
    );
  }

  // Menu
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 12,
      background: 'var(--color-paper-white)',
    }}>
      <div style={{ fontSize: 42, fontWeight: 600, color: 'var(--color-ink-green)', letterSpacing: 4 }}>
        书织
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-ink-green)', marginTop: 8, letterSpacing: 1, opacity: 0.75, textAlign: 'center', lineHeight: 2 }}>
        书织回文锦，无因寄陇头。<br />
        墨通山海路，梭停万象全。
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
        以字为经、以章为纬，陪你织起人物、情节与世界。当梭声停下，万象俱全。
      </div>
      <button
        onClick={() => setMode('create')}
        style={{
          width: 240, padding: '14px 24px', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', border: 'none', borderRadius: 980,
          background: 'var(--color-bamboo-green)', color: '#fff',
          fontFamily: 'inherit', transition: 'background 0.2s',
        }}
      >
        新建作品
      </button>
      <button
        onClick={() => setMode('open')}
        style={{
          width: 240, padding: '14px 24px', fontSize: 16, fontWeight: 500,
          cursor: 'pointer', border: '1px solid var(--color-bamboo-green)',
          borderRadius: 980, background: 'transparent',
          color: 'var(--color-bamboo-green)', fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
      >
        打开作品
      </button>

      {recentProjects.length > 0 && (
        <div style={{ width: 240, marginTop: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 8, fontWeight: 500 }}>
            最近作品
          </div>
          {recentProjects.map((path) => {
            const parts = path.replace(/\\/g, '/').split('/');
            const projectName = parts[parts.length - 1] || parts[parts.length - 2] || path;
            return (
              <div
                key={path}
                onClick={() => handleRecentOpen(path)}
                style={{
                  padding: '8px 12px', cursor: 'pointer', borderRadius: 8,
                  fontSize: 13, color: 'var(--color-ink-green)',
                  transition: 'background 0.15s', marginBottom: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(107, 155, 107, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontWeight: 500 }}>{projectName}</span>
                <span style={{ color: 'var(--color-ink-muted)', marginLeft: 8, fontSize: 11 }}>
                  {path}
                </span>
              </div>
            );
          })}
          <button
            onClick={() => { setRecentProjects([]); localStorage.removeItem(RECENT_KEY); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--color-ink-muted)', padding: '4px 12px', marginTop: 4,
              fontFamily: 'inherit', textDecoration: 'underline',
            }}
          >
            清空记录
          </button>
        </div>
      )}
    </div>
  );
}
