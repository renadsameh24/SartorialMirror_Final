import { beforeEach, describe, expect, it } from 'vitest';

import {
  createInitialMeasurementsState,
  useMeasurementsStore,
} from '@/stores/measurements/measurementsStore';
import {
  DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
  DEMO_READY_MEASUREMENT_SNAPSHOT,
} from '@/mocks/runtime/runtimeFixtures';

describe('measurementsStore', () => {
  beforeEach(() => {
    useMeasurementsStore.setState(createInitialMeasurementsState());
  });

  it('transitions through partial, ready, and unavailable without losing shopper-safe status control', () => {
    expect(useMeasurementsStore.getState().status).toBe('idle');

    useMeasurementsStore.getState().setSnapshot(DEMO_PARTIAL_MEASUREMENT_SNAPSHOT);
    expect(useMeasurementsStore.getState().status).toBe('partial');

    useMeasurementsStore.getState().setSnapshot(DEMO_READY_MEASUREMENT_SNAPSHOT);
    expect(useMeasurementsStore.getState().status).toBe('ready');
    expect(useMeasurementsStore.getState().snapshot).toEqual(
      DEMO_READY_MEASUREMENT_SNAPSHOT,
    );

    useMeasurementsStore.getState().setStatus('unavailable');
    expect(useMeasurementsStore.getState().status).toBe('unavailable');
    expect(useMeasurementsStore.getState().snapshot).toEqual(
      expect.objectContaining({ status: 'unavailable' }),
    );
  });

  it('replaces snapshots only when the incoming payload is not older', () => {
    useMeasurementsStore.getState().setSnapshot(DEMO_READY_MEASUREMENT_SNAPSHOT);

    useMeasurementsStore.getState().setSnapshot({
      ...DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
      lastUpdatedAt: '2026-03-24T09:59:00.000Z',
      samples: DEMO_PARTIAL_MEASUREMENT_SNAPSHOT.samples.map((sample) =>
        sample.key === 'chest' ? { ...sample, valueCm: 91 } : sample,
      ),
    });

    expect(useMeasurementsStore.getState().snapshot).toEqual(
      DEMO_READY_MEASUREMENT_SNAPSHOT,
    );

    useMeasurementsStore.getState().setSnapshot({
      ...DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
      lastUpdatedAt: '2026-03-24T10:01:00.000Z',
    });

    expect(useMeasurementsStore.getState().snapshot).toEqual(
      expect.objectContaining({
        status: 'partial',
        lastUpdatedAt: '2026-03-24T10:01:00.000Z',
      }),
    );
  });

  it('resetSessionState clears measurement snapshots completely', () => {
    useMeasurementsStore.getState().setSnapshot(DEMO_READY_MEASUREMENT_SNAPSHOT);

    useMeasurementsStore.getState().resetSessionState();

    expect(useMeasurementsStore.getState().snapshot).toBeNull();
    expect(useMeasurementsStore.getState().status).toBe('idle');
  });
});
