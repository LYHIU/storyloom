import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useBlackRoomStore } from '../../../stores/blackRoomStore';
import { countWebNovelWords } from '../../../lib/wordCount';

const SYMBOLS = ['「」', '『』', '——', '……', '～', '→', '←', '《》', '【】', '〖〗'];

interface EditorProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Editor({ sidebarCollapsed, onToggleSidebar }: EditorProps) {
  const chapters = useProjectStore((s) => s.chapters);
  const activeChapter = useProjectStore((s) => s.activeChapter);
  const setActiveChapter = useProjectStore((s) => s.setActiveChapter);
  const { content, isDirty, isSaving, loadChapter, setContent } = useEditorStore();
  const { isActive: blackRoomActive, start: startBlackRoom } = useBlackRoomStore();
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInternalUpdate = useRef(false);

  const [fontSize, setFontSize] = useState(17);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showSymbols, setShowSymbols] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: '开始码字吧...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isInternalUpdate.current) return;
      setContent(htmlToMarkdown(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        style: `padding: 24px 40px; outline: none; min-height: 400px; font-size: ${fontSize}px; line-height: 1.8; color: var(--color-ink-green); font-family: "PingFang SC", "Microsoft YaHei", serif;`,
      },
    },
  });

  useEffect(() => {
    if (!activeChapter || !editor) return;
    const load = async () => {
      await loadChapter(activeChapter.file_path);
      const md = useEditorStore.getState().content;
      isInternalUpdate.current = true;
      editor.commands.setContent(markdownToHtml(md));
      isInternalUpdate.current = false;
    };
    load();
  }, [activeChapter?.id]);

  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      const s = useEditorStore.getState();
      const ch = useProjectStore.getState().activeChapter;
      if (s.isDirty && ch) s.save(ch.file_path);
    }, 30000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const ch = useProjectStore.getState().activeChapter;
        if (ch) useEditorStore.getState().save(ch.file_path);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Chapter navigation
  const currentIndex = chapters.findIndex((c) => c.id === activeChapter?.id);
  const goPrev = useCallback(() => {
    if (currentIndex > 0) setActiveChapter(chapters[currentIndex - 1]);
  }, [currentIndex, chapters, setActiveChapter]);
  const goNext = useCallback(() => {
    if (currentIndex < chapters.length - 1) setActiveChapter(chapters[currentIndex + 1]);
  }, [currentIndex, chapters, setActiveChapter]);

  // Save
  const handleSave = () => {
    const ch = useProjectStore.getState().activeChapter;
    if (ch) useEditorStore.getState().save(ch.file_path);
  };

  // Black room
  const handleBlackRoom = () => {
    startBlackRoom(0, 0, 'remind');
  };

  // Insert symbol
  const insertSymbol = (sym: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(sym).run();
    setShowSymbols(false);
  };

  // Find next in editor content
  const findNext = () => {
    if (!editor || !findText) return;
    // Use simple focus-based approach: search in plain text
    const editorText = editor.getText();
    const pos = editorText.indexOf(findText, editor.state.selection.from + 1);
    if (pos === -1) {
      // Wrap around
      const wrapPos = editorText.indexOf(findText);
      if (wrapPos !== -1) setCursorPos(wrapPos);
    } else {
      setCursorPos(pos);
    }
  };

  const setCursorPos = (pos: number) => {
    if (!editor) return;
    const tr = editor.state.tr.setSelection(
      (editor.state.selection.constructor as any).near(editor.state.doc.resolve(pos))
    );
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const replaceOne = () => {
    if (!editor || !findText) return;
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to);
    if (selected.includes(findText)) {
      editor.chain().focus().insertContent(replaceText).run();
    }
  };

  const replaceAll = () => {
    if (!editor || !findText) return;
    const fullHTML = editor.getHTML();
    editor.commands.setContent(fullHTML.split(findText).join(replaceText));
  };

  const wordCount = countWebNovelWords(content);

  if (!activeChapter) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-ink-muted)', fontSize: 16, flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 40, opacity: 0.3 }}>✍</div>
        <div>选择或新建一个章节开始写作</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 标题栏 */}
      <div style={{
        padding: '8px 20px', borderBottom: '1px solid var(--color-bamboo-white)',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--color-editor-paper)',
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink-green)', flex: 1 }}>
          {activeChapter.title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
          {isSaving ? '保存中...' : isDirty ? '● 未保存' : '✓ 已保存'}
        </span>
      </div>

      {/* 工具栏 */}
      <div style={{
        padding: '4px 12px',
        borderBottom: '1px solid var(--color-bamboo-white)',
        background: 'var(--color-editor-paper)',
        display: 'flex', gap: 2, alignItems: 'center',
      }}>
        {/* 侧栏开关 */}
        <Tb icon="☰" title={sidebarCollapsed ? '展开大纲' : '收起大纲'} onClick={onToggleSidebar} />

        <Sep />

        {/* 章节导航 */}
        <Tb icon="◀" title="上一章" onClick={goPrev} disabled={currentIndex <= 0} />
        <select
          value={activeChapter?.id ?? ''}
          onChange={(e) => {
            const ch = chapters.find((c) => c.id === e.target.value);
            if (ch) setActiveChapter(ch);
          }}
          style={{
            padding: '3px 6px', fontSize: 12, border: '1px solid var(--color-bamboo-white)', borderRadius: 4,
            background: '#fff', color: 'var(--color-ink-green)', fontFamily: 'inherit',
            cursor: 'pointer', maxWidth: 120, outline: 'none',
          }}
        >
          {chapters.map((ch, i) => (
            <option key={ch.id} value={ch.id}>
              {i + 1}. {ch.title.length > 8 ? ch.title.slice(0, 8) + '…' : ch.title}
            </option>
          ))}
        </select>
        <Tb icon="▶" title="下一章" onClick={goNext} disabled={currentIndex >= chapters.length - 1} />

        <Sep />

        {/* 撤销/重做 */}
        <Tb icon="↶" title="撤销" onClick={() => editor?.chain().focus().undo().run()} />
        <Tb icon="↷" title="重做" onClick={() => editor?.chain().focus().redo().run()} />

        <Sep />

        {/* 格式 */}
        <Tb icon="B" title="加粗" bold active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <Tb icon="I" title="斜体" italic active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} />

        <Sep />

        {/* 查找替换 */}
        <Tb icon="🔍" title="查找替换" active={showFind} onClick={() => setShowFind(!showFind)} />

        {/* 字体大小 */}
        <Tb icon="A⁻" title="缩小字号" onClick={() => setFontSize((s) => Math.max(12, s - 2))} />
        <Tb icon="A⁺" title="放大字号" onClick={() => setFontSize((s) => Math.min(28, s + 2))} />

        {/* 符号 */}
        <div style={{ position: 'relative' }}>
          <Tb icon="☺" title="常用符号" active={showSymbols} onClick={() => setShowSymbols(!showSymbols)} />
          {showSymbols && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: '#fff', borderRadius: 8,
              boxShadow: '0 6px 24px rgba(61,74,61,0.15)',
              border: '1px solid rgba(107,155,107,0.12)',
              padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4, width: 180,
              zIndex: 100,
            }}>
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => insertSymbol(s)}
                  style={{
                    padding: '4px 8px', fontSize: 14, cursor: 'pointer',
                    border: '1px solid var(--color-bamboo-white)', borderRadius: 4,
                    background: '#fff', color: 'var(--color-ink-green)',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bamboo-white)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* 保存 */}
        <Tb icon="💾" title="手动保存 (Ctrl+S)" onClick={handleSave} />

        {/* 小黑屋 */}
        <Tb icon="⏱" title="小黑屋" active={blackRoomActive} onClick={handleBlackRoom} />

        <div style={{ flex: 1 }} />

        {/* 字数 */}
        <span style={{ fontSize: 13, color: 'var(--color-ink-muted)', userSelect: 'none', fontWeight: 500 }}>
          {wordCount.toLocaleString()} 字
        </span>
      </div>

      {/* 查找替换面板 */}
      {showFind && (
        <div style={{
          padding: '8px 20px', borderBottom: '1px solid var(--color-bamboo-white)',
          background: 'var(--color-bamboo-white)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <input
            type="text" value={findText} onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') findNext(); }}
            placeholder="查找..."
            style={{
              padding: '4px 10px', fontSize: 13, width: 140,
              border: '1px solid rgba(107,155,107,0.2)', borderRadius: 4,
              outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
              background: '#fff',
            }}
          />
          <input
            type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)}
            placeholder="替换为..."
            style={{
              padding: '4px 10px', fontSize: 13, width: 140,
              border: '1px solid rgba(107,155,107,0.2)', borderRadius: 4,
              outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
              background: '#fff',
            }}
          />
          <button onClick={findNext} style={panelBtn}>下一个</button>
          <button onClick={replaceOne} style={panelBtn}>替换</button>
          <button onClick={replaceAll} style={panelBtn}>全部替换</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowFind(false)} style={{ ...panelBtn, color: 'var(--color-ink-muted)' }}>
            ✕ 关闭
          </button>
        </div>
      )}

      {/* 编辑器区域 */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-editor-paper)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

/* Mini components */
function Tb({ icon, title, active, bold, italic, disabled, onClick }: {
  icon: string; title: string; active?: boolean; bold?: boolean; italic?: boolean; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '4px 8px', fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        border: 'none', borderRadius: 4,
        background: active ? 'rgba(107,155,107,0.12)' : 'transparent',
        color: disabled ? 'rgba(61,74,61,0.2)' : active ? 'var(--color-bamboo-deep)' : 'var(--color-ink-muted)',
        fontFamily: 'inherit',
        fontWeight: bold ? 700 : italic ? 400 : 'inherit',
        fontStyle: italic ? 'italic' : 'normal',
        transition: 'all 0.12s', whiteSpace: 'nowrap', opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) e.currentTarget.style.background = 'rgba(107,155,107,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-white)', margin: '0 4px' }} />;
}

const panelBtn: React.CSSProperties = {
  padding: '4px 12px', fontSize: 12, cursor: 'pointer',
  border: '1px solid rgba(107,155,107,0.15)', borderRadius: 4,
  background: '#fff', color: 'var(--color-ink-green)',
  fontFamily: 'inherit', transition: 'all 0.12s',
};

/* — Markdown ↔ HTML — */

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<hr\s*\/?>/gi, '\n***\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function markdownToHtml(md: string): string {
  if (!md.trim()) return '';
  const lines = md.split('\n');
  let result = '';
  let inPara = false;

  for (const line of lines) {
    if (/^### (.+)/.test(line)) {
      if (inPara) { result += '</p>'; inPara = false; }
      result += `<h3>${line.replace(/^### /, '')}</h3>`;
    } else if (/^## (.+)/.test(line)) {
      if (inPara) { result += '</p>'; inPara = false; }
      result += `<h2>${line.replace(/^## /, '')}</h2>`;
    } else if (/^# (.+)/.test(line)) {
      if (inPara) { result += '</p>'; inPara = false; }
      result += `<h1>${line.replace(/^# /, '')}</h1>`;
    } else if (/^\*\*\*$/.test(line.trim())) {
      if (inPara) { result += '</p>'; inPara = false; }
      result += '<hr>';
    } else if (line.trim() === '') {
      if (inPara) { result += '</p>'; inPara = false; }
    } else {
      if (!inPara) { result += '<p>'; inPara = true; }
      let formatted = line;
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      result += formatted;
    }
  }
  if (inPara) result += '</p>';
  return result;
}
