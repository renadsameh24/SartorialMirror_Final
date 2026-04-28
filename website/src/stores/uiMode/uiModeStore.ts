import { create } from 'zustand';

import type { UiMode } from '@/types/shared';

export type UiModeStoreState = {
  mode: UiMode;
};

export type UiModeStoreActions = {
  setMode: (mode: UiMode) => void;
};

export type UiModeStore = UiModeStoreState & UiModeStoreActions;

export function createInitialUiModeState(): UiModeStoreState {
  return {
    mode: 'shopper',
  };
}

export const useUiModeStore = create<UiModeStore>()((set) => ({
  ...createInitialUiModeState(),
  setMode: (mode) => set({ mode }),
}));
