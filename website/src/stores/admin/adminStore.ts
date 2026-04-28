import { create } from 'zustand';

import type { AdminCatalogCurationMap } from '@/types/adminCatalog';
import type {
  AdminAccessState,
  AdminOperationalState,
  AdminSection,
  CalibrationState,
  OperationalLogEntry,
} from '@/types/admin';

export type AdminStoreState = {
  catalogCurationByGarmentId: AdminCatalogCurationMap;
  intents: {
    calibrationCancelToken: number;
    calibrationStartToken: number;
    catalogRefreshToken: number;
    healthRefreshToken: number;
    logsRefreshToken: number;
    requestedCalibrationProfileId?: string;
  };
  logs: OperationalLogEntry[];
  operationalState: AdminOperationalState;
};

export type AdminStoreActions = {
  setCatalogCurationEntry: (
    garmentId: string,
    curation: NonNullable<AdminStoreState['catalogCurationByGarmentId'][string]>,
  ) => void;
  requestCalibrationCancel: () => void;
  requestCalibrationStart: (profileId?: string) => void;
  requestCatalogRefresh: () => void;
  requestHealthRefresh: () => void;
  requestLogsRefresh: () => void;
  selectLogEntry: (logEntryId?: string) => void;
  setAccess: (access: AdminAccessState) => void;
  setActiveSection: (section: AdminSection) => void;
  setCalibration: (calibration: CalibrationState) => void;
  setLogs: (logs: OperationalLogEntry[]) => void;
};

export type AdminStore = AdminStoreState & AdminStoreActions;

export function createInitialAdminState(): AdminStoreState {
  return {
    catalogCurationByGarmentId: {},
    intents: {
      calibrationCancelToken: 0,
      calibrationStartToken: 0,
      catalogRefreshToken: 0,
      healthRefreshToken: 0,
      logsRefreshToken: 0,
    },
    logs: [],
    operationalState: {
      access: 'hidden',
      activeSection: 'dashboard',
      calibration: {
        status: 'idle',
      },
    },
  };
}

export const useAdminStore = create<AdminStore>()((set) => ({
  ...createInitialAdminState(),
  setCatalogCurationEntry: (garmentId, curation) =>
    set((state) => ({
      catalogCurationByGarmentId: {
        ...state.catalogCurationByGarmentId,
        [garmentId]: curation,
      },
    })),
  requestCalibrationCancel: () =>
    set((state) => ({
      intents: {
        ...state.intents,
        calibrationCancelToken: state.intents.calibrationCancelToken + 1,
      },
    })),
  requestCalibrationStart: (profileId) =>
    set((state) => ({
      intents: {
        ...state.intents,
        calibrationStartToken: state.intents.calibrationStartToken + 1,
        requestedCalibrationProfileId: profileId,
      },
    })),
  requestCatalogRefresh: () =>
    set((state) => ({
      intents: {
        ...state.intents,
        catalogRefreshToken: state.intents.catalogRefreshToken + 1,
      },
    })),
  requestHealthRefresh: () =>
    set((state) => ({
      intents: {
        ...state.intents,
        healthRefreshToken: state.intents.healthRefreshToken + 1,
      },
    })),
  requestLogsRefresh: () =>
    set((state) => ({
      intents: {
        ...state.intents,
        logsRefreshToken: state.intents.logsRefreshToken + 1,
      },
    })),
  selectLogEntry: (logEntryId) =>
    set((state) => ({
      operationalState: {
        ...state.operationalState,
        selectedLogEntryId: logEntryId,
      },
    })),
  setAccess: (access) =>
    set((state) => ({
      operationalState: {
        ...state.operationalState,
        access,
      },
    })),
  setActiveSection: (section) =>
    set((state) => ({
      operationalState: {
        ...state.operationalState,
        activeSection: section,
      },
    })),
  setCalibration: (calibration) =>
    set((state) => ({
      operationalState: {
        ...state.operationalState,
        calibration,
      },
    })),
  setLogs: (logs) => set({ logs }),
}));
