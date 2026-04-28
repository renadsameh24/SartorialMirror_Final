import { beforeEach, describe, expect, it } from 'vitest';

import {
  readCatalogReadiness,
  readDegradedState,
  readDetectionReadiness,
  readFitReadiness,
  readMeasurementReadiness,
  readUnityRenderReadiness,
  selectReadyToAdvance,
} from '@/lib/runtime/readModels';
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

describe('runtime read models', () => {
  beforeEach(() => {
    resetRuntimeStores();
  });

  it('derives readyToAdvance only when readiness inputs are satisfied and no blocking degraded issue exists', () => {
    useSessionStore.getState().startSession('keyboard');
    useCatalogStore.getState().setSnapshot({
      categories: [],
      garments: [],
      status: 'ready',
    });
    useSystemHealthStore.getState().setOperationalStatuses([
      {
        surface: 'camera',
        readiness: 'ready',
        summary: 'Detection ready.',
        updatedAt: '2026-03-24T10:00:00.000Z',
        detectionState: 'ready',
      },
      {
        surface: 'runtime',
        readiness: 'ready',
        summary: 'Runtime ready.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
    ]);

    expect(selectReadyToAdvance()).toBe(true);
    expect(readDetectionReadiness().state).toBe('readyToAdvance');

    useDegradedStore.getState().setIssues([
      {
        id: 'issue-runtime',
        family: 'runtime.disconnected',
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Runtime unavailable.',
        detectedAt: '2026-03-24T10:00:00.000Z',
        sessionScoped: false,
      },
    ]);

    expect(selectReadyToAdvance()).toBe(false);
    expect(readDetectionReadiness().blocking).toBe(true);
  });

  it('returns shopper-safe readiness surfaces for catalog, Unity, measurements, fit, and degraded state', () => {
    useCatalogStore.getState().setSnapshot({
      categories: [],
      garments: [],
      status: 'partial',
    });
    useMeasurementsStore.getState().setStatus('partial');
    useFitStore.getState().setStatus('unavailable');
    useSystemHealthStore.getState().setOperationalStatus('unity', {
      surface: 'unity',
      readiness: 'partial',
      summary: 'Render delayed.',
      updatedAt: '2026-03-24T10:00:00.000Z',
      renderState: 'delayed',
    });
    useDegradedStore.getState().setIssues([
      {
        id: 'issue-fit',
        family: 'fit.unavailable',
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Fit unavailable.',
        detectedAt: '2026-03-24T10:00:00.000Z',
        sessionScoped: true,
      },
    ]);

    expect(readCatalogReadiness()).toEqual({
      blocking: false,
      state: 'partial',
    });
    expect(readUnityRenderReadiness()).toMatchObject({
      state: 'delayed',
      summary: 'Render delayed.',
    });
    expect(readMeasurementReadiness()).toEqual({
      blocking: false,
      state: 'partial',
    });
    expect(readFitReadiness()).toEqual({
      blocking: true,
      state: 'unavailable',
    });
    expect(readDegradedState()).toMatchObject({
      blocking: true,
      severity: 'degraded',
    });
  });

  it('releases blocking readiness again after catalog and operational recovery', () => {
    useSessionStore.getState().startSession('keyboard');
    useCatalogStore.getState().setSnapshot({
      categories: [],
      garments: [],
      status: 'unavailable',
    });
    useSystemHealthStore.getState().setOperationalStatuses([
      {
        surface: 'camera',
        readiness: 'partial',
        summary: 'Shopper lost.',
        updatedAt: '2026-03-24T10:00:00.000Z',
        detectionState: 'lost',
      },
      {
        surface: 'runtime',
        readiness: 'unavailable',
        summary: 'Runtime unavailable.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
    ]);
    useDegradedStore.getState().setIssues([
      {
        id: 'catalog.unavailable',
        family: 'catalog.unavailable',
        surface: 'catalog',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Catalog unavailable.',
        detectedAt: '2026-03-24T10:00:00.000Z',
        sessionScoped: false,
      },
    ]);

    expect(readDetectionReadiness().readyToAdvance).toBe(false);

    useCatalogStore.getState().setSnapshot({
      categories: [],
      garments: [],
      status: 'ready',
    });
    useSystemHealthStore.getState().setOperationalStatuses([
      {
        surface: 'camera',
        readiness: 'ready',
        summary: 'Detection ready.',
        updatedAt: '2026-03-24T10:01:00.000Z',
        detectionState: 'ready',
      },
      {
        surface: 'runtime',
        readiness: 'ready',
        summary: 'Runtime ready.',
        updatedAt: '2026-03-24T10:01:00.000Z',
      },
    ]);
    useDegradedStore.getState().setIssues([]);

    expect(readDetectionReadiness().readyToAdvance).toBe(true);
    expect(selectReadyToAdvance()).toBe(true);
  });
});
