import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { render, screen, within } from '@testing-library/react';

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

function seedCatalogPhase(status: 'ready' | 'unavailable' = 'ready') {
  useSessionStore.getState().startSession('keyboard');
  useSessionStore.getState().markDetectionReady();
  useCatalogStore.getState().setSnapshot({
    ...DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload,
    status,
  });
}

describe('catalog screen', () => {
  beforeEach(() => {
    resetShopperStores();
  });

  it('renders visible categories and garments from the catalog store', () => {
    act(() => {
      seedCatalogPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const categoryGroup = screen.getByRole('group', { name: /catalog categories/i });

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(within(categoryGroup).getByRole('button', { name: /tops/i })).toBeInTheDocument();
    expect(
      within(categoryGroup).getByRole('button', { name: /outerwear/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /oxford shirt/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tailored blazer/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /studio coat/i })).not.toBeInTheDocument();
  });

  it('enables Try On after garment selection and keeps size and color optional', async () => {
    const user = userEvent.setup();

    act(() => {
      seedCatalogPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const tryOnButton = screen.getByRole('button', { name: /enter mirror view/i });
    expect(tryOnButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /oxford shirt/i }));

    expect(screen.getAllByText(/oxford shirt/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: /size/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /color/i })).toBeInTheDocument();
    expect(tryOnButton).toBeEnabled();
  });

  it('supports keyboard garment selection, variant changes, and try-on entry', async () => {
    const user = userEvent.setup();

    act(() => {
      seedCatalogPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    const garmentButton = screen.getByRole('button', { name: /tailored blazer/i });
    garmentButton.focus();
    expect(garmentButton).toHaveFocus();

    await user.keyboard('{Enter}');

    const largeButton = screen.getByRole('button', { name: /large/i });
    largeButton.focus();
    await user.keyboard(' ');

    const stoneButton = screen.getByRole('button', { name: /stone/i });
    stoneButton.focus();
    await user.keyboard(' ');

    const tryOnButton = screen.getByRole('button', { name: /enter mirror view/i });
    tryOnButton.focus();
    expect(tryOnButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(useCatalogStore.getState().selection).toEqual(
      expect.objectContaining({
        garmentId: 'tailored-blazer',
        sizeCode: 'L',
        colorId: 'tailored-blazer-stone',
      }),
    );
    expect(useSessionStore.getState().machine.phase).toBe('tryOn');
  });

  it('disables Try On and shows a calm unavailable state when the catalog is unavailable', () => {
    act(() => {
      seedCatalogPhase('unavailable');
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.getAllByText(/collection is briefly unavailable\./i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /enter mirror view/i })).toBeDisabled();
  });

  it('does not render commerce language anywhere in the catalog surface', () => {
    act(() => {
      seedCatalogPhase();
    });

    render(<AppShell mode="shopper" onModeChange={() => undefined} />);

    expect(screen.queryByText(/price|review|inventory|checkout/i)).not.toBeInTheDocument();
  });
});
