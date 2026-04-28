import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import {
  DEMO_ADMIN_HEALTH_SIGNALS,
  DEMO_ADMIN_LOG_ENTRIES,
  DEMO_ADMIN_OPERATIONAL_STATUSES,
} from '@/mocks/admin/adminFixtures';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialSystemHealthState, useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetLogStores() {
  useAdminStore.setState(createInitialAdminState());
  useSessionStore.setState(createInitialSessionState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin logs screen', () => {
  beforeEach(() => {
    resetLogStores();
    useAdminStore.getState().setAccess('granted');
    useAdminStore.getState().setActiveSection('logs');
    useAdminStore.getState().setLogs(DEMO_ADMIN_LOG_ENTRIES);
    useSystemHealthStore.getState().setOperationalStatuses(DEMO_ADMIN_OPERATIONAL_STATUSES);
    useSystemHealthStore.getState().setSignals(DEMO_ADMIN_HEALTH_SIGNALS);
    useUiModeStore.getState().setMode('admin');
  });

  it('renders filtered log rows and selected detail without raw debug views', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    await user.selectOptions(screen.getByLabelText(/filter by level/i), 'error');

    expect(screen.getByText(/unity render has not reported readiness/i)).toBeInTheDocument();
    expect(screen.queryByText(/runtime is still warming up after the last reset/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/websocket|payload|json/i)).not.toBeInTheDocument();
  });

  it('opens the inspector detail when a row is selected', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const targetRow = screen
      .getByText(/unity render has not reported readiness/i)
      .closest('button');

    expect(targetRow).toBeTruthy();

    await user.click(targetRow as HTMLElement);

    expect(screen.getByText(/log detail/i)).toBeInTheDocument();
    expect(screen.getByText(/related surface:/i)).toBeInTheDocument();
  });
});
