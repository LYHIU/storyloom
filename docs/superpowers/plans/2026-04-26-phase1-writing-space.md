# Phase 1 MVP — 码字空间 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 Tauri + React 桌面应用骨架，实现码字空间的核心功能（编辑器、大纲侧栏、小黑屋、本地文件存储）及竹林清风主题。

**Architecture:** Tauri v2 (Rust backend) 处理文件系统操作并通过 IPC 暴露给前端；React + TypeScript 前端渲染四个场景标签页的壳，其中码字空间完整实现；Zustand 管理客户端状态；tiptap 驱动编辑器；Tailwind CSS v4 + CSS 自定义属性实现竹林清风主题。

**Tech Stack:** Tauri v2, Rust, React 18, TypeScript 5, Vite, Tailwind CSS v4, Zustand, tiptap, @tauri-apps/api

---

## 文件结构总览

```
D:\Code\
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                    # 入口，调用 lib::run()
│   │   ├── lib.rs                     # Tauri Builder 配置 + 命令注册
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── project.rs             # 项目创建/打开/查询
│   │   │   └── file.rs                # 章节文件读写 CRUD
│   │   └── models.rs                  # 数据结构定义
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── src/
│   ├── main.tsx                       # React 入口
│   ├── App.tsx                        # 根组件：主题 + 场景标签页路由
│   ├── App.css                        # 全局样式
│   ├── index.css                      # Tailwind + 主题 CSS 变量
│   ├── scenes/
│   │   └── writing/
│   │       ├── WritingSpace.tsx       # 码字空间主布局
│   │       ├── components/
│   │       │   ├── Editor.tsx         # tiptap 编辑器
│   │       │   ├── OutlineSidebar.tsx  # 大纲树形侧栏
│   │       │   ├── BlackRoom.tsx      # 小黑屋遮罩
│   │       │   └── StatusBar.tsx      # 底部状态栏
│   │       └── index.ts
│   ├── scenes/
│   │   ├── ideation/
│   │   │   └── IdeationSpace.tsx      # 占位：构思空间
│   │   ├── polishing/
│   │   │   └── PolishingSpace.tsx     # 占位：润色空间
│   │   └── analytics/
│   │       └── AnalyticsSpace.tsx     # 占位：分析空间
│   ├── components/
│   │   └── SceneTabs.tsx              # 顶部场景标签栏
│   ├── stores/
│   │   ├── projectStore.ts            # 项目/章节状态
│   │   ├── editorStore.ts             # 编辑器状态
│   │   └── blackRoomStore.ts          # 小黑屋状态
│   └── lib/
│       ├── tauri.ts                   # Tauri IPC 调用封装
│       └── wordCount.ts              # 中文字数统计
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── index.html
```

---

### Task 1: 脚手架搭建 — Tauri v2 + React + TypeScript

**Files:** Create project structure via CLI

- [ ] **Step 1: 使用 create-tauri-app 脚手架创建项目**

```bash
cd /d/Code
npm create tauri-app@latest . -- --template react-ts
```

选择 React + TypeScript 模板，覆盖当前目录。

- [ ] **Step 2: 安装前端依赖**

```bash
cd /d/Code
npm install
npm install zustand @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tauri-apps/api @tauri-apps/plugin-dialog
npm install -D @types/node
```

- [ ] **Step 3: 安装 Tauri Rust 依赖**

检查 `src-tauri/Cargo.toml` 包含：
```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 4: 验证项目能编译**

```bash
cd /d/Code
cargo build --manifest-path src-tauri/Cargo.toml
```

预期：编译成功，无错误。

- [ ] **Step 5: 验证前端能构建**

```bash
cd /d/Code
npm run build
```

预期：Vite 构建成功。

- [ ] **Step 6: 初始化 Git 并首次提交**

```bash
cd /d/Code
git init
git add -A
git commit -m "feat: scaffold Tauri v2 + React + TypeScript project
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: 竹林清风主题系统

**Files:**
- Create: `src/index.css`
- Create: `tailwind.config.ts` (如不存在则创建)
- Modify: `src/App.css`

- [ ] **Step 1: 写入 Tailwind 配置和主题 CSS 变量**

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* 主色系 — 绿色基底 */
  --color-bamboo-white: #f2f6f0;
  --color-paper-white: #fafaf7;
  --color-tea-beige: #f6f3ed;
  --color-editor-paper: #fffef9;
  --color-bamboo-green: #6b9b6b;
  --color-bamboo-deep: #4a7c4a;
  --color-ink-green: #3d4a3d;
  --color-ink-muted: rgba(61, 74, 61, 0.6);

  /* 撞色 */
  --color-accent-orange: #f0a060;
  --color-accent-purple: #b895b0;
  --color-accent-yellow: #e8c560;
  --color-accent-blue: #7db8c4;
}

/* 基础样式 */
body {
  margin: 0;
  background-color: var(--color-bamboo-white);
  color: var(--color-ink-green);
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 2: 更新 App.css 为竹林清风样式**

```css
/* src/App.css */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.scene-content {
  flex: 1;
  overflow: hidden;
}

/* 码字空间背景 */
.scene-writing {
  background-color: var(--color-paper-white);
}

/* 构思空间占位背景 */
.scene-ideation {
  background-color: var(--color-tea-beige);
}

/* 润色空间占位背景 */
.scene-polishing {
  background-color: var(--color-bamboo-white);
}

/* 分析空间占位背景 */
.scene-analytics {
  background-color: var(--color-tea-beige);
}
```

- [ ] **Step 3: 验证样式**

在 `src/App.tsx` 中写入临时内容验证颜色正确渲染：
```tsx
function App() {
  return (
    <div className="app-shell">
      <div style={{ padding: 20, background: 'var(--color-paper-white)' }}>
        <h1 style={{ color: 'var(--color-ink-green)' }}>竹林清风</h1>
        <button style={{ background: 'var(--color-bamboo-green)', color: '#fff', padding: '8px 15px', borderRadius: 980 }}>按钮</button>
      </div>
    </div>
  );
}
```

启动开发服务器验证：
```bash
npx tauri dev
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add bamboo-breeze theme system with Tailwind
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Rust 后端 — 数据模型与项目命令

**Files:**
- Create: `src-tauri/src/models.rs`
- Create: `src-tauri/src/commands/mod.rs`
- Create: `src-tauri/src/commands/project.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: 定义数据模型**

```rust
// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMeta {
    pub name: String,
    pub directory: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,         // 文件名 (不含扩展名)
    pub title: String,      // 章节标题
    pub file_path: String,  // 完整路径
    pub word_count: usize,
    pub status: ChapterStatus,
    pub order: usize,
    pub volume: String,     // 所属卷名
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChapterStatus {
    Draft,
    Done,
    Revising,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub volumes: Vec<String>,
    pub chapter_order: Vec<String>, // chapter file names in order
}
```

- [ ] **Step 2: 实现项目命令**

```rust
// src-tauri/src/commands/project.rs
use crate::models::*;
use std::fs;
use std::path::Path;

/// 创建新项目：在目标目录创建文件夹结构
#[tauri::command]
pub fn create_project(name: String, directory: String) -> Result<ProjectMeta, String> {
    let project_dir = Path::new(&directory).join(&name);
    if project_dir.exists() {
        return Err("项目目录已存在".into());
    }
    fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;

    // 创建 chapters 子目录
    fs::create_dir_all(project_dir.join("chapters")).map_err(|e| e.to_string())?;

    // 写入初始 project.json 配置
    let config = ProjectConfig {
        volumes: vec!["未分类".into()],
        chapter_order: vec![],
    };
    let config_json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(project_dir.join("project.json"), config_json).map_err(|e| e.to_string())?;

    Ok(ProjectMeta {
        name,
        directory: project_dir.to_string_lossy().into(),
        created_at: chrono_now(),
    })
}

/// 打开已有项目，读取 project.json
#[tauri::command]
pub fn open_project(path: String) -> Result<ProjectMeta, String> {
    let project_dir = Path::new(&path);
    let config_path = project_dir.join("project.json");
    if !config_path.exists() {
        return Err("不是有效的项目目录：缺少 project.json".into());
    }
    let name = project_dir
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into();
    Ok(ProjectMeta {
        name,
        directory: path,
        created_at: String::new(),
    })
}

/// 列出项目中的所有章节
#[tauri::command]
pub fn list_chapters(project_path: String) -> Result<Vec<Chapter>, String> {
    let config_path = Path::new(&project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: ProjectConfig = serde_json::from_str(&config_str).map_err(|e| e.to_string())?;

    let chapters_dir = Path::new(&project_path).join("chapters");
    let mut chapters = Vec::new();

    if chapters_dir.exists() {
        for (i, file_name) in config.chapter_order.iter().enumerate() {
            let file_path = chapters_dir.join(format!("{}.md", file_name));
            if file_path.exists() {
                let content = fs::read_to_string(&file_path).unwrap_or_default();
                let word_count = count_chinese_chars(&content);
                let title = extract_title(&content).unwrap_or_else(|| file_name.clone());
                chapters.push(Chapter {
                    id: file_name.clone(),
                    title,
                    file_path: file_path.to_string_lossy().into(),
                    word_count,
                    status: ChapterStatus::Draft,
                    order: i,
                    volume: "未分类".into(),
                });
            }
        }
    }

    Ok(chapters)
}

fn count_chinese_chars(text: &str) -> usize {
    text.chars().filter(|c| c.is_alphabetic() || c.is_alphabetic()).filter(|c| {
        // 简单中文字符统计：Unicode 范围
        matches!(c, '\u{4e00}'..='\u{9fff}' | '\u{3400}'..='\u{4dbf}')
    }).count()
}

fn extract_title(content: &str) -> Option<String> {
    content.lines().find(|l| l.starts_with("# ")).map(|l| l.trim_start_matches("# ").to_string())
}

fn chrono_now() -> String {
    // 用简单方式生成时间戳：没有 chrono crate 就用环境
    std::env::var("BUILD_TIME").unwrap_or_else(|_| String::from("unknown"))
}
```

- [ ] **Step 3: 编写 commands/mod.rs**

```rust
// src-tauri/src/commands/mod.rs
pub mod project;
pub mod file;
```

- [ ] **Step 4: 实现文件读写命令**

```rust
// src-tauri/src/commands/file.rs
use std::fs;
use std::path::Path;

/// 读取章节 Markdown 内容
#[tauri::command]
pub fn read_chapter(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

/// 写入章节 Markdown 内容
#[tauri::command]
pub fn write_chapter(file_path: String, content: String) -> Result<(), String> {
    // 确保父目录存在
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&file_path, &content).map_err(|e| e.to_string())
}

/// 创建新章节文件
#[tauri::command]
pub fn create_chapter(project_path: String, file_name: String, title: String) -> Result<String, String> {
    let chapters_dir = Path::new(&project_path).join("chapters");
    let file_path = chapters_dir.join(format!("{}.md", file_name));
    if file_path.exists() {
        return Err("章节文件已存在".into());
    }
    let content = format!("# {}\n\n", title);
    fs::write(&file_path, &content).map_err(|e| e.to_string())?;

    // 更新 project.json 中的 chapter_order
    update_chapter_order(&project_path, &file_name)?;

    Ok(file_path.to_string_lossy().into())
}

/// 删除章节文件
#[tauri::command]
pub fn delete_chapter(file_path: String, project_path: String) -> Result<(), String> {
    fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    // 从 project.json 的 chapter_order 中移除
    let file_name = Path::new(&file_path)
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    remove_from_chapter_order(&project_path, &file_name)?;
    Ok(())
}

fn update_chapter_order(project_path: &str, file_name: &str) -> Result<(), String> {
    let config_path = Path::new(project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: crate::models::ProjectConfig =
        serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    if !config.chapter_order.contains(&file_name.to_string()) {
        config.chapter_order.push(file_name.to_string());
    }
    fs::write(&config_path, serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}

fn remove_from_chapter_order(project_path: &str, file_name: &str) -> Result<(), String> {
    let config_path = Path::new(project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: crate::models::ProjectConfig =
        serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    config.chapter_order.retain(|f| f != file_name);
    fs::write(&config_path, serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
```

- [ ] **Step 5: 更新 lib.rs 注册命令**

```rust
// src-tauri/src/lib.rs
mod commands;
mod models;

use commands::{project, file};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            project::create_project,
            project::open_project,
            project::list_chapters,
            file::read_chapter,
            file::write_chapter,
            file::create_chapter,
            file::delete_chapter,
        ])
        .run(tauri::generate_context!())
        .expect("启动应用失败");
}
```

- [ ] **Step 6: 验证 Rust 编译**

```bash
cargo build --manifest-path src-tauri/Cargo.toml
```

预期：编译成功。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: add Rust backend commands for project and file management
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: 前端 Tauri IPC 封装 + 字数统计工具

**Files:**
- Create: `src/lib/tauri.ts`
- Create: `src/lib/wordCount.ts`

- [ ] **Step 1: 编写 IPC 封装**

```typescript
// src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/core';

export interface ProjectMeta {
  name: string;
  directory: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  file_path: string;
  word_count: number;
  status: 'Draft' | 'Done' | 'Revising';
  order: number;
  volume: string;
}

export async function createProject(name: string, directory: string): Promise<ProjectMeta> {
  return invoke('create_project', { name, directory });
}

export async function openProject(path: string): Promise<ProjectMeta> {
  return invoke('open_project', { path });
}

export async function listChapters(projectPath: string): Promise<Chapter[]> {
  return invoke('list_chapters', { projectPath });
}

export async function readChapter(filePath: string): Promise<string> {
  return invoke('read_chapter', { filePath });
}

export async function writeChapter(filePath: string, content: string): Promise<void> {
  return invoke('write_chapter', { filePath, content });
}

export async function createChapter(projectPath: string, fileName: string, title: string): Promise<string> {
  return invoke('create_chapter', { projectPath, fileName, title });
}

export async function deleteChapter(filePath: string, projectPath: string): Promise<void> {
  return invoke('delete_chapter', { filePath, projectPath });
}
```

- [ ] **Step 2: 编写字数统计工具**

```typescript
// src/lib/wordCount.ts
/** 统计中文字符数（不包含标点、空格、英文） */
export function countChineseChars(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf)
    ) {
      count++;
    }
  }
  return count;
}

/** 统计总字符数（含中文、英文、数字，不含空格和换行） */
export function countTotalChars(text: string): number {
  return text.replace(/\s/g, '').length;
}

/** 统计英文单词数 */
export function countEnglishWords(text: string): number {
  const englishText = text.replace(/[^\x00-\x7f]/g, ' ').trim();
  if (!englishText) return 0;
  return englishText.split(/\s+/).length;
}

/** 估算网文字数（中文字符 + 英文单词折算） */
export function countWebNovelWords(text: string): number {
  const chinese = countChineseChars(text);
  const english = countEnglishWords(text);
  // 英文每 2 个单词大约等于 1 个中文字符的阅读量
  return chinese + Math.ceil(english / 2);
}
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add Tauri IPC wrappers and Chinese word count utility
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Zustand 状态管理

**Files:**
- Create: `src/stores/projectStore.ts`
- Create: `src/stores/editorStore.ts`
- Create: `src/stores/blackRoomStore.ts`

- [ ] **Step 1: 项目状态 Store**

```typescript
// src/stores/projectStore.ts
import { create } from 'zustand';
import type { ProjectMeta, Chapter } from '../lib/tauri';
import * as api from '../lib/tauri';

interface ProjectState {
  project: ProjectMeta | null;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createProject: (name: string, directory: string) => Promise<void>;
  openProject: (path: string) => Promise<void>;
  loadChapters: () => Promise<void>;
  setActiveChapter: (chapter: Chapter) => void;
  addChapter: (fileName: string, title: string) => Promise<string>;
  removeChapter: (chapter: Chapter) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  chapters: [],
  activeChapter: null,
  isLoading: false,
  error: null,

  createProject: async (name, directory) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.createProject(name, directory);
      set({ project, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  openProject: async (path) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.openProject(path);
      set({ project, isLoading: false });
      await get().loadChapters();
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  loadChapters: async () => {
    const { project } = get();
    if (!project) return;
    try {
      const chapters = await api.listChapters(project.directory);
      set({ chapters });
      if (chapters.length > 0 && !get().activeChapter) {
        set({ activeChapter: chapters[0] });
      }
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setActiveChapter: (chapter) => set({ activeChapter: chapter }),

  addChapter: async (fileName, title) => {
    const { project } = get();
    if (!project) throw new Error('没有打开的项目');
    const filePath = await api.createChapter(project.directory, fileName, title);
    await get().loadChapters();
    return filePath;
  },

  removeChapter: async (chapter) => {
    const { project } = get();
    if (!project) return;
    await api.deleteChapter(chapter.file_path, project.directory);
    await get().loadChapters();
  },

  clearError: () => set({ error: null }),
}));
```

- [ ] **Step 2: 编辑器状态 Store**

```typescript
// src/stores/editorStore.ts
import { create } from 'zustand';
import * as api from '../lib/tauri';

interface EditorState {
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  loadChapter: (filePath: string) => Promise<void>;
  setContent: (content: string) => void;
  save: (filePath: string) => Promise<void>;
  markClean: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  loadChapter: async (filePath) => {
    const content = await api.readChapter(filePath);
    set({ content, isDirty: false, lastSavedAt: null });
  },

  setContent: (content) => set({ content, isDirty: true }),

  save: async (filePath) => {
    set({ isSaving: true });
    await api.writeChapter(filePath, get().content);
    set({ isSaving: false, isDirty: false, lastSavedAt: Date.now() });
  },

  markClean: () => set({ isDirty: false }),
}));
```

- [ ] **Step 3: 小黑屋状态 Store**

```typescript
// src/stores/blackRoomStore.ts
import { create } from 'zustand';

type LockLevel = 'off' | 'remind' | 'lock_scene' | 'lock_app';

interface BlackRoomState {
  isActive: boolean;
  lockLevel: LockLevel;
  targetWords: number;
  targetMinutes: number;
  currentWords: number;
  elapsedSeconds: number;

  start: (targetWords: number, targetMinutes: number, level: LockLevel) => void;
  stop: () => void;
  tick: (currentWords: number) => void;
  updateElapsed: (seconds: number) => void;
}

export const useBlackRoomStore = create<BlackRoomState>((set, get) => ({
  isActive: false,
  lockLevel: 'off',
  targetWords: 0,
  targetMinutes: 0,
  currentWords: 0,
  elapsedSeconds: 0,

  start: (targetWords, targetMinutes, level) =>
    set({
      isActive: true,
      targetWords,
      targetMinutes,
      lockLevel: level,
      currentWords: 0,
      elapsedSeconds: 0,
    }),

  stop: () =>
    set({
      isActive: false,
      lockLevel: 'off',
      targetWords: 0,
      targetMinutes: 0,
    }),

  tick: (currentWords) => set({ currentWords }),

  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),
}));
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add Zustand stores for project, editor, and black room state
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: App 壳 — 场景标签栏 + 场景路由

**Files:**
- Create: `src/components/SceneTabs.tsx`
- Create: `src/scenes/ideation/IdeationSpace.tsx`
- Create: `src/scenes/polishing/PolishingSpace.tsx`
- Create: `src/scenes/analytics/AnalyticsSpace.tsx`
- Create: `src/scenes/writing/WritingSpace.tsx` (骨架)
- Create: `src/scenes/writing/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: 场景标签栏组件**

```tsx
// src/components/SceneTabs.tsx
import { useState } from 'react';

export type Scene = 'writing' | 'ideation' | 'polishing' | 'analytics';

interface SceneTabsProps {
  active: Scene;
  onChange: (scene: Scene) => void;
}

const tabs: { key: Scene; label: string }[] = [
  { key: 'ideation', label: '构思' },
  { key: 'writing', label: '码字' },
  { key: 'polishing', label: '润色' },
  { key: 'analytics', label: '分析' },
];

export function SceneTabs({ active, onChange }: SceneTabsProps) {
  return (
    <nav
      style={{
        display: 'flex',
        gap: 0,
        background: 'rgba(61, 74, 61, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 16px',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            background: active === tab.key ? 'var(--color-bamboo-green)' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '6px 20px',
            borderRadius: active === tab.key ? 8 : 0,
            fontSize: 14,
            fontWeight: active === tab.key ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: 占位场景组件**

```tsx
// src/scenes/ideation/IdeationSpace.tsx
export function IdeationSpace() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: 'var(--color-tea-beige)',
      color: 'var(--color-ink-muted)', fontSize: 16,
    }}>
      构思空间 — 即将上线
    </div>
  );
}
```

```tsx
// src/scenes/polishing/PolishingSpace.tsx
export function PolishingSpace() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: 'var(--color-bamboo-white)',
      color: 'var(--color-ink-muted)', fontSize: 16,
    }}>
      润色空间 — 即将上线
    </div>
  );
}
```

```tsx
// src/scenes/analytics/AnalyticsSpace.tsx
export function AnalyticsSpace() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: 'var(--color-tea-beige)',
      color: 'var(--color-ink-muted)', fontSize: 16,
    }}>
      分析空间 — 即将上线
    </div>
  );
}
```

- [ ] **Step 3: 码字空间骨架**

```tsx
// src/scenes/writing/WritingSpace.tsx
export function WritingSpace() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: 'var(--color-paper-white)',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-muted)' }}>
        码字空间 — 加载中...
      </div>
      <div style={{
        height: 36, background: 'var(--color-tea-beige)',
        display: 'flex', alignItems: 'center', padding: '0 16px',
        fontSize: 13, color: 'var(--color-ink-muted)',
      }}>
        今日 0/0 字 | 未打开项目
      </div>
    </div>
  );
}
```

```typescript
// src/scenes/writing/index.ts
export { WritingSpace } from './WritingSpace';
```

- [ ] **Step 4: 更新 App.tsx 整合场景路由**

```tsx
// src/App.tsx
import { useState } from 'react';
import { SceneTabs, type Scene } from './components/SceneTabs';
import { WritingSpace } from './scenes/writing';
import { IdeationSpace } from './scenes/ideation/IdeationSpace';
import { PolishingSpace } from './scenes/polishing/PolishingSpace';
import { AnalyticsSpace } from './scenes/analytics/AnalyticsSpace';
import './App.css';

function App() {
  const [activeScene, setActiveScene] = useState<Scene>('writing');

  const renderScene = () => {
    switch (activeScene) {
      case 'ideation': return <IdeationSpace />;
      case 'writing': return <WritingSpace />;
      case 'polishing': return <PolishingSpace />;
      case 'analytics': return <AnalyticsSpace />;
    }
  };

  return (
    <div className="app-shell">
      <SceneTabs active={activeScene} onChange={setActiveScene} />
      <div className="scene-content">
        {renderScene()}
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: 构建验证**

```bash
npm run build
```

预期：构建成功。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: add scene tabs, placeholder scenes, and app shell
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: 大纲侧栏组件

**Files:**
- Create: `src/scenes/writing/components/OutlineSidebar.tsx`

- [ ] **Step 1: 实现大纲侧栏**

```tsx
// src/scenes/writing/components/OutlineSidebar.tsx
import { useProjectStore } from '../../../stores/projectStore';
import { countWebNovelWords } from '../../../lib/wordCount';

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

  const handleDelete = async (chapter: typeof chapters[0]) => {
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
```

Wait — I need to add the `useState` import. Let me fix:

```tsx
import { useState } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add outline sidebar with chapter list, add, and delete
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: 编辑器组件 (tiptap)

**Files:**
- Create: `src/scenes/writing/components/Editor.tsx`

- [ ] **Step 1: 实现 tiptap 编辑器**

```tsx
// src/scenes/writing/components/Editor.tsx
import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';

export function Editor() {
  const activeChapter = useProjectStore((s) => s.activeChapter);
  const { content, isDirty, isSaving, loadChapter, setContent, save } = useEditorStore();
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: '开始码字吧...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      // 存为 Markdown（简化版：纯文本 + 标题标记）
      setContent(convertToMarkdown(editor));
    },
    editorProps: {
      attributes: {
        style: 'padding: 24px 40px; outline: none; min-height: 100%; font-size: 17px; line-height: 1.8; color: var(--color-ink-green); font-family: "PingFang SC", "Microsoft YaHei", serif;',
      },
    },
  });

  // 加载章节内容
  useEffect(() => {
    if (activeChapter) {
      loadChapter(activeChapter.file_path).then(() => {
        if (editor) {
          editor.commands.setContent(convertFromMarkdown(useEditorStore.getState().content));
        }
      });
    }
  }, [activeChapter?.id]);

  // 自动保存（30 秒间隔）
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      const state = useEditorStore.getState();
      const chapter = useProjectStore.getState().activeChapter;
      if (state.isDirty && chapter) {
        state.save(chapter.file_path);
      }
    }, 30000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, []);

  // Ctrl+S 手动保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const chapter = useProjectStore.getState().activeChapter;
        if (chapter) {
          useEditorStore.getState().save(chapter.file_path);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!activeChapter) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-ink-muted)', fontSize: 16, flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>📝</div>
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
          {isDirty ? '● 未保存' : isSaving ? '保存中...' : '✓ 已保存'}
        </div>
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

/** 简单的 tiptap JSON → Markdown 转换 */
function convertToMarkdown(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return '';
  // 使用 tiptap 的 HTML 输出，后续可替换为正式的 Markdown 序列化
  const html = editor.getHTML();
  return htmlToMarkdown(html);
}

/** 简单的 Markdown → HTML 转换（给 tiptap 加载用） */
function convertFromMarkdown(md: string): string {
  if (!md) return '';
  // 简化转换，tiptap 能直接渲染 HTML
  return mdToHtml(md);
}

/** HTML → 简易 Markdown */
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
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

/** 简易 Markdown → HTML */
function mdToHtml(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*<\/p>/g, '');
  return html;
}
```

I realized the Markdown conversion should be simpler and more robust, but this is MVP-grade. Let me clean it up — actually Tiptap has an official Markdown extension. Let me use a simpler approach: store plain text with heading markers for Phase 1.

Let me rewrite this more carefully:

```tsx
// src/scenes/writing/components/Editor.tsx
import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';

export function Editor() {
  const activeChapter = useProjectStore((s) => s.activeChapter);
  const { content, isDirty, isSaving, loadChapter, setContent, save } = useEditorStore();
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

  if (!activeChapter) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-muted)', fontSize: 16, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40, opacity: 0.3 }}>✍</div>
        <div>选择或新建一个章节开始写作</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--color-bamboo-white)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-editor-paper)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink-green)' }}>{activeChapter.title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
          {isSaving ? '保存中...' : isDirty ? '● 未保存' : '✓ 已保存'}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-editor-paper)' }}>
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
  let lines = md.split('\n');
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
      // Apply inline formatting
      let formatted = line;
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      result += formatted;
    }
  }
  if (inPara) result += '</p>';
  return result;
}
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

修复任何 TypeScript 错误。

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add tiptap editor with Markdown save/load and auto-save
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: 小黑屋组件

**Files:**
- Create: `src/scenes/writing/components/BlackRoom.tsx`

- [ ] **Step 1: 实现小黑屋**

```tsx
// src/scenes/writing/components/BlackRoom.tsx
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
      // 播放达成提示
      new Audio().play?.(); // 占位，后续可加音效
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
      {showConfig && (
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
            pointerEvents: 'none',
          }}
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
              小黑屋中... 完成目标后自动解锁
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add black room / focus mode with configurable targets
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 10: 底部状态栏 + 码字空间整合

**Files:**
- Create: `src/scenes/writing/components/StatusBar.tsx`
- Modify: `src/scenes/writing/WritingSpace.tsx`

- [ ] **Step 1: 状态栏组件**

```tsx
// src/scenes/writing/components/StatusBar.tsx
import { useBlackRoomStore } from '../../../stores/blackRoomStore';
import { BlackRoom } from './BlackRoom';
import { useEditorStore } from '../../../stores/editorStore';
import { countWebNovelWords } from '../../../lib/wordCount';
import { useProjectStore } from '../../../stores/projectStore';
import { useState } from 'react';

export function StatusBar() {
  const project = useProjectStore((s) => s.project);
  const content = useEditorStore((s) => s.content);
  const isDirty = useEditorStore((s) => s.isDirty);
  const { isActive, elapsedSeconds, currentWords, targetWords } = useBlackRoomStore();
  const [displayWords, setDisplayWords] = useState(() => countWebNovelWords(content));

  const todayWords = displayWords; // MVP: 用当前章节字数代替
  const streak = 0; // Phase 3 实现

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
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span>今日 {todayWords} 字</span>
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

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {project && (
          <span>{project.name}</span>
        )}
        <span style={{ color: isDirty ? 'var(--color-accent-orange)' : 'var(--color-ink-muted)' }}>
          {isDirty ? '●' : '✓'}
        </span>
        <BlackRoom onWordCountChange={setDisplayWords} />
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: 整合码字空间主布局**

```tsx
// src/scenes/writing/WritingSpace.tsx
import { useState } from 'react';
import { OutlineSidebar } from './components/OutlineSidebar';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';

export function WritingSpace() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: 'var(--color-paper-white)',
    }}>
      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <OutlineSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Editor />
      </div>

      {/* 底部状态栏 */}
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 3: 构建并手动验证**

```bash
npm run build
```

预期：构建成功，无 TS 错误。

- [ ] **Step 4: 启动应用验证 UI**

```bash
npx tauri dev
```

手动检查：
- 场景标签栏渲染正常，切换有视觉反馈
- 码字空间：侧栏可收起/展开，编辑器可编辑，小黑屋可配置激活
- 其他三个场景显示占位文字
- 颜色符合竹林清风方案

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: integrate writing space with status bar, sidebar, editor, and black room
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 11: 项目创建/打开流程 + 欢迎页

**Files:**
- Create: `src/components/WelcomePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 欢迎页组件**

```tsx
// src/components/WelcomePage.tsx
import { useProjectStore } from '../stores/projectStore';
import { useState } from 'react';

interface WelcomePageProps {
  onProjectOpened: () => void;
}

export function WelcomePage({ onProjectOpened }: WelcomePageProps) {
  const { createProject, openProject, isLoading, error, clearError } = useProjectStore();
  const [mode, setMode] = useState<'menu' | 'create' | 'open'>('menu');
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');
  const [openPath, setOpenPath] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !directory.trim()) return;
    await createProject(name.trim(), directory.trim());
    onProjectOpened();
  };

  const handleOpen = async () => {
    if (!openPath.trim()) return;
    await openProject(openPath.trim());
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
            background: '#fff',
          }}
        />

        <div style={{ display: 'flex', gap: 8, width: 300 }}>
          <input
            type="text" value={directory} onChange={(e) => setDirectory(e.target.value)}
            placeholder="存储目录路径 (如 D:\Novels)"
            style={{
              flex: 1, padding: '10px 16px', fontSize: 15,
              border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
              outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
              background: '#fff',
            }}
          />
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
        <input
          type="text" value={openPath} onChange={(e) => setOpenPath(e.target.value)}
          placeholder="项目目录路径 (如 D:\Novels\MyBook)"
          style={{
            width: 300, padding: '10px 16px', fontSize: 15,
            border: '1px solid var(--color-bamboo-green)', borderRadius: 8,
            outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink-green)',
            background: '#fff',
          }}
        />
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
      justifyContent: 'center', height: '100%', gap: 20,
      background: 'var(--color-paper-white)',
    }}>
      <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-ink-green)', marginBottom: 4 }}>
        竹林清风
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-ink-muted)', marginBottom: 24 }}>
        网文写作，从一片竹林开始
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
    </div>
  );
}
```

- [ ] **Step 2: 更新 App.tsx 加入项目判断**

```tsx
// src/App.tsx
import { useState } from 'react';
import { SceneTabs, type Scene } from './components/SceneTabs';
import { WritingSpace } from './scenes/writing';
import { IdeationSpace } from './scenes/ideation/IdeationSpace';
import { PolishingSpace } from './scenes/polishing/PolishingSpace';
import { AnalyticsSpace } from './scenes/analytics/AnalyticsSpace';
import { WelcomePage } from './components/WelcomePage';
import { useProjectStore } from './stores/projectStore';
import './App.css';

function App() {
  const [activeScene, setActiveScene] = useState<Scene>('writing');
  const project = useProjectStore((s) => s.project);
  const [hasProject, setHasProject] = useState(false);

  const renderScene = () => {
    switch (activeScene) {
      case 'ideation': return <IdeationSpace />;
      case 'writing': return <WritingSpace />;
      case 'polishing': return <PolishingSpace />;
      case 'analytics': return <AnalyticsSpace />;
    }
  };

  if (!hasProject) {
    return <WelcomePage onProjectOpened={() => setHasProject(true)} />;
  }

  return (
    <div className="app-shell">
      <SceneTabs active={activeScene} onChange={setActiveScene} />
      <div className="scene-content">
        {renderScene()}
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 构建验证并手动测试**

```bash
npm run build
npx tauri dev
```

手动走通完整流程：
1. 启动 → 看到欢迎页
2. 点击「新建作品」→ 输入名字和目录 → 创建成功
3. 进入码字空间 → 看到大纲侧栏空状态
4. 新建章节 → 编辑器可输入
5. Ctrl+S 保存 / 等待自动保存
6. 开启小黑屋 → 锁界面 → 完成目标解锁

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add welcome page with create/open project flow
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: 最终集成验证 + 打包测试

- [ ] **Step 1: 完整 TypeScript 类型检查**

```bash
npx tsc --noEmit
```

修复所有类型错误。

- [ ] **Step 2: 生产构建**

```bash
npm run build
cargo build --manifest-path src-tauri/Cargo.toml --release
```

- [ ] **Step 3: 打包为 exe**

```bash
npx tauri build
```

验证生成的 exe 文件在 `src-tauri/target/release/` 下，可独立运行。

- [ ] **Step 4: 运行 exe 做烟雾测试**

启动 exe → 创建项目 → 写章节 → 关闭 → 重新打开项目 → 验证章节内容保留。

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: complete Phase 1 MVP - writing space with bamboo-breeze theme
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 1 完成标准

- [x] Tauri v2 + React + TypeScript 项目可编译运行
- [x] 竹林清风主题全局生效，四个场景有色区分
- [x] 欢迎页：新建项目（创建目录 + project.json）/ 打开项目
- [x] 大纲侧栏：章节列表、新建章节、删除章节、选中切换
- [x] 编辑器：tiptap 富文本编辑、Markdown 简陋双向转换、Ctrl+S 保存
- [x] 自动保存：30 秒间隔
- [x] 小黑屋：配置目标字数/时长/锁定级别、倒计时、进度条、目标达成自动解锁
- [x] 状态栏：显示今日字数、保存状态、小黑屋状态
- [x] 三个占位场景显示「即将上线」
- [x] 打包为 Windows exe 可独立运行
