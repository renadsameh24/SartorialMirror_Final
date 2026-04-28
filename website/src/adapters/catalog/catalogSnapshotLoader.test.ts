import { describe, expect, it, vi } from 'vitest';

import { createCatalogSnapshotLoader } from '@/adapters/catalog/catalogSnapshotLoader';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';

describe('catalogSnapshotLoader', () => {
  it('returns the normalized snapshot payload when the loader succeeds', async () => {
    const loader = createCatalogSnapshotLoader({
      loadSnapshot: () => Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
    });

    await expect(loader.loadSnapshot()).resolves.toEqual(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT,
    );
  });

  it('throws a controlled error when the loader returns malformed data', async () => {
    const loader = createCatalogSnapshotLoader({
      loadSnapshot: () =>
        Promise.resolve({
          type: 'catalog.snapshot.updated',
          payload: { status: 'ready' },
        } as never),
    });

    await expect(loader.loadSnapshot()).rejects.toThrow(
      'Catalog snapshot loader returned malformed data.',
    );
  });

  it('surfaces loader rejections to the caller', async () => {
    const loader = createCatalogSnapshotLoader({
      loadSnapshot: () => Promise.reject(new Error('Local catalog read failed.')),
    });

    await expect(loader.loadSnapshot()).rejects.toThrow('Local catalog read failed.');
  });

  it('loads a snapshot from a configured local fetch URL', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
    })) as unknown as typeof fetch;
    const loader = createCatalogSnapshotLoader({
      fetchImpl,
      url: 'http://127.0.0.1:8000/catalog/snapshot',
    });

    await expect(loader.loadSnapshot()).resolves.toEqual(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT,
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/catalog/snapshot',
    );
  });
});
