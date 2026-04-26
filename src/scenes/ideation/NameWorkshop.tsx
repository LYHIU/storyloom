import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import * as api from '../../lib/tauri';

type NameCategory = 'character' | 'place' | 'technique' | 'faction' | 'weapon' | 'title' | 'book' | 'chapter';

const CATEGORIES: { key: NameCategory; label: string; btn: string }[] = [
  { key: 'character', label: '角色名', btn: '生成角色名' },
  { key: 'place', label: '地名', btn: '生成地名' },
  { key: 'technique', label: '功法/技能', btn: '生成功法名' },
  { key: 'faction', label: '帮派/组织', btn: '生成帮派名' },
  { key: 'weapon', label: '武器/法宝', btn: '生成武器名' },
  { key: 'title', label: '称号/昵称', btn: '生成称号' },
  { key: 'book', label: '书名', btn: '生成书名' },
  { key: 'chapter', label: '章节名', btn: '生成章节名' },
];

const STYLES = ['古风', '现代', '民国', '西幻', '仙侠', '科幻', '都市', '不限'];

export function NameWorkshop() {
  const vaultPath = useProjectStore((s) => s.vaultPath);
  const [category, setCategory] = useState<NameCategory>('character');
  const [gender, setGender] = useState('不限');
  const [style, setStyle] = useState('不限');
  const [count, setCount] = useState(10);
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [aiInfo, setAiInfo] = useState('');

  const current = CATEGORIES.find((c) => c.key === category)!;

  useEffect(() => {
    if (vaultPath) {
      api.getAiConfig(vaultPath).then((c) => {
        if (c.enabled) setAiInfo(`${c.provider} / ${c.model}`);
        else setAiInfo('AI 未开启');
      }).catch(() => setAiInfo(''));
    }
  }, [vaultPath]);

  const generate = async () => {
    if (!vaultPath) return;
    setLoading(true);
    setError('');
    setResults([]);

    const basePrompt = (thing: string) =>
      `生成${count}个${style === '不限' ? '' : style}风格的${thing}。${extra ? '额外要求：' + extra : ''}。严格每行一个结果，不要序号前缀，不要任何解释说明，直接输出结果列表。`;

    const prompts: Record<NameCategory, string> = {
      character: basePrompt(`角色名字，性别${gender}`),
      place: basePrompt('地名'),
      technique: basePrompt('功法或技能名称'),
      faction: basePrompt('帮派、宗门或组织名称'),
      weapon: basePrompt('武器或法宝名称'),
      title: basePrompt('人物称号或昵称'),
      book: basePrompt('小说书名'),
      chapter: basePrompt('网文章节标题'),
    };

    try {
      const reply = await api.aiChat(vaultPath, {
        messages: [{ role: 'user', content: prompts[category] }],
        temperature: 0.9,
        max_tokens: 1024,
      });
      const names = reply
        .split('\n')
        .map((l) => l.trim())
        .map((l) => l.replace(/^[\d]+[\.\、\)\s]+/, '').trim())
        .filter((l) => l.length > 0 && l.length <= 20 && !/^[\(（]/.test(l));
      if (names.length === 0) {
        setError('AI 返回了内容但未能解析出名字，请重试。原始返回: ' + reply.slice(0, 300));
      } else {
        setResults(names.slice(0, count));
      }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  };

  const toggleSave = (name: string) => {
    const next = new Set(saved);
    if (next.has(name)) next.delete(name); else next.add(name);
    setSaved(next);
  };

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 20 }}>
          起名工坊
        </div>

        {/* 分类 */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              style={{
                padding: '5px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                border: category === c.key ? 'none' : '1px solid rgba(107,155,107,0.15)',
                borderRadius: 980,
                background: category === c.key ? 'var(--color-bamboo-green)' : 'transparent',
                color: category === c.key ? '#fff' : 'var(--color-ink-muted)',
                transition: 'all 0.15s',
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* 参数 */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {category === 'character' && (
            <Row label="性别">
              <Select value={gender} options={['男', '女', '不限']} onChange={setGender} />
            </Row>
          )}
          <Row label="风格">
            <Select value={style} options={STYLES} onChange={setStyle} />
          </Row>
          <Row label="数量">
            <Select value={String(count)} options={['5', '10', '15', '20']} onChange={(v) => setCount(Number(v))} />
          </Row>
        </div>
        <div style={{ marginBottom: 12 }}>
          <input type="text" value={extra} placeholder="额外要求（如：带草字头、叠字、两个字、首字母Z...）"
            onChange={(e) => setExtra(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', fontSize: 13,
              border: '1px solid rgba(107,155,107,0.15)', borderRadius: 8,
              outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
              background: 'var(--color-paper-white)',
            }} />
        </div>

        <button onClick={generate} disabled={loading}
          style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            border: 'none', borderRadius: 980, color: '#fff',
            background: 'linear-gradient(135deg, var(--color-accent-yellow), #d4b040)',
            boxShadow: '0 3px 10px rgba(232,197,96,0.3)', transition: 'all 0.2s',
          }}>
          {loading ? '生成中...' : '✨ ' + current.btn}
        </button>
        {aiInfo && (
          <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', opacity: 0.6, marginTop: 4, marginBottom: 16 }}>
            当前模型：{aiInfo}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, background: 'rgba(211,47,47,0.06)', color: '#d32f2f', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 10 }}>
              生成 {results.length} 个 · 已收藏 {saved.size} 个
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8,
            }}>
              {results.map((name) => (
                <div key={name} onClick={() => toggleSave(name)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    background: saved.has(name) ? 'rgba(232,197,96,0.12)' : '#fff',
                    border: saved.has(name) ? '1px solid var(--color-accent-yellow)' : '1px solid rgba(107,155,107,0.08)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.15s', fontSize: 14, color: 'var(--color-ink-green)',
                  }}
                  onMouseEnter={(e) => { if (!saved.has(name)) e.currentTarget.style.borderColor = 'rgba(107,155,107,0.2)'; }}
                  onMouseLeave={(e) => { if (!saved.has(name)) e.currentTarget.style.borderColor = 'rgba(107,155,107,0.08)'; }}>
                  {name}
                  <span style={{ fontSize: 12, color: saved.has(name) ? 'var(--color-accent-yellow)' : 'transparent' }}>
                    {saved.has(name) ? '★' : '☆'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved names */}
        {saved.size > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 10 }}>
              ★ 已收藏 ({saved.size})
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[...saved].map((name) => (
                <span key={name} style={{
                  padding: '4px 12px', borderRadius: 980, fontSize: 13,
                  background: 'rgba(232,197,96,0.1)', color: 'var(--color-ink-green)',
                  border: '1px solid rgba(232,197,96,0.2)',
                }}>{name}</span>
              ))}
            </div>
            <button onClick={() => setSaved(new Set())}
              style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'inherit', textDecoration: 'underline' }}>
              清空收藏
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{label}</span>
      {children}
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '5px 10px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        border: '1px solid rgba(107,155,107,0.15)', borderRadius: 6, outline: 'none',
        color: 'var(--color-ink-green)', background: '#fff',
      }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
