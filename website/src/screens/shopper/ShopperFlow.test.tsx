import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

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

describe('shopper flow', () => {
  beforeEach(() => {
    resetShopperStores();
  });

  it('follows idle -> detection -> catalog -> tryOn -> fitDetails -> sessionEnd with garment-only try-on entry and editable variants', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();

    screen.getByRole('button', { name: /start session/i }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText(/readiness guide/i)).toBeInTheDocument();

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
      expect(screen.getByRole('button', { name: /enter mirror view/i })).toBeDisabled();
    });

    screen.getByRole('button', { name: /tailored blazer/i }).focus();
    await user.keyboard('{Enter}');

    const tryOnButton = screen.getByRole('button', { name: /enter mirror view/i });
    expect(tryOnButton).toBeEnabled();
    expect(screen.getByRole('group', { name: /size/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /color/i })).toBeInTheDocument();

    act(() => {
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
    });

    tryOnButton.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: /review fit notes/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /large/i }));
    expect(screen.getByRole('button', { name: /large/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /stone/i }));
    expect(screen.getByRole('button', { name: /stone/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    screen.getByRole('button', { name: /review fit notes/i }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getAllByRole('button', { name: /back to try-on/i }).length).toBeGreaterThan(0);

    const [backToTryOnButton] = screen.getAllByRole('button', {
      name: /back to try-on/i,
    });

    expect(backToTryOnButton).toBeDefined();
    await user.click(backToTryOnButton as HTMLElement);

    expect(screen.getByRole('button', { name: /return to collection/i })).toBeInTheDocument();

    const [endSessionButton] = screen.getAllByRole('button', {
      name: /end session/i,
    });

    expect(endSessionButton).toBeDefined();
    await user.click(endSessionButton as HTMLElement);

    act(() => {
      useSessionStore.getState().completeReset();
    });

    expect(useSessionStore.getState().machine.phase).toBe('idle');
    expect(screen.getByText('Session complete.')).toBeInTheDocument();
  });
});
