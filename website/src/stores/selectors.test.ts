import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { resetSession } from '@/lib/sessionReset/resetSession';
import {
  selectSelectionReadyForTryOn,
} from '@/stores/catalog/selectors';
import {
  createInitialFitState,
  useFitStore,
} from '@/stores/fit/fitStore';
import {
  selectCurrentRecommendation,
  selectFitSummary,
} from '@/stores/fit/selectors';
import {
  createInitialMeasurementsState,
  useMeasurementsStore,
} from '@/stores/measurements/measurementsStore';
import {
  selectDisplayMeasurements,
} from '@/stores/measurements/selectors';
import {
  createInitialSessionState,
  useSessionStore,
} from '@/stores/session/sessionStore';
import {
  selectCanEndSession,
  selectCanStartSession,
} from '@/stores/session/selectors';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';
import {
  selectIsAdminMode,
  selectIsShopperMode,
} from '@/stores/uiMode/selectors';

describe('store selectors', () => {
  beforeEach(() => {
    useSessionStore.setState(createInitialSessionState());
    useCatalogStore.setState(createInitialCatalogState());
    useMeasurementsStore.setState(createInitialMeasurementsState());
    useFitStore.setState(createInitialFitState());
    useUiModeStore.setState(createInitialUiModeState());
  });

  it('derives session affordance booleans from the shopper machine', () => {
    expect(selectCanStartSession(useSessionStore.getState())).toBe(true);
    expect(selectCanEndSession(useSessionStore.getState())).toBe(false);

    useSessionStore.getState().startSession('keyboard');

    expect(selectCanStartSession(useSessionStore.getState())).toBe(false);
    expect(selectCanEndSession(useSessionStore.getState())).toBe(true);

    useSessionStore.getState().endSession();

    expect(selectCanStartSession(useSessionStore.getState())).toBe(false);
    expect(selectCanEndSession(useSessionStore.getState())).toBe(true);
  });

  it('reports whether catalog selection is ready for try-on', () => {
    expect(selectSelectionReadyForTryOn(useCatalogStore.getState())).toBe(false);

    useCatalogStore.getState().selectGarment('garment-1', '2026-03-24T00:00:00.000Z');

    expect(selectSelectionReadyForTryOn(useCatalogStore.getState())).toBe(true);
  });

  it('filters unavailable measurement values from UI-safe measurement output', () => {
    useMeasurementsStore.getState().setSnapshot({
      status: 'partial',
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
        {
          id: 'm-2',
          key: 'waist',
          label: 'Waist',
          valueCm: null,
          unit: 'cm',
          source: 'runtime',
          capturedAt: '2026-03-24T00:00:00.000Z',
        },
      ],
    });

    expect(selectDisplayMeasurements(useMeasurementsStore.getState())).toEqual([
      expect.objectContaining({ key: 'chest', valueCm: 98 }),
    ]);
  });

  it('exposes qualitative fit data without leaking numeric confidence through selectors', () => {
    useFitStore.getState().setRecommendation({
      garmentId: 'garment-1',
      evaluatedSize: 'M',
      recommendedSize: 'L',
      fitBand: 'slightlyTight',
      confidenceBand: 'medium',
      confidenceScore: 0.73,
      summary: 'Size up for a more comfortable fit.',
      reasons: ['Chest is close through the front.'],
      alternativeSize: 'L',
      updatedAt: '2026-03-24T00:00:00.000Z',
    });

    const recommendation = selectCurrentRecommendation(useFitStore.getState());

    expect(recommendation).toMatchObject({
      confidenceBand: 'medium',
      recommendedSize: 'L',
    });
    expect(recommendation).not.toHaveProperty('confidenceScore');
    expect(selectFitSummary(useFitStore.getState())).toBe(
      'Size up for a more comfortable fit.',
    );
  });

  it('returns shopper-safe empty selector output after reset', () => {
    useSessionStore.getState().startSession('keyboard');
    useCatalogStore.getState().selectGarment('garment-1', '2026-03-24T00:00:00.000Z');
    useMeasurementsStore.getState().setSnapshot({
      status: 'ready',
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
      evaluatedSize: 'M',
      recommendedSize: 'L',
      fitBand: 'slightlyTight',
      confidenceBand: 'medium',
      confidenceScore: 0.73,
      summary: 'Size up for a more comfortable fit.',
      reasons: ['Chest is close through the front.'],
      alternativeSize: 'L',
      updatedAt: '2026-03-24T00:00:00.000Z',
    });

    useSessionStore.getState().endSession();
    resetSession();

    expect(selectSelectionReadyForTryOn(useCatalogStore.getState())).toBe(false);
    expect(selectDisplayMeasurements(useMeasurementsStore.getState())).toEqual([]);
    expect(selectCurrentRecommendation(useFitStore.getState())).toBeNull();
    expect(selectFitSummary(useFitStore.getState())).toBeNull();
    expect(selectCanStartSession(useSessionStore.getState())).toBe(true);
    expect(selectCanEndSession(useSessionStore.getState())).toBe(false);
  });

  it('derives uiMode booleans from the store-backed app mode', () => {
    expect(selectIsShopperMode(useUiModeStore.getState())).toBe(true);
    expect(selectIsAdminMode(useUiModeStore.getState())).toBe(false);

    useUiModeStore.getState().setMode('admin');

    expect(selectIsShopperMode(useUiModeStore.getState())).toBe(false);
    expect(selectIsAdminMode(useUiModeStore.getState())).toBe(true);
  });
});
