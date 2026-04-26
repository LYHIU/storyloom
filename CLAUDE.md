# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run build          # TypeScript check + Vite production build
npm run tauri build    # Full Tauri build → src-tauri/target/release/novel-writer.exe
npm run tauri dev      # Tauri dev mode with hot reload on port 1420
```

Exe output: `src-tauri/target/release/novel-writer.exe`. The MSI bundling step (WiX) sometimes fails — the exe is still usable directly.

## Architecture

**书织 StoryLoom** — a desktop web novel writing tool for Windows. Tauri v2 Rust backend + React 18 / TypeScript 5 / Vite 5 frontend, with tiptap (ProseMirray) editor. All data stored locally as Markdown + JSON, zero cloud dependency.

### Vault System (类似 Obsidian)

The app uses a vault-based multi-novel model, not one-project-at-a-time:

1. **VaultSetupPage** → user picks a root directory (the "vault")
2. **VaultHome** → shows all novels in that vault as a card grid, each novel is a subdirectory containing `project.json` + `chapters/`
3. **WritingSpace** → editor + outline sidebar for a single novel
4. "← 返回书库" in StatusBar → back to VaultHome
5. Vault path persisted in `localStorage` key `storyloom-vault-path`

### Three-screen routing (App.tsx)

```
vaultPath == null  →  VaultSetupPage
vaultPath set, project == null  →  VaultHome
project set  →  WritingSpace (+ SceneTabs for 构思/码字/润色/分析)
```

React re-renders automatically through Zustand store reactivity — no manual navigation calls needed.

### Rust Backend (src-tauri/src/)

| File | Purpose |
|------|---------|
| `lib.rs` | Tauri builder, registers all 9 `#[tauri::command]` via `generate_handler![]` |
| `models.rs` | `ProjectMeta`, `Chapter`, `ChapterStatus`, `ProjectConfig` (serde) |
| `commands/project.rs` | `create_project`, `open_project`, `list_chapters` |
| `commands/file.rs` | `read_chapter`, `write_chapter`, `create_chapter`, `delete_chapter`, `rename_chapter` + helpers `update_chapter_order`, `remove_from_chapter_order`, `validate_path_in_project` |
| `commands/vault.rs` | `scan_vault` — scans a directory for subdirectories containing `project.json` |

All paths validated through `validate_path_in_project()` via `canonicalize` + prefix check before any file I/O. Chapter filenames sanitized against `..`, `/`, `\`, `\0`.

Commands are `snake_case` in Rust, auto-converted by Tauri's invoke system.

### Frontend IPC Layer (src/lib/tauri.ts)

Every Rust `#[tauri::command]` has a matching async TypeScript wrapper using `invoke()`. This is the ONLY place `invoke` is called — all other code goes through these wrappers.

### Zustand Stores (src/stores/)

Three independent stores:

- **projectStore** — vault path, vault project list, current project, chapters, all project/chapter actions
- **editorStore** — current chapter text content, dirty/save state, `loadChapter`/`save`/`setContent`
- **blackRoomStore** — 小黑屋 focus mode: target words/time, lock level, timer

Stores use `(set, get) => ({...})` pattern. State changes flow: Tauri command → store action → React re-render.

### Frontend Components

```
src/
├── App.tsx                  # Vault/workspace routing
├── App.css                  # Layout shell: .app-shell, .scene-content
├── main.tsx                 # React entry
├── index.css                # Tailwind v4 import + @theme block + body styles
├── lib/
│   ├── tauri.ts             # IPC function wrappers + shared interfaces
│   └── wordCount.ts         # Chinese character counting utility
├── stores/                  # Zustand stores (see above)
├── components/
│   ├── SceneTabs.tsx        # Top nav bar (构思/码字/润色/分析)
│   ├── VaultSetupPage.tsx   # Poetic landing, directory picker
│   └── VaultHome.tsx        # Novel card grid, "新建作品" dialog
└── scenes/
    ├── writing/
    │   ├── WritingSpace.tsx          # Layout: OutlineSidebar + Editor + StatusBar
    │   └── components/
    │       ├── Editor.tsx            # tiptap editor with Markdown bridge, auto-save
    │       ├── OutlineSidebar.tsx    # Chapter tree, drag to reorder, inline rename
    │       ├── BlackRoom.tsx         # Focus mode overlay with timer/progress
    │       └── StatusBar.tsx         # Word count, save status, 返回书库, 小黑屋
    ├── ideation/IdeationSpace.tsx    # Placeholder for 构思空间 (Phase 2)
    ├── polishing/PolishingSpace.tsx  # Placeholder for 润色空间 (Phase 2)
    └── analytics/AnalyticsSpace.tsx  # Placeholder for 分析空间 (Phase 2)
```

### Data Storage

Each novel is a directory:
```
{novel-name}/
├── project.json    # { "volumes": ["未分类"], "chapter_order": ["ch-123", ...] }
└── chapters/
    ├── ch-123.md
    ├── ch-456.md
    └── ...
```

Chapter `.md` files start with `# Title` as the first line — `rename_chapter` replaces only this line. Word counts in chapter list are Chinese character counts (Unicode range `一-鿿` + `㐀-䶿`).

### Theme: 竹林清风

Colors defined as CSS custom properties in `index.css` `@theme` block (Tailwind v4). Green palette dominates (~85% area), four accent colors for highlights:

- Backgrounds: `--color-bamboo-white` (#f2f6f0), `--color-paper-white` (#fafaf7), `--color-tea-beige` (#f6f3ed), `--color-editor-paper` (#fffef9)
- Interactive: `--color-bamboo-green` (#6b9b6b), `--color-bamboo-deep` (#4a7c4a)
- Text: `--color-ink-green` (#3d4a3d), `--color-ink-muted` (50% opacity)
- Accents: `--color-accent-orange` (蜜柑橙), `--color-accent-purple` (樱紫), `--color-accent-yellow` (雀黄), `--color-accent-blue` (天水蓝)

UI uses inline `style={{}}` objects, not CSS modules or Tailwind utility classes. Scene-specific background colors in `App.css`.

### Button Style Convention

Buttons should have physical depth (not flat). Pattern:
- Gradient background: `linear-gradient(135deg, #6b9b6b, #5a8a5a)`
- Multi-layer `boxShadow`: base shadow + subtle dark shadow
- Hover: deeper shadow + `translateY(-2px)` lift
- Active/press: reduced shadow + `translateY(0)` back to base
- Border-radius: `980` (pill shape) or `12` (cards/panels)
