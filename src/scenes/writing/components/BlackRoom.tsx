import { useState, useEffect, useRef } from 'react';
import { useBlackRoomStore } from '../../../stores/blackRoomStore';
import { useEditorStore } from '../../../stores/editorStore';
import { countWebNovelWords } from '../../../lib/wordCount';

interface BlackRoomProps {
  onWordCountChange: (count: number) => void;
}

export function BlackRoom({ onWordCountChange }: BlackRoomProps) {
  const { isActive, lockLevel, targetWords, targetMinutes, currentWords, elapsedSeconds, start, stop, tick, updateElapsed } = useBlackRoomStore();
  const [showConfig, setShowConfig] = useState(false);
  const [configWords, setConfigWords] = useState(1000);
  const [configMinutes, setConfigMinutes] = useState(25);
  const [configLevel, setConfigLevel] = useState<'remind' | 'lock_scene'>('remind');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 定时器
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        updateElapsed(useBlackRoomStore.getState().elapsedSeconds + 1);
        // 每分钟更新字数
        const content = useEditorStore.getState().content;
        const wc = countWebNovelWords(content);
        tick(wc);
        onWordCountChange(wc);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // 检查目标达成
  useEffect(() => {
    if (!isActive) return;
    const wordsMet = targetWords > 0 && currentWords >= targetWords;
    const timeMet = targetMinutes > 0 && elapsedSeconds >= targetMinutes * 60;
    if (wordsMet || timeMet) {
      stop();
    }
  }, [currentWords, elapsedSeconds]);

  const handleStart = () => {
    start(configWords, configMinutes, configLevel);
    setShowConfig(false);
    onWordCountChange(countWebNovelWords(useEditorStore.getState().content));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = targetWords > 0 ? Math.min(currentWords / targetWords * 100, 100) : 0;

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => isActive ? stop() : setShowConfig(true)}
        style={{
          background: isActive ? 'var(--color-accent-orange)' : 'var(--color-bamboo-green)',
          color: '#fff', border: 'none', borderRadius: 980,
          padding: '4px 14px', fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s',
        }}
      >
        {isActive ? '退出小黑屋' : '小黑屋'}
      </button>

      {/* 配置弹窗 */}
      {showConfig && !isActive && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowConfig(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 12, padding: 24,
              minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: 'var(--color-ink-green)', fontSize: 18 }}>
              小黑屋设置
            </h3>

            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'var(--color-ink-green)' }}>
              目标字数
              <input
                type="number" value={configWords}
                onChange={(e) => setConfigWords(Number(e.target.value))}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  marginTop: 4, padding: '8px 12px', fontSize: 14,
                  border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
                  outline: 'none', fontFamily: 'inherit',
                }}
                min={100} step={100}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'var(--color-ink-green)' }}>
              目标时长（分钟）
              <input
                type="number" value={configMinutes}
                onChange={(e) => setConfigMinutes(Number(e.target.value))}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  marginTop: 4, padding: '8px 12px', fontSize: 14,
                  border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
                  outline: 'none', fontFamily: 'inherit',
                }}
                min={5} step={5}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 20, fontSize: 14, color: 'var(--color-ink-green)' }}>
              锁定程度
              <select
                value={configLevel}
                onChange={(e) => setConfigLevel(e.target.value as 'remind' | 'lock_scene')}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  marginTop: 4, padding: '8px 12px', fontSize: 14,
                  border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
                  outline: 'none', fontFamily: 'inherit', background: '#fff',
                }}
              >
                <option value="remind">仅提醒（可退出）</option>
                <option value="lock_scene">锁定场景（禁止切换）</option>
              </select>
            </label>

            <button
              onClick={handleStart}
              style={{
                width: '100%', padding: '10px', fontSize: 15, fontWeight: 600,
                background: 'var(--color-accent-orange)', color: '#fff',
                border: 'none', borderRadius: 980, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              开始专注
            </button>
          </div>
        </div>
      )}

      {/* 小黑屋遮罩（激活时，lock_scene 级别阻止切换场景标签） */}
      {isActive && lockLevel === 'lock_scene' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(242, 246, 240, 0.95)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
          onClick={stop}
        >
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 8 }}>
              {formatTime(elapsedSeconds)}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 24 }}>
              {targetWords > 0 && `${currentWords} / ${targetWords} 字`}
            </div>
            {/* 进度条 */}
            <div style={{
              height: 6, borderRadius: 3, background: 'var(--color-bamboo-white)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--color-accent-orange)',
                borderRadius: 3, transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 16 }}>
              小黑屋中... 点击任意位置退出
            </div>
          </div>
        </div>
      )}
    </>
  );
}
