import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';

export function Editor() {
  const activeChapter = useProjectStore((s) => s.activeChapter);
  const { isDirty, isSaving, loadChapter, setContent } = useEditorStore();
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: '开始码字吧...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isInternalUpdate.current) return;
      const md = htmlToMarkdown(editor.getHTML());
      setContent(md);
    },
    editorProps: {
      attributes: {
        style: 'padding: 24px 40px; outline: none; min-height: 400px; font-size: 17px; line-height: 1.8; color: var(--color-ink-green); font-family: "PingFang SC", "Microsoft YaHei", serif;',
      },
    },
  });

  // Load chapter content when active chapter changes
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

  // Auto-save every 30 seconds
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      const s = useEditorStore.getState();
      const ch = useProjectStore.getState().activeChapter;
      if (s.isDirty && ch) s.save(ch.file_path);
    }, 30000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, []);

  // Ctrl+S to save
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

  const toolbarBtn = (label: string, title: string, action: () => void, active?: boolean) => (
    <button
      onClick={action}
      title={title}
      style={{
        padding: '4px 10px', fontSize: 14, cursor: 'pointer',
        border: 'none', borderRadius: 4,
        background: active ? 'rgba(107,155,107,0.15)' : 'transparent',
        color: active ? 'var(--color-bamboo-deep)' : 'var(--color-ink-muted)',
        fontFamily: 'inherit', fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(107,155,107,0.08)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {label}
    </button>
  );

  if (!activeChapter) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-ink-muted)', fontSize: 16,
        flexDirection: 'column', gap: 12,
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
        padding: '10px 24px', borderBottom: '1px solid var(--color-bamboo-white)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--color-editor-paper)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink-green)' }}>
          {activeChapter.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
          {isSaving ? '保存中...' : isDirty ? '● 未保存' : '✓ 已保存'}
        </div>
      </div>

      {/* 格式工具栏 */}
      <div style={{
        padding: '6px 20px',
        borderBottom: '1px solid var(--color-bamboo-white)',
        background: 'var(--color-editor-paper)',
        display: 'flex', gap: 2, alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {editor && toolbarBtn('B', '加粗 (Ctrl+B)', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {editor && toolbarBtn('I', '斜体 (Ctrl+I)', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-white)', margin: '0 6px' }} />
        {editor && toolbarBtn('H1', '一级标题', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
        {editor && toolbarBtn('H2', '二级标题', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {editor && toolbarBtn('H3', '三级标题', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        <div style={{ width: 1, height: 18, background: 'var(--color-bamboo-white)', margin: '0 6px' }} />
        {editor && toolbarBtn('¶', '正文', () => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph'))}
      </div>

      {/* 编辑器区域 */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: 'var(--color-editor-paper)',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
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
