import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { render, screen } from '@testing-library/react';

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

function seedFitDetailsPhase() {
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
  useSystemHealthStore.getState().setOperationalStatus('unity', {
    surface: 'unity',
    readiness: 'ready',
    renderState: 'ready',
    summary: 'Unity render is ready.',
    activeGarmentId: 'tailored-blazer',
    activeSizeCode: 'M',
    updatedAt: '2026-03-24T10:00:00.000Z',
  });
  useSessionStore.getState().openFitDetails();
}

describe('fit details screen', () => {
  beforeEach(() => {
    resetShopperStores();
  });

  it('renders the rail takeover with back navigation and applies the recommended size when available', async () => {
    const user = userEvent.setup();

    act(() => {
      seedFitDetailsPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getAllByRole('button', { name: /back to try-on/i }).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /apply recommended size/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/alternative garment/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /apply recommended size/i }));

    expect(useCatalogStore.getState().selection?.sizeCode).toBe('L');
  });

  it('keeps back-to-try-on and end-session keyboard operable from fit details', async () => {
    const user = userEvent.setup();

    act(() => {
      seedFitDetailsPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const [backButton] = screen.getAllByRole('button', { name: /back to try-on/i });
    backButton?.focus();
    expect(backButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(useSessionStore.getState().machine.phase).toBe('tryOn');

    act(() => {
      useSessionStore.getState().openFitDetails();
    });

    const [endButton] = screen.getAllByRole('button', { name: /end session/i });
    endButton?.focus();
    expect(endButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(useSessionStore.getState().machine.phase).toBe('sessionEnd');
  });
});
