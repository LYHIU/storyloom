import { create } from 'zustand';
import type { ProjectMeta, Chapter } from '../lib/tauri';
import * as api from '../lib/tauri';

interface ProjectState {
  vaultPath: string | null;
  vaultProjects: ProjectMeta[];
  project: ProjectMeta | null;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;

  setVaultPath: (path: string) => Promise<void>;
  clearVaultPath: () => void;
  scanVault: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  deleteProject: (projectPath: string) => Promise<void>;
  openProject: (path: string) => Promise<void>;
  closeProject: () => void;
  loadChapters: () => Promise<void>;
  setActiveChapter: (chapter: Chapter) => void;
  addChapter: (fileName: string, title: string) => Promise<string>;
  removeChapter: (chapter: Chapter) => Promise<void>;
  renameChapter: (chapter: Chapter, newTitle: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  vaultPath: null,
  vaultProjects: [],
  project: null,
  chapters: [],
  activeChapter: null,
  isLoading: false,
  error: null,

  setVaultPath: async (path) => {
    set({ vaultPath: path, isLoading: true, error: null });
    localStorage.setItem('storyloom-vault-path', path);
    try {
      const projects = await api.scanVault(path);
      set({ vaultProjects: projects, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  clearVaultPath: () => {
    localStorage.removeItem('storyloom-vault-path');
    set({ vaultPath: null, vaultProjects: [], project: null, chapters: [], activeChapter: null });
  },

  scanVault: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    try {
      const projects = await api.scanVault(vaultPath);
      set({ vaultProjects: projects });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  createProject: async (name) => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    set({ isLoading: true, error: null });
    try {
      const project = await api.createProject(name, vaultPath);
      set({ project, isLoading: false });
      await get().loadChapters();
      // Refresh vault list in background
      get().scanVault();
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  deleteProject: async (projectPath) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteProject(projectPath);
      await get().scanVault();
      set({ isLoading: false });
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

  closeProject: () => {
    set({ project: null, chapters: [], activeChapter: null });
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

  renameChapter: async (chapter, newTitle) => {
    const { project } = get();
    if (!project) return;
    await api.renameChapter(chapter.file_path, project.directory, newTitle);
    await get().loadChapters();
  },

  clearError: () => set({ error: null }),
}));
