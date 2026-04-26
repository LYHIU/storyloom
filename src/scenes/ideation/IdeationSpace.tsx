import { useState } from 'react';
import { NameWorkshop } from './NameWorkshop';
import { CharacterCards } from './CharacterCards';

type IdeationTab = 'name' | 'plot' | 'character' | 'world';

const TABS: { key: IdeationTab; label: string }[] = [
  { key: 'name', label: '起名工坊' },
  { key: 'plot', label: '情节图谱' },
  { key: 'character', label: '人设卡片' },
  { key: 'world', label: '世界观' },
];

export function IdeationSpace() {
  const [tab, setTab] = useState<IdeationTab>('name');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-tea-beige)' }}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 20px',
        borderBottom: '1px solid var(--color-bamboo-white)',
        background: 'var(--color-bamboo-white)', flexShrink: 0,
      }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              border: 'none', borderBottom: tab === t.key ? '2px solid var(--color-bamboo-green)' : '2px solid transparent',
              background: 'transparent',
              color: tab === t.key ? 'var(--color-bamboo-green)' : 'var(--color-ink-muted)',
              fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'name' && <NameWorkshop />}
        {tab === 'plot' && <Placeholder text="情节图谱" />}
        {tab === 'character' && <CharacterCards />}
        {tab === 'world' && <Placeholder text="世界观画布" />}
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-ink-muted)', fontSize: 14, flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 32, opacity: 0.15 }}>✦</div>
      <span>{text} — 即将推出</span>
    </div>
  );
}
