import { create } from 'zustand';

import type { FitRecommendation, FitStatus } from '@/types/fit';

export type FitStoreState = {
  recommendation: FitRecommendation | null;
  status: FitStatus;
};

export type FitStoreActions = {
  resetSessionState: () => void;
  setRecommendation: (recommendation: FitRecommendation) => void;
  setStatus: (status: FitStatus) => void;
};

export type FitStore = FitStoreState & FitStoreActions;

export function createInitialFitState(): FitStoreState {
  return {
    recommendation: null,
    status: 'idle',
  };
}

function shouldReplaceRecommendation(
  current: FitRecommendation | null,
  next: FitRecommendation,
) {
  if (!current?.updatedAt || !next.updatedAt) {
    return true;
  }

  return next.updatedAt >= current.updatedAt;
}

export const useFitStore = create<FitStore>()((set) => ({
  ...createInitialFitState(),
  resetSessionState: () =>
    set({
      ...createInitialFitState(),
    }),
  setRecommendation: (recommendation) =>
    set((state) => {
      if (!shouldReplaceRecommendation(state.recommendation, recommendation)) {
        return state;
      }

      return {
        recommendation,
        status: recommendation.confidenceBand ? 'ready' : 'partial',
      };
    }),
  setStatus: (status) => set({ status }),
}));
