import { create } from 'zustand';
import type { ProjectMeta, Chapter } from '../lib/tauri';
import * as api from '../lib/tauri';

interface ProjectState {
  project: ProjectMeta | null;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;

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
