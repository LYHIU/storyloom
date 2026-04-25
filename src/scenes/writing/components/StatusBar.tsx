import { useBlackRoomStore } from '../../../stores/blackRoomStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';
import { countWebNovelWords } from '../../../lib/wordCount';
import { BlackRoom } from './BlackRoom';
import { useState, useEffect } from 'react';

export function StatusBar() {
  const project = useProjectStore((s) => s.project);
  const content = useEditorStore((s) => s.content);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const closeProject = useProjectStore((s) => s.closeProject);
  const { isActive, elapsedSeconds, currentWords, targetWords } = useBlackRoomStore();
  const [displayWords, setDisplayWords] = useState(() => countWebNovelWords(content));

  // Update word count when content changes
  useEffect(() => {
    setDisplayWords(countWebNovelWords(content));
  }, [content]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <footer style={{
      height: 36, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', fontSize: 13,
      background: 'var(--color-tea-beige)',
      borderTop: '1px solid var(--color-bamboo-white)',
      color: 'var(--color-ink-muted)',
    }}>
      {/* 左侧 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span>今日 {displayWords} 字</span>
        {targetWords > 0 && isActive && (
          <>
            <span style={{ color: 'var(--color-bamboo-green)' }}>|</span>
            <span style={{ color: 'var(--color-accent-orange)', fontWeight: 500 }}>
              目标 {currentWords}/{targetWords}
            </span>
          </>
        )}
        {isActive && (
          <>
            <span style={{ color: 'var(--color-bamboo-green)' }}>|</span>
            <span style={{ fontWeight: 500 }}>{formatTime(elapsedSeconds)}</span>
          </>
        )}
      </div>

      {/* 右侧 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={closeProject}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--color-ink-muted)',
            padding: '2px 8px', borderRadius: 4, fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-bamboo-green)';
            e.currentTarget.style.background = 'rgba(107,155,107,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-ink-muted)';
            e.currentTarget.style.background = 'none';
          }}
        >
          ← 返回书库
        </button>
        <span style={{ color: 'var(--color-bamboo-green)', opacity: 0.3 }}>|</span>
        {project && (
          <span>{project.name}</span>
        )}
        <span style={{
          color: isSaving ? 'var(--color-ink-muted)' : isDirty ? 'var(--color-accent-orange)' : 'var(--color-bamboo-green)',
        }}>
          {isSaving ? '保存中...' : isDirty ? '●' : '✓'}
        </span>
        <BlackRoom onWordCountChange={setDisplayWords} />
      </div>
    </footer>
  );
}
