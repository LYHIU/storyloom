import { useState } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import type { Chapter } from '../../../lib/tauri';

interface OutlineSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function OutlineSidebar({ collapsed, onToggle }: OutlineSidebarProps) {
  const { chapters, activeChapter, setActiveChapter, addChapter, removeChapter } = useProjectStore();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  if (collapsed) {
    return (
      <div style={{
        width: 36, flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 12,
        background: 'var(--color-tea-beige)', borderRight: '1px solid var(--color-bamboo-white)',
      }}>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-bamboo-green)', fontSize: 18, padding: 4,
          }}
          title="展开大纲"
        >
          ☰
        </button>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const fileName = `ch-${Date.now()}`;
    await addChapter(fileName, newTitle.trim());
    setNewTitle('');
    setShowAdd(false);
  };

  const handleDelete = async (chapter: Chapter) => {
    if (window.confirm(`确定删除章节「${chapter.title}」？`)) {
      await removeChapter(chapter);
    }
  };

  return (
    <aside style={{
      width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--color-tea-beige)', borderRight: '1px solid var(--color-bamboo-white)',
      overflow: 'hidden',
    }}>
      {/* 顶部操作栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--color-bamboo-white)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-green)' }}>大纲</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              background: 'var(--color-bamboo-green)', color: '#fff',
              border: 'none', borderRadius: 980, padding: '2px 10px',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + 新章
          </button>
          <button
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-ink-muted)', fontSize: 16, padding: 2,
            }}
            title="收起大纲"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 新建章节输入 */}
      {showAdd && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-bamboo-white)' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="章节标题..."
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '6px 10px', fontSize: 13,
              border: '1px solid var(--color-bamboo-green)', borderRadius: 6,
              background: '#fff', outline: 'none',
              fontFamily: 'inherit', color: 'var(--color-ink-green)',
            }}
          />
        </div>
      )}

      {/* 章节列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {chapters.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 13 }}>
            暂无章节，点击「+ 新章」开始
          </div>
        ) : (
          chapters.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChapter(ch)}
              style={{
                padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: activeChapter?.id === ch.id ? 'var(--color-bamboo-white)' : 'transparent',
                borderLeft: activeChapter?.id === ch.id ? '3px solid var(--color-bamboo-green)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (activeChapter?.id !== ch.id) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(107, 155, 107, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeChapter?.id !== ch.id) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--color-ink-green)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2 }}>
                  {ch.word_count} 字
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(ch); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-ink-muted)', fontSize: 14, padding: '0 4px',
                  opacity: 0.5, transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
                title="删除章节"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
