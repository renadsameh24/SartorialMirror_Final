import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialSystemHealthState, useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetDashboardStores() {
  useAdminStore.setState(createInitialAdminState());
  useCatalogStore.setState(createInitialCatalogState());
  useSessionStore.setState(createInitialSessionState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin dashboard screen', () => {
  beforeEach(() => {
    resetDashboardStores();
    useAdminStore.getState().setAccess('granted');
    useUiModeStore.getState().setMode('admin');
    useAdminStore.getState().setLogs([
      {
        id: 'log-1',
        level: 'warning',
        source: 'runtime',
        message: 'Runtime is still warming up.',
        timestamp: '2026-03-24T10:00:00.000Z',
      },
      {
        id: 'log-2',
        level: 'error',
        source: 'unity',
        message: 'Unity render has not reported yet.',
        timestamp: '2026-03-24T10:01:00.000Z',
      },
    ]);
    useAdminStore.getState().setCalibration({
      status: 'required',
      lastCompletedAt: '2026-03-23T08:30:00.000Z',
    });
    useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
    useSystemHealthStore.getState().setOperationalStatuses([
      {
        surface: 'camera',
        readiness: 'ready',
        summary: 'Camera is ready.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
      {
        surface: 'runtime',
        readiness: 'partial',
        summary: 'Runtime is warming up.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
      {
        surface: 'unity',
        readiness: 'unavailable',
        summary: 'Unity has not reported yet.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
      {
        surface: 'catalog',
        readiness: 'ready',
        summary: 'Catalog snapshot is ready.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
    ]);
    useSystemHealthStore.getState().setSignals([
      {
        surface: 'runtime',
        status: 'warning',
        summary: 'Runtime is still warming up.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
      {
        surface: 'unity',
        status: 'offline',
        summary: 'Unity has not reported yet.',
        updatedAt: '2026-03-24T10:00:00.000Z',
      },
    ]);
  });

  it('renders the four summary panels and quick links', () => {
    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    expect(screen.getAllByText(/health summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/calibration summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/catalog summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/log summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /open catalog/i }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /open calibration/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /open logs/i }).length).toBeGreaterThan(0);
  });

  it('updates section selection through the nav rail', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    await user.click(
      within(screen.getByLabelText(/admin navigation rail/i)).getByRole('button', {
        name: /catalog/i,
      }),
    );

    expect(useAdminStore.getState().operationalState.activeSection).toBe('catalog');
  });
});
