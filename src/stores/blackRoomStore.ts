import { create } from 'zustand';

type LockLevel = 'off' | 'remind' | 'lock_scene';

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

export const useBlackRoomStore = create<BlackRoomState>((set) => ({
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
