import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

describe('AppShell composition', () => {
  beforeEach(() => {
    useAdminStore.setState(createInitialAdminState());
    useUiModeStore.setState(createInitialUiModeState());
  });

  it('renders the shopper shell composition and excludes admin landmarks', () => {
    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByLabelText(/shopper shell band/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/protected stage viewport/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/shopper context rail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/top overlay lane/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bottom overlay lane/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/admin navigation rail/i),
    ).not.toBeInTheDocument();
  });

  it('renders the admin shell composition and excludes shopper-only landmarks', () => {
    useAdminStore.getState().setAccess('granted');
    useUiModeStore.getState().setMode('admin');

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    expect(screen.getByLabelText(/admin command bar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/admin navigation rail/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/admin workspace canvas/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/admin inspector rail/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/shopper context rail/i),
    ).not.toBeInTheDocument();
  });

  it('keeps shopper mode free of proof-only admin shell copy while leaving a subdued staff access trigger', () => {
    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();
    expect(screen.queryByText(/stage reserved/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/operational shell frame/i)).not.toBeInTheDocument();
  });

  it('keeps shopper mode free of admin unlock controls during keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    await user.tab();
    await user.tab();

    expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /unlock admin/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/admin pin/i)).not.toBeInTheDocument();
  });
});
