import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { render, screen } from '@testing-library/react';

import { AppShell } from '@/app/shell/AppShell';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import {
  DEMO_PARTIAL_FIT_RECOMMENDATION,
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
  useSystemHealthStore.getState().setOperationalStatus('unity', {
    surface: 'unity',
    readiness: 'ready',
    renderState: 'ready',
    summary: 'Unity render is ready.',
    activeGarmentId: 'tailored-blazer',
    activeSizeCode: 'M',
    updatedAt: '2026-03-24T10:00:00.000Z',
  });
}

describe('try-on screen', () => {
  beforeEach(() => {
    resetShopperStores();
  });

  it('renders variant editing, measurements, fit guidance, and degraded fallback messaging', async () => {
    const user = userEvent.setup();

    act(() => {
      seedTryOnPhase();
      useFitStore.getState().setRecommendation(DEMO_PARTIAL_FIT_RECOMMENDATION);
      useSystemHealthStore.getState().setOperationalStatus('unity', {
        surface: 'unity',
        readiness: 'partial',
        renderState: 'delayed',
        summary: 'Render catching up.',
        activeGarmentId: 'tailored-blazer',
        activeSizeCode: 'M',
        updatedAt: '2026-03-24T10:00:00.000Z',
      });
      useDegradedStore.getState().setGuidance([
        {
          id: 'guidance-try-on',
          scope: 'tryOn',
          tone: 'neutral',
          title: 'Render catching up',
          body: 'Hold position while the try-on view refreshes.',
          createdAt: '2026-03-24T10:00:00.000Z',
        },
      ]);
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByRole('group', { name: /size/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /color/i })).toBeInTheDocument();
    expect(screen.getByText(/chest/i)).toBeInTheDocument();
    expect(screen.getByText(/98 cm/i)).toBeInTheDocument();
    expect(
      screen.getByText(/a larger size may feel more comfortable\./i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/render catching up\./i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/protected stage viewport/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /large/i }));
    const [largeSizeButton] = screen.getAllByRole('button', { name: /large/i });

    expect(largeSizeButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('supports keyboard size changes and fit-details entry from the try-on surface', async () => {
    const user = userEvent.setup();

    act(() => {
      seedTryOnPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const largeButton = screen.getAllByRole('button', { name: /large/i })[0];
    largeButton?.focus();
    expect(largeButton).toHaveFocus();

    await user.keyboard('{Enter}');

    const fitDetailsButton = screen.getByRole('button', { name: /review fit notes/i });
    fitDetailsButton.focus();
    await user.keyboard('{Enter}');

    expect(useCatalogStore.getState().selection?.sizeCode).toBe('L');
    expect(useSessionStore.getState().machine.phase).toBe('fitDetails');
  });
});
