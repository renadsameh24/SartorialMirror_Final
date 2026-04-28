import { create } from 'zustand';

import type { DegradedIssue, GuidanceMessage } from '@/types/system';

export type DegradedStoreState = {
  dismissedGuidanceIds: string[];
  guidance: GuidanceMessage[];
  issues: DegradedIssue[];
};

export type DegradedStoreActions = {
  dismissGuidance: (guidanceId: string) => void;
  resetSessionState: () => void;
  setGuidance: (guidance: GuidanceMessage[]) => void;
  setIssues: (issues: DegradedIssue[]) => void;
};

export type DegradedStore = DegradedStoreState & DegradedStoreActions;

export function createInitialDegradedState(): DegradedStoreState {
  return {
    dismissedGuidanceIds: [],
    guidance: [],
    issues: [],
  };
}

export const useDegradedStore = create<DegradedStore>()((set) => ({
  ...createInitialDegradedState(),
  dismissGuidance: (guidanceId) =>
    set((state) => ({
      dismissedGuidanceIds: [...state.dismissedGuidanceIds, guidanceId],
    })),
  resetSessionState: () =>
    set((state) => ({
      dismissedGuidanceIds: [],
      guidance: [],
      issues: state.issues.filter((issue) => issue.sessionScoped === false),
    })),
  setGuidance: (guidance) => set({ guidance }),
  setIssues: (issues) => set({ issues }),
}));
