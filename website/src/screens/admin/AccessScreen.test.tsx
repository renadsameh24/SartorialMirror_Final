import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetAccessStores() {
  useAdminStore.setState(createInitialAdminState());
  useCatalogStore.setState(createInitialCatalogState());
  useSessionStore.setState(createInitialSessionState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin access screen', () => {
  beforeEach(() => {
    resetAccessStores();
    useAdminStore.getState().setAccess('requested');
    useUiModeStore.getState().setMode('admin');
  });

  it('keeps unlock disabled until six digits are present', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const pinInput = screen.getByLabelText(/admin pin/i);
    const unlockButton = screen.getByRole('button', { name: /unlock admin/i });

    expect(unlockButton).toBeDisabled();

    await user.type(pinInput, '24681');

    expect(unlockButton).toBeDisabled();

    await user.type(pinInput, '0');

    expect(unlockButton).toBeEnabled();
  });

  it('supports keyboard digits, Backspace, and Enter for the PIN gate', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const pinInput = screen.getByLabelText(/admin pin/i);
    const unlockButton = screen.getByRole('button', { name: /unlock admin/i });

    pinInput.focus();
    expect(pinInput).toHaveFocus();

    await user.keyboard('24681');
    expect(unlockButton).toBeDisabled();

    await user.keyboard('{Backspace}');
    await user.keyboard('10');

    expect(unlockButton).toBeEnabled();

    await user.keyboard('{Enter}');

    expect(useAdminStore.getState().operationalState.access).toBe('granted');
  });

  it('clears digits and shows an inline error after an invalid pin attempt', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    await user.type(screen.getByLabelText(/admin pin/i), '111111');
    await user.click(screen.getByRole('button', { name: /unlock admin/i }));

    expect(
      screen.getByText(/pin not recognized\. try again or return to shopper mode\./i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/admin pin/i)).toHaveValue('');
  });

  it('does not render shopper-specific selection or measurement copy on the access surface', () => {
    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    expect(
      screen.queryByText(/measurements and garment selections stay on this device/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/fit details/i)).not.toBeInTheDocument();
  });
});
