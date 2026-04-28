import { create } from 'zustand';

import type {
  MeasurementSnapshot,
  MeasurementStatus,
} from '@/types/measurements';
import type { IsoTimestamp } from '@/types/shared';

export type MeasurementsStoreState = {
  snapshot: MeasurementSnapshot | null;
  status: MeasurementStatus;
};

export type MeasurementsStoreActions = {
  resetSessionState: () => void;
  setSnapshot: (snapshot: MeasurementSnapshot) => void;
  setStatus: (status: MeasurementStatus) => void;
};

export type MeasurementsStore = MeasurementsStoreState & MeasurementsStoreActions;

export function createInitialMeasurementsState(): MeasurementsStoreState {
  return {
    snapshot: null,
    status: 'idle',
  };
}

function snapshotTimestamp(snapshot: MeasurementSnapshot | null): IsoTimestamp | null {
  if (!snapshot) {
    return null;
  }

  return (
    snapshot.lastUpdatedAt ??
    snapshot.samples.reduce<IsoTimestamp | null>((latest, sample) => {
      if (!latest || sample.capturedAt > latest) {
        return sample.capturedAt;
      }

      return latest;
    }, null)
  );
}

function shouldReplaceSnapshot(
  current: MeasurementSnapshot | null,
  next: MeasurementSnapshot,
) {
  const currentTimestamp = snapshotTimestamp(current);
  const nextTimestamp = snapshotTimestamp(next);

  if (!currentTimestamp || !nextTimestamp) {
    return true;
  }

  return nextTimestamp >= currentTimestamp;
}

export const useMeasurementsStore = create<MeasurementsStore>()((set) => ({
  ...createInitialMeasurementsState(),
  resetSessionState: () =>
    set({
      ...createInitialMeasurementsState(),
    }),
  setSnapshot: (snapshot) =>
    set((state) => {
      if (!shouldReplaceSnapshot(state.snapshot, snapshot)) {
        return state;
      }

      return {
        snapshot,
        status: snapshot.status,
      };
    }),
  setStatus: (status) =>
    set((state) => ({
      snapshot: state.snapshot ? { ...state.snapshot, status } : state.snapshot,
      status,
    })),
}));
