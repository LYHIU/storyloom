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
