import { beforeEach, describe, expect, it } from 'vitest';

import { resetSession } from '@/lib/sessionReset/resetSession';
import { SHOPPER_RESET_ORDER } from '@/lib/sessionReset/resettableStores';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import {
  createInitialCatalogState,
  useCatalogStore,
} from '@/stores/catalog/catalogStore';
import {
  createInitialDegradedState,
  useDegradedStore,
} from '@/stores/degraded/degradedStore';
import { createInitialFitState, useFitStore } from '@/stores/fit/fitStore';
import {
  createInitialMeasurementsState,
  useMeasurementsStore,
} from '@/stores/measurements/measurementsStore';
import {
  createInitialSessionState,
  useSessionStore,
} from '@/stores/session/sessionStore';
import {
  createInitialSystemHealthState,
  useSystemHealthStore,
} from '@/stores/systemHealth/systemHealthStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

describe('resetSession', () => {
  beforeEach(() => {
    useSessionStore.setState(createInitialSessionState());
    useCatalogStore.setState(createInitialCatalogState());
    useMeasurementsStore.setState(createInitialMeasurementsState());
    useFitStore.setState(createInitialFitState());
    useSystemHealthStore.setState(createInitialSystemHealthState());
    useDegradedStore.setState(createInitialDegradedState());
    useAdminStore.setState(createInitialAdminState());
    useUiModeStore.setState(createInitialUiModeState());
  });

  it('uses the locked shopper reset order', () => {
    expect(SHOPPER_RESET_ORDER).toEqual([
      'degraded',
      'fit',
      'measurements',
      'catalog',
      'session',
    ]);
  });

  it('clears shopper-scoped state while preserving app-scoped operational state', () => {
    useSessionStore.getState().startSession('keyboard');
    useSessionStore.getState().markDetectionReady();
    useSessionStore.getState().confirmSelection();

    useCatalogStore.getState().setSnapshot({
      status: 'ready',
      categories: [{ id: 'tops', label: 'Tops', sortOrder: 1 }],
      garments: [
        {
          id: 'garment-1',
          sku: 'SKU-1',
          name: 'Blazer',
          categoryId: 'tops',
          silhouette: 'upper-body',
          status: 'active',
          availableSizes: [{ code: 'M', label: 'Medium', availability: 'available' }],
          availableColors: [
            {
              id: 'navy',
              label: 'Navy',
              variantId: 'variant-1',
              availability: 'available',
            },
          ],
        },
      ],
    });
    useCatalogStore.getState().selectGarment('garment-1', '2026-03-24T00:00:00.000Z');
    useMeasurementsStore.getState().setSnapshot({
      status: 'ready',
      samples: [
        {
          id: 'm-1',
          key: 'chest',
          label: 'Chest',
          valueCm: 98,
          unit: 'cm',
          source: 'runtime',
          capturedAt: '2026-03-24T00:00:00.000Z',
        },
      ],
      lastUpdatedAt: '2026-03-24T00:00:00.000Z',
    });
    useFitStore.getState().setRecommendation({
      garmentId: 'garment-1',
      recommendedSize: 'L',
      confidenceBand: 'medium',
      confidenceScore: 0.73,
      summary: 'Size up slightly.',
      reasons: ['Chest fit is close.'],
      updatedAt: '2026-03-24T00:00:00.000Z',
    });
    useDegradedStore.getState().setIssues([
      {
        id: 'issue-session',
        family: 'runtime.disconnected',
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Please step back slightly.',
        detectedAt: '2026-03-24T00:00:00.000Z',
        sessionScoped: true,
      },
      {
        id: 'issue-app',
        family: 'catalog.unavailable',
        surface: 'catalog',
        status: 'attention',
        shopperVisible: false,
        summary: 'Catalog source delayed.',
        detectedAt: '2026-03-24T00:00:00.000Z',
        sessionScoped: false,
      },
    ]);
    useDegradedStore.getState().setGuidance([
      {
        id: 'guidance-1',
        scope: 'detection',
        tone: 'assistive',
        title: 'Adjust position',
        body: 'Stand centered in frame.',
        createdAt: '2026-03-24T00:00:00.000Z',
      },
    ]);
    useSystemHealthStore.getState().setSignals([
      {
        surface: 'camera',
        status: 'warning',
        summary: 'Camera calibration drift.',
        updatedAt: '2026-03-24T00:00:00.000Z',
      },
    ]);
    useAdminStore.getState().setAccess('granted');
    useAdminStore.getState().setActiveSection('logs');
    useUiModeStore.getState().setMode('admin');

    useSessionStore.getState().endSession();
    resetSession();

    expect(useSessionStore.getState().machine.phase).toBe('idle');
    expect(useCatalogStore.getState().selection).toBeNull();
    expect(useCatalogStore.getState().focus).toEqual({});
    expect(useMeasurementsStore.getState().snapshot).toBeNull();
    expect(useFitStore.getState().recommendation).toBeNull();
    expect(useDegradedStore.getState().guidance).toEqual([]);
    expect(useDegradedStore.getState().issues).toEqual([
      expect.objectContaining({ id: 'issue-app', sessionScoped: false }),
    ]);

    expect(useCatalogStore.getState().garments).toHaveLength(1);
    expect(useSystemHealthStore.getState().signals).toHaveLength(1);
    expect(useAdminStore.getState().operationalState.activeSection).toBe('logs');
    expect(useUiModeStore.getState().mode).toBe('admin');
  });

  it('remains idempotent when invoked from idle and does not repopulate shopper-derived state', () => {
    useCatalogStore.getState().setSnapshot({
      status: 'ready',
      categories: [{ id: 'tops', label: 'Tops', sortOrder: 1 }],
      garments: [
        {
          id: 'garment-1',
          sku: 'SKU-1',
          name: 'Blazer',
          categoryId: 'tops',
          silhouette: 'upper-body',
          status: 'active',
          availableSizes: [{ code: 'M', label: 'Medium', availability: 'available' }],
          availableColors: [
            {
              id: 'navy',
              label: 'Navy',
              variantId: 'variant-1',
              availability: 'available',
            },
          ],
        },
      ],
    });
    useCatalogStore.getState().selectGarment('garment-1', '2026-03-24T00:00:00.000Z');
    useMeasurementsStore.getState().setSnapshot({
      status: 'partial',
      lastUpdatedAt: '2026-03-24T00:00:00.000Z',
      samples: [
        {
          id: 'm-1',
          key: 'chest',
          label: 'Chest',
          valueCm: 98,
          unit: 'cm',
          source: 'runtime',
          capturedAt: '2026-03-24T00:00:00.000Z',
        },
      ],
    });
    useFitStore.getState().setRecommendation({
      garmentId: 'garment-1',
      recommendedSize: 'M',
      confidenceBand: 'medium',
      confidenceScore: 0.8,
      summary: 'Current size works well.',
      reasons: ['Chest is aligned.'],
      updatedAt: '2026-03-24T00:00:00.000Z',
    });

    resetSession();
    resetSession();

    expect(useSessionStore.getState().machine).toEqual({ phase: 'idle' });
    expect(useCatalogStore.getState().selection).toBeNull();
    expect(useCatalogStore.getState().garments).toEqual([
      expect.objectContaining({ id: 'garment-1', name: 'Blazer' }),
    ]);
    expect(useMeasurementsStore.getState().snapshot).toBeNull();
    expect(useFitStore.getState().recommendation).toBeNull();
    expect(JSON.stringify(useCatalogStore.getState())).not.toContain('2026-03-24T00:00:00.000Z');
    expect(JSON.stringify(useMeasurementsStore.getState())).not.toContain('98');
    expect(JSON.stringify(useFitStore.getState())).not.toContain('Current size works well.');
  });
});
