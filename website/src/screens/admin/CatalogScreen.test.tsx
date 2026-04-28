import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/app/shell/AppShell';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialUiModeState, useUiModeStore } from '@/stores/uiMode/uiModeStore';

function resetCatalogAdminStores() {
  useAdminStore.setState(createInitialAdminState());
  useCatalogStore.setState(createInitialCatalogState());
  useSessionStore.setState(createInitialSessionState());
  useUiModeStore.setState(createInitialUiModeState());
}

describe('admin catalog screen', () => {
  beforeEach(() => {
    resetCatalogAdminStores();
    useAdminStore.getState().setAccess('granted');
    useAdminStore.getState().setActiveSection('catalog');
    useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
    useUiModeStore.getState().setMode('admin');
  });

  it('supports row selection, staged edits, save, and discard', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const blazerRow = screen.getByText(/tailored blazer/i).closest('button');
    expect(blazerRow).toBeTruthy();

    await user.click(blazerRow as HTMLElement);

    const inspector = within(screen.getByLabelText(/admin inspector rail/i));
    const enabledToggle = inspector.getByLabelText(/enabled/i);
    const defaultSize = inspector.getByLabelText(/default size/i);

    expect(enabledToggle).toBeChecked();

    await user.click(enabledToggle);
    await user.selectOptions(defaultSize, 'L');
    await user.click(inspector.getByRole('button', { name: /save curation/i }));

    expect(
      useAdminStore.getState().catalogCurationByGarmentId['tailored-blazer'],
    ).toEqual(
      expect.objectContaining({
        defaultSizeCode: 'L',
        enabled: false,
        garmentId: 'tailored-blazer',
      }),
    );

    await user.click(enabledToggle);
    expect(enabledToggle).not.toBeChecked();
    await user.click(inspector.getByRole('button', { name: /discard changes/i }));
    expect(enabledToggle).not.toBeChecked();
  });

  it('confirms before refresh when unsaved changes exist', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const firstRow = screen.getAllByText(/oxford shirt/i)[0]?.closest('button');
    expect(firstRow).toBeTruthy();

    await user.click(firstRow as HTMLElement);
    await user.click(within(screen.getByLabelText(/admin inspector rail/i)).getByLabelText(/enabled/i));
    await user.click(screen.getByRole('button', { name: /refresh snapshot/i }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(useAdminStore.getState().intents.catalogRefreshToken).toBe(1);

    confirmSpy.mockRestore();
  });

  it('supports keyboard row selection and save from the admin catalog surface', async () => {
    const user = userEvent.setup();

    render(<AppShell mode="admin" onModeChange={() => undefined} />);

    const blazerRow = screen.getByText(/tailored blazer/i).closest('button');
    expect(blazerRow).toBeTruthy();

    (blazerRow as HTMLElement).focus();
    expect(blazerRow).toHaveFocus();

    await user.keyboard('{Enter}');

    const inspector = within(screen.getByLabelText(/admin inspector rail/i));
    const saveButton = inspector.getByRole('button', { name: /save curation/i });

    await user.click(inspector.getByLabelText(/enabled/i));
    saveButton.focus();
    expect(saveButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(
      useAdminStore.getState().catalogCurationByGarmentId['tailored-blazer']?.enabled,
    ).toBe(false);
  });
});
