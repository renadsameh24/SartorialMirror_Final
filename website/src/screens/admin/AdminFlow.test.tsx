import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { LOCAL_ADMIN_PIN } from '@/features/admin/access/AdminPinEntry';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialDegradedState, useDegradedStore } from '@/stores/degraded/degradedStore';
import { createInitialFitState, useFitStore } from '@/stores/fit/fitStore';
import {
  createInitialMeasurementsState,
  useMeasurementsStore,
} from '@/stores/measurements/measurementsStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import {
  createInitialSystemHealthState,
  useSystemHealthStore,
} from '@/stores/systemHealth/systemHealthStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetAllStores() {
  useAdminStore.setState(createInitialAdminState());
  useCatalogStore.setState(createInitialCatalogState());
  useDegradedStore.setState(createInitialDegradedState());
  useFitStore.setState(createInitialFitState());
  useMeasurementsStore.setState(createInitialMeasurementsState());
  useSessionStore.setState(createInitialSessionState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin flow', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it(
    'blocks admin entry during an active shopper session and completes idle -> admin -> catalog curation -> shopper return',
    async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();

    screen.getByRole('button', { name: /start session/i }).focus();
    await user.keyboard('{Enter}');

    expect(screen.queryByRole('button', { name: /staff access/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /end session/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();
    }, { timeout: 4000 });

    screen.getByRole('button', { name: /staff access/i }).focus();
    await user.keyboard('{Enter}');

    screen.getByLabelText(/admin pin/i).focus();
    await user.keyboard(LOCAL_ADMIN_PIN);
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();

    const catalogNavButton = within(screen.getByLabelText(/admin navigation rail/i)).getByRole(
      'button',
      {
        name: /catalog/i,
      },
    );
    catalogNavButton.focus();
    await user.keyboard('{Enter}');

    const blazerRow = screen.getByText(/tailored blazer/i).closest('button');
    expect(blazerRow).toBeTruthy();
    (blazerRow as HTMLElement).focus();
    await user.keyboard('{Enter}');

    const inspector = within(screen.getByLabelText(/admin inspector rail/i));

    await user.click(inspector.getByLabelText(/enabled/i));
    await user.click(inspector.getByRole('button', { name: /save curation/i }));

    expect(
      useAdminStore.getState().catalogCurationByGarmentId['tailored-blazer']?.enabled,
    ).toBe(false);

    screen.getByRole('button', { name: /return to shopper/i }).focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /staff access/i })).toBeInTheDocument();
    });

    expect(useUiModeStore.getState().mode).toBe('shopper');
    },
    10000,
  );
});
