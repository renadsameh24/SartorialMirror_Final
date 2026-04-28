import { describe, expect, it, vi } from 'vitest';

import { createIntegrationCatalogPort } from '@/adapters/catalog/createIntegrationCatalogPort';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';

describe('createIntegrationCatalogPort', () => {
  it('delegates loadSnapshot through the provided loader', async () => {
    const loadSnapshot = vi.fn(() =>
      Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
    );
    const port = createIntegrationCatalogPort({
      loader: {
        loadSnapshot,
      },
    });

    await expect(port.loadSnapshot()).resolves.toEqual(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT,
    );
    expect(loadSnapshot).toHaveBeenCalledTimes(1);
  });

  it('preserves optional subscribe behavior without introducing store coupling', () => {
    const subscribe = vi.fn(() => vi.fn());
    const port = createIntegrationCatalogPort({
      loader: {
        loadSnapshot: () => Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
        subscribe,
      },
    });

    expect(port.subscribe?.(() => undefined)).toBeDefined();
    expect(subscribe).toHaveBeenCalledTimes(1);
  });
});
