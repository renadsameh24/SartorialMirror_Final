import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';

export type CatalogSnapshotLoader = {
  loadSnapshot: () => Promise<
    Extract<CatalogInboundEvent, { type: 'catalog.snapshot.updated' }>
  >;
  subscribe?: (listener: (event: CatalogInboundEvent) => void) => () => void;
};

type CatalogSnapshotLoaderOptions = {
  fetchImpl?: typeof fetch;
  loadSnapshot?: () => Promise<
    Extract<CatalogInboundEvent, { type: 'catalog.snapshot.updated' }>
  >;
  subscribe?: (listener: (event: CatalogInboundEvent) => void) => () => void;
  url?: string;
};

function isSnapshotUpdatedEvent(
  value: CatalogInboundEvent,
): value is Extract<CatalogInboundEvent, { type: 'catalog.snapshot.updated' }> {
  return (
    value.type === 'catalog.snapshot.updated' &&
    Array.isArray(value.payload?.categories) &&
    Array.isArray(value.payload?.garments)
  );
}

export function createCatalogSnapshotLoader(
  options: CatalogSnapshotLoaderOptions = {},
): CatalogSnapshotLoader {
  const rawLoadSnapshot =
    options.loadSnapshot ??
    (options.url
      ? async () => {
          const fetchImpl = options.fetchImpl ?? globalThis.fetch;

          if (!fetchImpl) {
            throw new Error('Catalog fetch is unavailable in this browser.');
          }

          const response = await fetchImpl(options.url!);

          if (!response.ok) {
            throw new Error('Catalog snapshot request failed.');
          }

          return (await response.json()) as Extract<
            CatalogInboundEvent,
            { type: 'catalog.snapshot.updated' }
          >;
        }
      : () => Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT));

  return {
    async loadSnapshot() {
      const event = (await rawLoadSnapshot()) as CatalogInboundEvent;

      if (!isSnapshotUpdatedEvent(event)) {
        throw new Error('Catalog snapshot loader returned malformed data.');
      }

      return event;
    },
    subscribe: options.subscribe,
  };
}
