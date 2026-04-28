import { beforeEach, describe, expect, it } from 'vitest';

import { applyInboundEvent } from '@/lib/runtime/applyInboundEvent';
import { normalizeCatalogEvent } from '@/lib/runtime/normalizeCatalogEvent';
import { normalizeRuntimeEvent } from '@/lib/runtime/normalizeRuntimeEvent';
import { normalizeUnityEvent } from '@/lib/runtime/normalizeUnityEvent';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import {
  DEMO_HEALTHY_SIGNALS,
  DEMO_PARTIAL_FIT_RECOMMENDATION,
  DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
  DEMO_READY_FIT_RECOMMENDATION,
  DEMO_READY_MEASUREMENT_SNAPSHOT,
} from '@/mocks/runtime/runtimeFixtures';
import { createUnityRenderSequence } from '@/mocks/unity/unityFixtures';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialDegradedState, useDegradedStore } from '@/stores/degraded/degradedStore';
import { createInitialFitState, useFitStore } from '@/stores/fit/fitStore';
import { createInitialMeasurementsState, useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialSystemHealthState, useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

function resetRuntimeStores() {
  useSessionStore.setState(createInitialSessionState());
  useCatalogStore.setState(createInitialCatalogState());
  useMeasurementsStore.setState(createInitialMeasurementsState());
  useFitStore.setState(createInitialFitState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useDegradedStore.setState(createInitialDegradedState());
}

describe('runtime normalization and mapping', () => {
  beforeEach(() => {
    resetRuntimeStores();
  });

  it('maps catalog snapshot updates only into catalog and operational catalog state', () => {
    applyInboundEvent(normalizeCatalogEvent(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT));

    expect(useCatalogStore.getState().garments).toHaveLength(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload.garments.length,
    );
    expect(useCatalogStore.getState().status).toBe('ready');
    expect(useSystemHealthStore.getState().operationalStatuses.catalog?.readiness).toBe(
      'ready',
    );
    expect(useFitStore.getState().recommendation).toBeNull();
  });

  it('maps runtime health, measurement, and fit events without leaking across domains', () => {
    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.health.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        payload: {
          signals: DEMO_HEALTHY_SIGNALS,
        },
      }),
    );
    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.measurements.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
        },
      }),
    );
    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.fit.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          recommendation: DEMO_READY_FIT_RECOMMENDATION,
        },
      }),
    );

    expect(useSystemHealthStore.getState().signals).toHaveLength(4);
    expect(useMeasurementsStore.getState().snapshot).toEqual(
      DEMO_READY_MEASUREMENT_SNAPSHOT,
    );
    expect(useFitStore.getState().recommendation).toEqual(
      DEMO_READY_FIT_RECOMMENDATION,
    );
    expect(useCatalogStore.getState().garments).toEqual([]);
  });

  it('maps Unity events only into operational Unity state', () => {
    const [renderingEvent] = createUnityRenderSequence(
      'session-demo-1',
      'tailored-blazer',
      'M',
    );

    applyInboundEvent(normalizeUnityEvent(renderingEvent!));

    expect(useSystemHealthStore.getState().operationalStatuses.unity).toMatchObject({
      readiness: 'pending',
      renderState: 'rendering',
      activeGarmentId: 'tailored-blazer',
      activeSizeCode: 'M',
    });
    expect(useMeasurementsStore.getState().snapshot).toBeNull();
    expect(useFitStore.getState().recommendation).toBeNull();
  });

  it('supports recovery updates for catalog, runtime, and Unity families', () => {
    applyInboundEvent(
      normalizeCatalogEvent({
        type: 'catalog.snapshot.unavailable',
        source: 'catalog',
        timestamp: '2026-03-24T10:00:00.000Z',
        payload: {
          status: 'unavailable',
        },
      }),
    );
    expect(useCatalogStore.getState().status).toBe('unavailable');

    applyInboundEvent(normalizeCatalogEvent(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT));
    expect(useCatalogStore.getState().status).toBe('ready');

    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.measurements.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          snapshot: DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
        },
      }),
    );
    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.fit.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          recommendation: {
            ...DEMO_PARTIAL_FIT_RECOMMENDATION,
            confidenceBand: undefined,
          },
        },
      }),
    );

    expect(useMeasurementsStore.getState().status).toBe('partial');
    expect(useFitStore.getState().status).toBe('partial');

    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.measurements.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:01:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          snapshot: {
            ...DEMO_READY_MEASUREMENT_SNAPSHOT,
            lastUpdatedAt: '2026-03-24T10:01:00.000Z',
          },
        },
      }),
    );
    applyInboundEvent(
      normalizeRuntimeEvent({
        type: 'runtime.fit.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:01:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          recommendation: {
            ...DEMO_READY_FIT_RECOMMENDATION,
            updatedAt: '2026-03-24T10:01:00.000Z',
          },
        },
      }),
    );

    expect(useMeasurementsStore.getState().status).toBe('ready');
    expect(useFitStore.getState().status).toBe('ready');

    applyInboundEvent(
      normalizeUnityEvent({
        type: 'unity.render.stateUpdated',
        source: 'unity',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          renderState: 'delayed',
          activeGarmentId: 'tailored-blazer',
          activeSizeCode: 'M',
        },
      }),
    );
    expect(useSystemHealthStore.getState().operationalStatuses.unity?.renderState).toBe(
      'delayed',
    );

    applyInboundEvent(
      normalizeUnityEvent({
        type: 'unity.render.stateUpdated',
        source: 'unity',
        timestamp: '2026-03-24T10:01:00.000Z',
        sessionId: 'session-demo-1',
        payload: {
          renderState: 'ready',
          activeGarmentId: 'tailored-blazer',
          activeSizeCode: 'M',
        },
      }),
    );

    expect(useSystemHealthStore.getState().operationalStatuses.unity?.renderState).toBe(
      'ready',
    );
  });
});
