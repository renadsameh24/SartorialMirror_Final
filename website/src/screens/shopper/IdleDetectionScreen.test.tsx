import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppShell } from '@/app/shell/AppShell';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
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

describe('idle and detection screens', () => {
  beforeEach(() => {
    resetShopperStores();
  });

  it('renders Start Session in shopper mode', () => {
    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });

  it('starts the shopper session with keyboard focus and Enter from idle', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const startButton = screen.getByRole('button', { name: /start session/i });
    startButton.focus();

    expect(startButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByText(/readiness guide/i)).toBeInTheDocument();
  });

  it('renders detection without a continue button after the session starts', () => {
    act(() => {
      useSessionStore.getState().startSession('keyboard');
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByText(/readiness guide/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
  });

  it('updates detection guidance from waiting to auto-advanced catalog readiness without transport copy', async () => {
    act(() => {
      useSessionStore.getState().startSession('keyboard');
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    act(() => {
      useSystemHealthStore.getState().setOperationalStatuses([
        {
          surface: 'camera',
          readiness: 'pending',
          summary: 'User missing.',
          updatedAt: '2026-03-24T10:00:00.000Z',
          detectionState: 'lost',
        },
        {
          surface: 'runtime',
          readiness: 'ready',
          summary: 'Runtime ready.',
          updatedAt: '2026-03-24T10:00:00.000Z',
        },
      ]);
    });

    expect(
      screen.getAllByText(/step back into view to continue\./i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/websocket|runtime event|transport/i)).not.toBeInTheDocument();

    act(() => {
      useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
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
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /choose the look you want to see in motion\./i }),
      ).toBeInTheDocument();
    });
  });
});
