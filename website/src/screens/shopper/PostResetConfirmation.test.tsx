import { act } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import {
  DEMO_READY_FIT_RECOMMENDATION,
  DEMO_READY_MEASUREMENT_SNAPSHOT,
} from '@/mocks/runtime/runtimeFixtures';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialDegradedState, useDegradedStore } from '@/stores/degraded/degradedStore';
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

function resetShopperStores() {
  useSessionStore.setState(createInitialSessionState());
  useCatalogStore.setState(createInitialCatalogState());
  useMeasurementsStore.setState(createInitialMeasurementsState());
  useFitStore.setState(createInitialFitState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useDegradedStore.setState(createInitialDegradedState());
}

function seedTryOnPhase() {
  useSessionStore.getState().startSession('keyboard');
  useSessionStore.getState().markDetectionReady();
  useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
  useCatalogStore.getState().selectGarment('tailored-blazer', '2026-03-24T10:00:00.000Z');
  useCatalogStore.getState().selectSize('M');
  useCatalogStore.getState().selectColor(
    'tailored-blazer-navy',
    'tailored-blazer-variant-navy',
  );
  useSessionStore.getState().confirmSelection();
  useMeasurementsStore.getState().setSnapshot(DEMO_READY_MEASUREMENT_SNAPSHOT);
  useFitStore.getState().setRecommendation(DEMO_READY_FIT_RECOMMENDATION);
}

describe('post-reset confirmation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetShopperStores();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows the confirmation surface for exactly 2400ms and keeps prior shopper data out of it', () => {
    act(() => {
      seedTryOnPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    act(() => {
      useSessionStore.getState().endSession();
    });

    act(() => {
      useSessionStore.getState().completeReset();
    });

    expect(screen.getByText('Session complete.')).toBeInTheDocument();
    expect(
      screen.getByText('Measurements, garment selections, and fit guidance have been removed from this device.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/tailored blazer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/chest/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/current size is the best fit\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/size l/i)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2399);
    });

    expect(screen.getByText('Session complete.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });
});
