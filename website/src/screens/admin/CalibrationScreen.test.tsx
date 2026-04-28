import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import {
  DEMO_ADMIN_CALIBRATION_IN_PROGRESS,
  DEMO_ADMIN_CALIBRATION_REQUIRED,
  DEMO_ADMIN_HEALTH_SIGNALS,
  DEMO_ADMIN_OPERATIONAL_STATUSES,
} from '@/mocks/admin/adminFixtures';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialSystemHealthState, useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetCalibrationStores() {
  useAdminStore.setState(createInitialAdminState());
  useSessionStore.setState(createInitialSessionState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin calibration screen', () => {
  beforeEach(() => {
    resetCalibrationStores();
    useAdminStore.getState().setAccess('granted');
    useAdminStore.getState().setActiveSection('calibration');
    useAdminStore.getState().setCalibration(DEMO_ADMIN_CALIBRATION_REQUIRED);
    useSystemHealthStore.getState().setOperationalStatuses(DEMO_ADMIN_OPERATIONAL_STATUSES);
    useSystemHealthStore.getState().setSignals(DEMO_ADMIN_HEALTH_SIGNALS);
    useUiModeStore.getState().setMode('admin');
  });

  it('renders current status, checklist, and start action when prerequisites are met', () => {
    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const workspace = within(screen.getByLabelText(/admin workspace canvas/i));

    expect(workspace.getAllByText(/calibration status/i).length).toBeGreaterThan(0);
    expect(workspace.getByText(/readiness checklist/i)).toBeInTheDocument();
    expect(workspace.getAllByRole('button', { name: /start calibration/i })[0]).toBeEnabled();
    expect(workspace.queryByRole('button', { name: /cancel calibration/i })).not.toBeInTheDocument();
  });

  it('shows cancel while calibration is in progress', () => {
    useAdminStore.getState().setCalibration(DEMO_ADMIN_CALIBRATION_IN_PROGRESS);

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    expect(
      within(screen.getByLabelText(/admin workspace canvas/i)).getAllByRole('button', {
        name: /cancel calibration/i,
      }).length,
    ).toBeGreaterThan(0);
  });

  it('falls back calmly when a prerequisite is missing', async () => {
    const user = userEvent.setup();

    useSystemHealthStore.getState().setOperationalStatuses(
      DEMO_ADMIN_OPERATIONAL_STATUSES.map((status) =>
        status.surface === 'runtime'
          ? { ...status, readiness: 'pending', summary: 'Runtime handshake is still pending.' }
          : status,
      ),
    );

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const workspace = within(screen.getByLabelText(/admin workspace canvas/i));

    expect(screen.getByText(/calibration waits on 1 prerequisite/i)).toBeInTheDocument();
    expect(workspace.getAllByRole('button', { name: /start calibration/i })[0]).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /return to shopper/i }));

    expect(useUiModeStore.getState().mode).toBe('shopper');
  });
});
