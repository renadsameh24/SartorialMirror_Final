import { create } from 'zustand';

import type {
  HealthSignal,
  OperationalStatus,
  OperationalStatusMap,
  SystemSurface,
} from '@/types/system';

export type SystemHealthStoreState = {
  operationalStatuses: OperationalStatusMap;
  signals: HealthSignal[];
};

export type SystemHealthStoreActions = {
  setOperationalStatus: (
    surface: SystemSurface,
    status: OperationalStatus,
  ) => void;
  setOperationalStatuses: (statuses: OperationalStatus[]) => void;
  setSignals: (signals: HealthSignal[]) => void;
};

export type SystemHealthStore = SystemHealthStoreState & SystemHealthStoreActions;

export function createInitialSystemHealthState(): SystemHealthStoreState {
  return {
    operationalStatuses: {},
    signals: [],
  };
}

export const useSystemHealthStore = create<SystemHealthStore>()((set) => ({
  ...createInitialSystemHealthState(),
  setOperationalStatus: (surface, status) =>
    set((state) => ({
      operationalStatuses: {
        ...state.operationalStatuses,
        [surface]: status,
      },
    })),
  setOperationalStatuses: (statuses) =>
    set((state) => ({
      operationalStatuses: statuses.reduce<OperationalStatusMap>(
        (nextState, status) => ({
          ...nextState,
          [status.surface]: status,
        }),
        state.operationalStatuses,
      ),
    })),
  setSignals: (signals) => set({ signals }),
}));
