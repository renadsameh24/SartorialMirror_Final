import { act } from 'react';
import { render, screen } from '@testing-library/react';

import { App } from '@/app/App';
import { AppShell } from '@/app/shell/AppShell';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
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
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';
import { createInitialUiModeState } from '@/stores/uiMode/uiModeStore';

describe('App shell', () => {
  beforeEach(() => {
    useAdminStore.setState(createInitialAdminState());
    useSessionStore.setState(createInitialSessionState());
    useCatalogStore.setState(createInitialCatalogState());
    useMeasurementsStore.setState(createInitialMeasurementsState());
    useFitStore.setState(createInitialFitState());
    useSystemHealthStore.setState(createInitialSystemHealthState());
    useDegradedStore.setState(createInitialDegradedState());
    useUiModeStore.setState(createInitialUiModeState());
  });

  it('mounts the shopper shell with the expected landmarks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('app-shell')).toHaveAttribute(
      'data-shell-mode',
      'shopper',
    );
    expect(
      screen.getByRole('heading', {
        name: /a more considered fitting experience\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/protected stage viewport/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/shopper context rail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();
  });

  it('renders the admin shell variant without domain or route logic', () => {
    useAdminStore.getState().setAccess('requested');
    useUiModeStore.getState().setMode('admin');

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    expect(screen.getByTestId('app-shell')).toHaveAttribute(
      'data-shell-mode',
      'admin',
    );
    expect(screen.getByRole('heading', { name: /staff access/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/admin navigation rail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlock admin/i })).toBeDisabled();
  });

  it('switches shell mode from shopper to admin through local app state', async () => {
    await act(async () => {
      render(<App />);
    });

    act(() => {
      useAdminStore.getState().setAccess('requested');
      useUiModeStore.getState().setMode('admin');
    });

    expect(screen.getByTestId('app-shell')).toHaveAttribute(
      'data-shell-mode',
      'admin',
    );
    expect(screen.getByRole('heading', { name: /staff access/i })).toBeInTheDocument();
  });
});
