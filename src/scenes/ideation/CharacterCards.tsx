import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import * as api from '../../lib/tauri';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  CharacterBoard,
  CharacterCard,
  CharacterField,
  CharacterRelationship,
  CharacterRole,
  ConflictSeed,
  ConflictStatus,
} from '../../lib/tauri';

const ROLE_OPTIONS: { key: CharacterRole; label: string }[] = [
  { key: 'protagonist', label: '主角' },
  { key: 'supporting', label: '配角' },
  { key: 'antagonist', label: '反派' },
  { key: 'minor', label: '临时角色' },
];

const STAGE_OPTIONS = ['相识', '试探', '合作', '拉扯', '撕裂', '反转', '和解', '决裂'];
const STATUS_OPTIONS: { key: ConflictStatus; label: string }[] = [
  { key: 'seed', label: '种子' },
  { key: 'used', label: '已入剧情' },
  { key: 'archived', label: '搁置' },
];
const ROLE_FILTERS: ({ key: 'all'; label: string } | { key: CharacterRole; label: string })[] = [
  { key: 'all', label: '全部' },
  ...ROLE_OPTIONS,
];
const COLORS = ['#6b9b6b', '#e8c560', '#f0a060', '#b895b0', '#7db8c4', '#8f9a6b'];
const DEFAULT_CHARACTER_NAME = '未命名角色';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyBoard(): CharacterBoard {
  return {
    version: 1,
    updatedAt: nowIso(),
    characters: [],
    relationships: [],
    conflicts: [],
  };
}

function createField(label: string, kind: CharacterField['kind'] = 'long', value = ''): CharacterField {
  return { id: uid('field'), label, kind, value };
}

function defaultFields(): CharacterField[] {
  return [
    createField('表层身份', 'short'),
    createField('外貌'),
    createField('性格'),
    createField('欲望'),
    createField('恐惧'),
    createField('软肋/底线'),
    createField('秘密'),
    createField('剧情功能'),
    createField('成长弧线'),
    createField('当前状态'),
  ];
}

function createCharacter(index: number): CharacterCard {
  const time = nowIso();
  return {
    id: uid('char'),
    name: DEFAULT_CHARACTER_NAME,
    aliases: [],
    role: 'supporting',
    color: COLORS[index % COLORS.length],
    importance: 3,
    fields: defaultFields(),
    chapterIds: [],
    createdAt: time,
    updatedAt: time,
  };
}

function normalizeBoard(board: CharacterBoard): CharacterBoard {
  return {
    version: 1,
    updatedAt: board.updatedAt || nowIso(),
    characters: board.characters || [],
    relationships: board.relationships || [],
    conflicts: board.conflicts || [],
  };
}

function RelationshipGraph({
  activeCharacter,
  relationships,
  charactersById,
}: {
  activeCharacter: CharacterCard;
  relationships: CharacterRelationship[];
  charactersById: Map<string, CharacterCard>;
}) {
  const rels = relationships.filter((r) => r.fromId !== r.toId);
  const nodeIds = new Set<string>();
  rels.forEach((r) => { nodeIds.add(r.fromId); nodeIds.add(r.toId); });
  if (!rels.length && !nodeIds.has(activeCharacter.id)) nodeIds.add(activeCharacter.id);

  const initialNodes: Node[] = [...nodeIds].map((id, i) => {
    const ch = charactersById.get(id);
    if (!ch) return { id, position: { x: i * 180 + 20, y: 80 }, data: { label: '?' } };
    const COL = 4;
    return {
      id,
      position: { x: (i % COL) * 180 + 20, y: Math.floor(i / COL) * 120 + 20 },
      data: { label: ch.name },
      style: {
        background: ch.color, color: '#fff', border: 'none', borderRadius: 8,
        padding: '10px 16px', fontSize: 13, fontWeight: 600,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      },
    };
  });

  const initialEdges: Edge[] = rels.map((r) => {
    return {
      id: r.id,
      source: r.fromId,
      target: r.toId,
      label: `${r.type || '关系'}${r.stage ? ' · ' + r.stage : ''}`,
      style: { stroke: '#6b9b6b', strokeWidth: 1.5 },
      labelStyle: { fill: '#3d4a3d', fontSize: 10 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6b9b6b' },
    };
  });

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div style={{ height: '100%', minHeight: 280 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="rgba(107,155,107,0.06)" gap={20} />
        <Controls style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <MiniMap
          nodeColor={(n) => n.style?.background as string || '#6b9b6b'}
          style={{ background: 'rgba(255,255,255,0.8)', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}

function roleLabel(role: CharacterRole) {
  return ROLE_OPTIONS.find((item) => item.key === role)?.label || '角色';
}

function conflictStatusLabel(status: ConflictStatus) {
  return STATUS_OPTIONS.find((item) => item.key === status)?.label || '种子';
}

function fieldValue(character: CharacterCard, label: string) {
  return character.fields.find((field) => field.label === label)?.value.trim() || '';
}

export function CharacterCards() {
  const project = useProjectStore((s) => s.project);
  const vaultPath = useProjectStore((s) => s.vaultPath);
  const chapters = useProjectStore((s) => s.chapters);
  const [board, setBoard] = useState<CharacterBoard>(emptyBoard);
  const [activeId, setActiveId] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | CharacterRole>('all');
  const [rightTab, setRightTab] = useState<'relationships' | 'conflicts'>('relationships');
  const [rightView, setRightView] = useState<'list' | 'graph'>('list');
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState('');
  const [aiResult, setAiResult] = useState('');

  const runAiAnalysis = useCallback(async (prompt: string) => {
    if (!vaultPath) return;
    setAiLoading('AI 分析中...');
    setAiResult('');
    try {
      const reply = await api.aiChat(vaultPath, {
        messages: [
          { role: 'system', content: '你是一个小说编辑顾问，专门分析角色设定、人物关系和冲突设计。根据用户给出的角色档案，给出具体、可操作的叙事建议。用中文回答，300字以内，口语化但有深度。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      });
      setAiResult(reply);
    } catch (e) {
      setAiResult('分析失败：' + String(e));
    }
    setAiLoading('');
  }, [vaultPath]);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api.readCharacterBoard(project.directory)
      .then((loaded) => {
        if (cancelled) return;
        const next = normalizeBoard(loaded);
        setBoard(next);
        setActiveId(next.characters[0]?.id || '');
        setDirty(false);
        setSaveState('idle');
      })
      .catch((e) => {
        if (!cancelled) setError('读取人设档案失败：' + String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [project?.directory]);

  useEffect(() => {
    if (!project || loading || !dirty) return;
    setSaveState('saving');
    const timer = window.setTimeout(async () => {
      try {
        await api.saveCharacterBoard(project.directory, { ...board, updatedAt: nowIso() });
        setDirty(false);
        setSaveState('saved');
      } catch (e) {
        setSaveState('error');
        setError('保存人设档案失败：' + String(e));
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [board, dirty, loading, project?.directory]);

  const charactersById = useMemo(() => {
    return new Map(board.characters.map((character) => [character.id, character]));
  }, [board.characters]);

  const activeCharacter = charactersById.get(activeId) || board.characters[0] || null;

  const filteredCharacters = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return board.characters.filter((character) => {
      const matchesRole = roleFilter === 'all' || character.role === roleFilter;
      const text = `${character.name} ${character.aliases.join(' ')} ${fieldValue(character, '表层身份')}`.toLowerCase();
      return matchesRole && (!keyword || text.includes(keyword));
    });
  }, [board.characters, query, roleFilter]);

  const activeRelationships = useMemo(() => {
    if (!activeCharacter) return [];
    return board.relationships.filter((item) => item.fromId === activeCharacter.id || item.toId === activeCharacter.id);
  }, [board.relationships, activeCharacter?.id]);

  const activeConflicts = useMemo(() => {
    if (!activeCharacter) return [];
    const relationIds = new Set(activeRelationships.map((item) => item.id));
    return board.conflicts.filter((item) => (
      item.characterIds.includes(activeCharacter.id) ||
      item.relationshipIds.some((id) => relationIds.has(id))
    ));
  }, [board.conflicts, activeCharacter?.id, activeRelationships]);

  const commitBoard = (updater: (previous: CharacterBoard) => CharacterBoard) => {
    setBoard((previous) => ({ ...updater(previous), updatedAt: nowIso() }));
    setDirty(true);
  };

  const addCharacter = () => {
    const character = createCharacter(board.characters.length);
    commitBoard((previous) => ({
      ...previous,
      characters: [character, ...previous.characters],
    }));
    setActiveId(character.id);
  };

  const patchCharacter = (id: string, patch: Partial<CharacterCard>) => {
    commitBoard((previous) => ({
      ...previous,
      characters: previous.characters.map((character) => (
        character.id === id ? { ...character, ...patch, updatedAt: nowIso() } : character
      )),
    }));
  };

  const deleteCharacter = (id: string) => {
    const character = charactersById.get(id);
    if (!character || !window.confirm(`确定删除角色「${character.name}」？相关关系会一并移除。`)) return;
    const remaining = board.characters.filter((item) => item.id !== id);
    commitBoard((previous) => {
      const removedRelationshipIds = new Set(
        previous.relationships
          .filter((item) => item.fromId === id || item.toId === id)
          .map((item) => item.id),
      );
      return {
        ...previous,
        characters: previous.characters.filter((item) => item.id !== id),
        relationships: previous.relationships.filter((item) => item.fromId !== id && item.toId !== id),
        conflicts: previous.conflicts
          .map((conflict) => ({
            ...conflict,
            characterIds: conflict.characterIds.filter((characterId) => characterId !== id),
            relationshipIds: conflict.relationshipIds.filter((relationId) => !removedRelationshipIds.has(relationId)),
            updatedAt: nowIso(),
          }))
          .filter((conflict) => conflict.characterIds.length > 0 || conflict.relationshipIds.length > 0),
      };
    });
    setActiveId(remaining[0]?.id || '');
  };

  const patchField = (fieldId: string, patch: Partial<CharacterField>) => {
    if (!activeCharacter) return;
    patchCharacter(activeCharacter.id, {
      fields: activeCharacter.fields.map((field) => field.id === fieldId ? { ...field, ...patch } : field),
    });
  };

  const addField = () => {
    if (!activeCharacter) return;
    const label = window.prompt('字段名');
    if (!label?.trim()) return;
    patchCharacter(activeCharacter.id, {
      fields: [...activeCharacter.fields, createField(label.trim())],
    });
  };

  const removeField = (fieldId: string) => {
    if (!activeCharacter) return;
    patchCharacter(activeCharacter.id, {
      fields: activeCharacter.fields.filter((field) => field.id !== fieldId),
    });
  };

  const toggleChapter = (chapterId: string) => {
    if (!activeCharacter) return;
    const exists = activeCharacter.chapterIds.includes(chapterId);
    patchCharacter(activeCharacter.id, {
      chapterIds: exists
        ? activeCharacter.chapterIds.filter((id) => id !== chapterId)
        : [...activeCharacter.chapterIds, chapterId],
    });
  };

  const addRelationship = () => {
    if (!activeCharacter) return;
    const other = board.characters.find((item) => item.id !== activeCharacter.id);
    if (!other) {
      setError('至少需要两个角色才能建立关系。');
      return;
    }
    const relationship: CharacterRelationship = {
      id: uid('rel'),
      fromId: activeCharacter.id,
      toId: other.id,
      type: '关系',
      surface: '',
      truth: '',
      tension: '',
      power: '',
      emotion: '',
      stage: '试探',
      notes: '',
      updatedAt: nowIso(),
    };
    commitBoard((previous) => ({
      ...previous,
      relationships: [relationship, ...previous.relationships],
    }));
    setRightTab('relationships');
  };

  const patchRelationship = (id: string, patch: Partial<CharacterRelationship>) => {
    commitBoard((previous) => ({
      ...previous,
      relationships: previous.relationships.map((item) => (
        item.id === id ? { ...item, ...patch, updatedAt: nowIso() } : item
      )),
    }));
  };

  const deleteRelationship = (id: string) => {
    commitBoard((previous) => ({
      ...previous,
      relationships: previous.relationships.filter((item) => item.id !== id),
      conflicts: previous.conflicts.map((item) => ({
        ...item,
        relationshipIds: item.relationshipIds.filter((relationshipId) => relationshipId !== id),
      })),
    }));
  };

  const addConflict = () => {
    if (!activeCharacter) return;
    const relation = activeRelationships[0];
    const ids = relation ? [relation.fromId, relation.toId] : [activeCharacter.id];
    const other = relation ? charactersById.get(relation.fromId === activeCharacter.id ? relation.toId : relation.fromId) : null;
    const conflict: ConflictSeed = {
      id: uid('conflict'),
      title: other ? `${activeCharacter.name} × ${other.name} 的冲突` : `${activeCharacter.name} 的冲突种子`,
      characterIds: ids,
      relationshipIds: relation ? [relation.id] : [],
      premise: '',
      pressure: '',
      possibleTurn: '',
      reverseQuestion: '',
      status: 'seed',
      updatedAt: nowIso(),
    };
    commitBoard((previous) => ({
      ...previous,
      conflicts: [conflict, ...previous.conflicts],
    }));
    setRightTab('conflicts');
  };

  const patchConflict = (id: string, patch: Partial<ConflictSeed>) => {
    commitBoard((previous) => ({
      ...previous,
      conflicts: previous.conflicts.map((item) => (
        item.id === id ? { ...item, ...patch, updatedAt: nowIso() } : item
      )),
    }));
  };

  const deleteConflict = (id: string) => {
    commitBoard((previous) => ({
      ...previous,
      conflicts: previous.conflicts.filter((item) => item.id !== id),
    }));
  };

  if (loading) {
    return (
      <div style={centerStateStyle}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>正在读取人设档案</div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>characters.json</div>
      </div>
    );
  }

  if (board.characters.length === 0) {
    return (
      <div style={centerStateStyle}>
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink-green)' }}>人设卡片</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', maxWidth: 360, textAlign: 'center', lineHeight: 1.7 }}>
          先建立角色档案，再把角色之间的张力沉淀成冲突种子，后续就能接到情节图谱。
        </div>
        <button onClick={addCharacter} style={primaryButtonStyle}>+ 新建第一个角色</button>
        {error && <div style={errorStyle}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', background: 'var(--color-tea-beige)' }}>
      <aside style={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(107,155,107,0.14)',
        background: 'rgba(250,250,247,0.58)',
      }}>
        <div style={{ padding: 14, borderBottom: '1px solid rgba(107,155,107,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink-green)' }}>人设卡片</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2 }}>
                {board.characters.length} 角色 · {board.relationships.length} 关系 · {board.conflicts.length} 冲突
              </div>
            </div>
            <button onClick={addCharacter} title="新建角色" style={iconButtonStyle}>+</button>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索角色、别名、身份"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
            {ROLE_FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setRoleFilter(item.key)}
                style={chipStyle(roleFilter === item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {filteredCharacters.map((character) => {
            const active = activeCharacter?.id === character.id;
            const desire = fieldValue(character, '欲望');
            const identity = fieldValue(character, '表层身份');
            return (
              <button
                key={character.id}
                onClick={() => setActiveId(character.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderLeft: active ? `4px solid ${character.color}` : '4px solid transparent',
                  background: active ? 'rgba(255,255,255,0.76)' : 'transparent',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: character.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {character.name}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleLabel(character.role)}{identity ? ` · ${identity}` : ''}
                </div>
                {desire && (
                  <div style={{ fontSize: 12, color: 'rgba(61,74,61,0.74)', marginTop: 5, lineHeight: 1.45 }}>
                    {desire}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(107,155,107,0.12)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
          {saveState === 'saving' && '保存中...'}
          {saveState === 'saved' && '已保存到 characters.json'}
          {saveState === 'error' && '保存失败'}
          {saveState === 'idle' && '自动保存已就绪'}
        </div>
      </aside>

      {activeCharacter && (
        <>
          <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {error && <div style={{ ...errorStyle, marginBottom: 12 }}>{error}</div>}
            <div style={{
              maxWidth: 760,
              margin: '0 auto',
              background: 'var(--color-paper-white)',
              border: '1px solid rgba(107,155,107,0.12)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(61,74,61,0.06)',
            }}>
              <div style={{ padding: 20, borderBottom: '1px solid rgba(107,155,107,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: 8,
                    background: activeCharacter.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                  }}>
                    {activeCharacter.name.trim().slice(0, 1) || '人'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <input
                      value={activeCharacter.name}
                      placeholder="输入角色姓名"
                      onFocus={() => {
                        if (activeCharacter.name === DEFAULT_CHARACTER_NAME) {
                          patchCharacter(activeCharacter.id, { name: '' });
                        }
                      }}
                      onBlur={(event) => {
                        if (!event.currentTarget.value.trim()) {
                          patchCharacter(activeCharacter.id, { name: DEFAULT_CHARACTER_NAME });
                        }
                      }}
                      onChange={(event) => patchCharacter(activeCharacter.id, { name: event.target.value })}
                      style={{
                        ...bareInputStyle,
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--color-ink-green)',
                        marginBottom: 6,
                      }}
                    />
                    <input
                      value={activeCharacter.aliases.join('、')}
                      onChange={(event) => patchCharacter(activeCharacter.id, {
                        aliases: event.target.value.split(/[、,，\s]+/).map((item) => item.trim()).filter(Boolean),
                      })}
                      placeholder="别名、称呼、马甲"
                      style={{ ...bareInputStyle, fontSize: 13, color: 'var(--color-ink-muted)' }}
                    />
                  </div>
                  <button
                    onClick={() => deleteCharacter(activeCharacter.id)}
                    title="删除角色"
                    style={{ ...ghostButtonStyle, color: '#b65f5f' }}
                  >
                    删除
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
                  <Label text="角色定位">
                    <select
                      value={activeCharacter.role}
                      onChange={(event) => patchCharacter(activeCharacter.id, { role: event.target.value as CharacterRole })}
                      style={selectStyle}
                    >
                      {ROLE_OPTIONS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </Label>
                  <Label text="颜色">
                    <div style={{ display: 'flex', gap: 5 }}>
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          title={color}
                          onClick={() => patchCharacter(activeCharacter.id, { color })}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: activeCharacter.color === color ? '2px solid var(--color-ink-green)' : '1px solid rgba(61,74,61,0.16)',
                            background: color,
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </Label>
                  <Label text="重要度">
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} onClick={() => patchCharacter(activeCharacter.id, { importance: n })}
                          title={['', '龙套', '次要', '重要配角', '核心', '灵魂'][n]}
                          style={{
                            width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
                            border: activeCharacter.importance >= n ? 'none' : '1px solid rgba(107,155,107,0.18)',
                            background: activeCharacter.importance >= n ? activeCharacter.color : 'transparent',
                            color: activeCharacter.importance >= n ? '#fff' : 'var(--color-ink-muted)',
                            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                            transition: 'all 0.12s',
                          }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </Label>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <SectionTitle title="角色内核" action={<button onClick={addField} style={ghostButtonStyle}>+ 字段</button>} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 12 }}>
                  {activeCharacter.fields.map((field) => (
                    <div key={field.id} style={fieldCardStyle}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <input
                          value={field.label}
                          onChange={(event) => patchField(field.id, { label: event.target.value })}
                          style={{ ...bareInputStyle, fontSize: 13, fontWeight: 700, color: 'var(--color-ink-green)' }}
                        />
                        <button onClick={() => removeField(field.id)} title="删除字段" style={miniIconButtonStyle}>×</button>
                      </div>
                      {field.kind === 'short' ? (
                        <input
                          value={field.value}
                          onChange={(event) => patchField(field.id, { value: event.target.value })}
                          placeholder="点击填写"
                          style={inputStyle}
                        />
                      ) : (
                        <textarea
                          value={field.value}
                          onChange={(event) => patchField(field.id, { value: event.target.value })}
                          placeholder="点击填写"
                          rows={4}
                          style={textareaStyle}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <SectionTitle title="出场章节" />
                {chapters.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>暂无章节。</div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {chapters.map((chapter) => {
                      const active = activeCharacter.chapterIds.includes(chapter.id);
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => toggleChapter(chapter.id)}
                          style={chipStyle(active)}
                          title={chapter.title}
                        >
                          {chapter.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside style={{
            width: 380,
            flexShrink: 0,
            borderLeft: '1px solid rgba(107,155,107,0.14)',
            background: 'rgba(250,250,247,0.65)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: 14, borderBottom: '1px solid rgba(107,155,107,0.12)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, background: 'rgba(61,74,61,0.06)', borderRadius: 8, padding: 3, flex: 1 }}>
                  <button onClick={() => setRightTab('relationships')} style={segmentStyle(rightTab === 'relationships')}>关系</button>
                  <button onClick={() => setRightTab('conflicts')} style={segmentStyle(rightTab === 'conflicts')}>冲突种子</button>
                </div>
                <button onClick={() => setRightView(rightView === 'list' ? 'graph' : 'list')}
                  style={{ ...ghostButtonStyle, fontSize: 11, padding: '4px 10px' }}>
                  {rightView === 'list' ? '图谱' : '列表'}
                </button>
              </div>
            </div>

            {/* AI result toast */}
            {aiResult && (
              <div style={{ margin: '8px 14px', padding: 12, borderRadius: 8, background: 'rgba(184,149,176,0.08)', border: '1px solid rgba(184,149,176,0.2)', fontSize: 12, color: 'var(--color-ink-green)', lineHeight: 1.7, maxHeight: 200, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent-purple)' }}>AI 分析</span>
                  <button onClick={() => setAiResult('')} style={{ ...miniIconButtonStyle, width: 20, height: 20, fontSize: 12 }}>×</button>
                </div>
                {aiResult}
              </div>
            )}
            {aiLoading && <div style={{ margin: '8px 14px', fontSize: 12, color: 'var(--color-accent-purple)' }}>{aiLoading}</div>}

            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              {rightTab === 'relationships' ? (
                rightView === 'graph' ? (
                  <RelationshipGraph
                    activeCharacter={activeCharacter}
                    relationships={activeRelationships}
                    charactersById={charactersById}
                  />
                ) : (
                <RelationshipPanel
                  activeCharacter={activeCharacter}
                  characters={board.characters}
                  relationships={activeRelationships}
                  charactersById={charactersById}
                  onAdd={addRelationship}
                  onPatch={patchRelationship}
                  onDelete={deleteRelationship}
                  runAiAnalysis={runAiAnalysis}
                />
                )
              ) : (
                <ConflictPanel
                  characters={board.characters}
                  relationships={board.relationships}
                  activeRelationships={activeRelationships}
                  conflicts={activeConflicts}
                  charactersById={charactersById}
                  onAdd={addConflict}
                  onPatch={patchConflict}
                  onDelete={deleteConflict}
                  runAiAnalysis={runAiAnalysis}
                />
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function RelationshipPanel({
  activeCharacter, characters, relationships, charactersById,
  onAdd, onPatch, onDelete,
  runAiAnalysis,
}: {
  activeCharacter: CharacterCard;
  characters: CharacterCard[];
  relationships: CharacterRelationship[];
  charactersById: Map<string, CharacterCard>;
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<CharacterRelationship>) => void;
  onDelete: (id: string) => void;
  runAiAnalysis: (prompt: string) => Promise<void>;
}) {
  return (
    <div>
      <SectionTitle title="角色关系" action={<button onClick={onAdd} style={ghostButtonStyle}>+ 关系</button>} />
      {relationships.length === 0 && (
        <div style={softHintStyle}>还没有关系边。给角色连接另一个人，才能沉淀情感、利益和秘密上的张力。</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relationships.map((relationship) => {
          const otherId = relationship.fromId === activeCharacter.id ? relationship.toId : relationship.fromId;
          const other = charactersById.get(otherId);
          return (
            <div key={relationship.id} style={panelCardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px auto', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <select
                  value={otherId}
                  onChange={(event) => {
                    if (relationship.fromId === activeCharacter.id) {
                      onPatch(relationship.id, { toId: event.target.value });
                    } else {
                      onPatch(relationship.id, { fromId: event.target.value });
                    }
                  }}
                  style={selectStyle}
                >
                  {characters.filter((item) => item.id !== activeCharacter.id).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <input
                  value={relationship.type}
                  onChange={(event) => onPatch(relationship.id, { type: event.target.value })}
                  placeholder="类型"
                  style={inputStyle}
                />
                <button onClick={() => onDelete(relationship.id)} title="删除关系" style={miniIconButtonStyle}>×</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 8 }}>
                {activeCharacter.name} 与 {other?.name || '未知角色'}
              </div>
              <select
                value={relationship.stage}
                onChange={(event) => onPatch(relationship.id, { stage: event.target.value })}
                style={{ ...selectStyle, width: '100%', marginBottom: 8 }}
              >
                {STAGE_OPTIONS.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
              <Textarea label="表面关系" value={relationship.surface} onChange={(value) => onPatch(relationship.id, { surface: value })} />
              <Textarea label="真实关系" value={relationship.truth} onChange={(value) => onPatch(relationship.id, { truth: value })} />
              <Textarea label="张力来源" value={relationship.tension} onChange={(value) => onPatch(relationship.id, { tension: value })} />
              <Textarea label="权力差/筹码" value={relationship.power} onChange={(value) => onPatch(relationship.id, { power: value })} />
              <Textarea label="情感温度" value={relationship.emotion} onChange={(value) => onPatch(relationship.id, { emotion: value })} />
              <Textarea label="备忘" value={relationship.notes} onChange={(value) => onPatch(relationship.id, { notes: value })} />
              <button
                onClick={() => {
                  const a = charactersById.get(relationship.fromId);
                  const b = charactersById.get(relationship.toId);
                  const prompt = `分析这两个角色的关系并给出可发展的冲突方向：
角色1：${a?.name || '?'} — ${a ? a.fields.filter((f) => f.value).map((f) => f.label + '：' + f.value).slice(0, 6).join('；') : ''}
角色2：${b?.name || '?'} — ${b ? b.fields.filter((f) => f.value).map((f) => f.label + '：' + f.value).slice(0, 6).join('；') : ''}
表面关系：${relationship.surface || '未填写'}
真实关系：${relationship.truth || '未填写'}
张力来源：${relationship.tension || '未填写'}
情感阶段：${relationship.stage}
请指出：1) 他们之间最危险的潜在冲突点 2) 可以推动剧情的一个具体事件 3) 关系最终可能的走向。`;
                  runAiAnalysis(prompt);
                }}
                style={{ ...ghostButtonStyle, color: 'var(--color-accent-purple)', borderColor: 'rgba(184,149,176,0.3)', marginTop: 4, width: '100%', fontSize: 11 }}>
                AI 分析
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConflictPanel({
  characters, relationships, activeRelationships, conflicts, charactersById,
  onAdd, onPatch, onDelete, runAiAnalysis,
}: {
  characters: CharacterCard[];
  relationships: CharacterRelationship[];
  activeRelationships: CharacterRelationship[];
  conflicts: ConflictSeed[];
  charactersById: Map<string, CharacterCard>;
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<ConflictSeed>) => void;
  onDelete: (id: string) => void;
  runAiAnalysis: (prompt: string) => Promise<void>;
}) {
  const activeRelationIds = new Set(activeRelationships.map((relationship) => relationship.id));

  return (
    <div>
      <SectionTitle title="冲突种子" action={<button onClick={onAdd} style={ghostButtonStyle}>+ 种子</button>} />
      {conflicts.length === 0 && (
        <div style={softHintStyle}>从人物欲望、恐惧、秘密或关系张力里提炼一个种子，再把它接到情节节点。</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {conflicts.map((conflict) => (
          <div key={conflict.id} style={panelCardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px auto', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <input
                value={conflict.title}
                onChange={(event) => onPatch(conflict.id, { title: event.target.value })}
                placeholder="冲突标题"
                style={inputStyle}
              />
              <select
                value={conflict.status}
                onChange={(event) => onPatch(conflict.id, { status: event.target.value as ConflictStatus })}
                style={selectStyle}
              >
                {STATUS_OPTIONS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
              <button onClick={() => onDelete(conflict.id)} title="删除冲突" style={miniIconButtonStyle}>×</button>
            </div>
            <div style={smallLabelStyle}>涉及角色</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {characters.map((character) => {
                const active = conflict.characterIds.includes(character.id);
                return (
                  <button
                    key={character.id}
                    onClick={() => {
                      const ids = active
                        ? conflict.characterIds.filter((id) => id !== character.id)
                        : [...conflict.characterIds, character.id];
                      onPatch(conflict.id, { characterIds: ids });
                    }}
                    style={chipStyle(active)}
                  >
                    {character.name}
                  </button>
                );
              })}
            </div>
            <div style={smallLabelStyle}>关联关系</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {relationships.length === 0 && <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>暂无关系</span>}
              {relationships.map((relationship) => {
                const active = conflict.relationshipIds.includes(relationship.id);
                const from = charactersById.get(relationship.fromId)?.name || '未知';
                const to = charactersById.get(relationship.toId)?.name || '未知';
                const nearActive = activeRelationIds.has(relationship.id);
                return (
                  <button
                    key={relationship.id}
                    onClick={() => {
                      const ids = active
                        ? conflict.relationshipIds.filter((id) => id !== relationship.id)
                        : [...conflict.relationshipIds, relationship.id];
                      onPatch(conflict.id, { relationshipIds: ids });
                    }}
                    style={{
                      ...chipStyle(active),
                      opacity: nearActive ? 1 : 0.58,
                    }}
                  >
                    {from} / {to}
                  </button>
                );
              })}
            </div>
            <Textarea label="前提：人物/关系里的张力" value={conflict.premise} onChange={(value) => onPatch(conflict.id, { premise: value })} />
            <Textarea label="施压事件：剧情如何逼他行动" value={conflict.pressure} onChange={(value) => onPatch(conflict.id, { pressure: value })} />
            <Textarea label="可能转折：冲突会把关系推向哪里" value={conflict.possibleTurn} onChange={(value) => onPatch(conflict.id, { possibleTurn: value })} />
            <Textarea label="倒推回人物：若剧情必须发生，需要补上什么动机/秘密/代价" value={conflict.reverseQuestion} onChange={(value) => onPatch(conflict.id, { reverseQuestion: value })} />
            <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 6 }}>
              状态：{conflictStatusLabel(conflict.status)}
            </div>
            <button
              onClick={() => {
                const chars = conflict.characterIds.map((id) => {
                  const ch = charactersById.get(id);
                  return ch ? `${ch.name}（${ch.fields.filter((f) => f.value).map((f) => f.label + '：' + f.value).slice(0, 4).join('；')}）` : '';
                }).filter(Boolean).join('\n');
                const prompt = `分析这个冲突种子并给出叙事建议：
冲突：《${conflict.title}》
涉及角色：${chars}
前提：${conflict.premise || '未填写'}
施压事件：${conflict.pressure || '未填写'}
可能转折：${conflict.possibleTurn || '未填写'}
倒推问题：${conflict.reverseQuestion || '未填写'}
请分析：1) 这个冲突的核心戏剧张力是什么 2) 施压事件的力度够不够，要不要加强 3) 转折是否够意外又合理 4) 如果需要倒推，角色还需要补什么动机或秘密？`;
                runAiAnalysis(prompt);
              }}
              style={{ ...ghostButtonStyle, color: 'var(--color-accent-purple)', borderColor: 'rgba(184,149,176,0.3)', marginTop: 8, width: '100%', fontSize: 11 }}>
              AI 分析
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(232,197,96,0.12)', color: 'var(--color-ink-green)', fontSize: 12, lineHeight: 1.6 }}>
        正推看“欲望、恐惧、秘密、关系张力”；倒推看“这个剧情若必须成立，需要给人物补哪一个不可退让的理由”。
      </div>
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{text}</span>
      {children}
    </label>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 10px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-green)' }}>{title}</div>
      {action}
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: 'block', marginBottom: 8 }}>
      <div style={smallLabelStyle}>{label}</div>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} style={textareaStyle} />
    </label>
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    padding: '4px 9px',
    borderRadius: 980,
    border: active ? '1px solid var(--color-bamboo-green)' : '1px solid rgba(107,155,107,0.16)',
    background: active ? 'rgba(107,155,107,0.12)' : 'rgba(255,255,255,0.55)',
    color: active ? 'var(--color-bamboo-deep)' : 'var(--color-ink-muted)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
  };
}

function segmentStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    border: 'none',
    borderRadius: 6,
    padding: '7px 10px',
    background: active ? 'var(--color-paper-white)' : 'transparent',
    color: active ? 'var(--color-ink-green)' : 'var(--color-ink-muted)',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: active ? '0 1px 4px rgba(61,74,61,0.08)' : 'none',
  };
}

const centerStateStyle: CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 12,
  color: 'var(--color-ink-green)',
  background: 'var(--color-tea-beige)',
};

const primaryButtonStyle: CSSProperties = {
  padding: '9px 20px',
  border: 'none',
  borderRadius: 980,
  background: 'linear-gradient(135deg, var(--color-accent-yellow), #d4b040)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: '0 3px 10px rgba(232,197,96,0.28)',
};

const ghostButtonStyle: CSSProperties = {
  border: '1px solid rgba(107,155,107,0.18)',
  borderRadius: 980,
  background: 'rgba(255,255,255,0.5)',
  color: 'var(--color-bamboo-deep)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 12,
  padding: '5px 11px',
};

const iconButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: 'none',
  borderRadius: 8,
  background: 'var(--color-bamboo-green)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 18,
  lineHeight: 1,
};

const miniIconButtonStyle: CSSProperties = {
  width: 24,
  height: 24,
  border: 'none',
  borderRadius: 6,
  background: 'rgba(61,74,61,0.06)',
  color: 'var(--color-ink-muted)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 15,
  lineHeight: 1,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid rgba(107,155,107,0.16)',
  borderRadius: 7,
  background: 'rgba(255,255,255,0.78)',
  color: 'var(--color-ink-green)',
  outline: 'none',
  padding: '7px 9px',
  fontFamily: 'inherit',
  fontSize: 13,
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 74,
  resize: 'vertical',
  lineHeight: 1.6,
};

const selectStyle: CSSProperties = {
  border: '1px solid rgba(107,155,107,0.16)',
  borderRadius: 7,
  background: 'rgba(255,255,255,0.8)',
  color: 'var(--color-ink-green)',
  outline: 'none',
  padding: '6px 8px',
  fontFamily: 'inherit',
  fontSize: 13,
};

const bareInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontFamily: 'inherit',
  padding: 0,
};

const fieldCardStyle: CSSProperties = {
  border: '1px solid rgba(107,155,107,0.12)',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.58)',
  padding: 12,
};

const panelCardStyle: CSSProperties = {
  border: '1px solid rgba(107,155,107,0.12)',
  borderRadius: 8,
  background: 'var(--color-paper-white)',
  padding: 12,
  boxShadow: '0 4px 12px rgba(61,74,61,0.04)',
};

const softHintStyle: CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: 'rgba(107,155,107,0.08)',
  color: 'var(--color-ink-muted)',
  fontSize: 12,
  lineHeight: 1.65,
  marginBottom: 10,
};

const smallLabelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--color-ink-muted)',
  marginBottom: 4,
};

const errorStyle: CSSProperties = {
  padding: 10,
  borderRadius: 8,
  background: 'rgba(211,47,47,0.08)',
  color: '#b13b3b',
  fontSize: 12,
  lineHeight: 1.5,
};
