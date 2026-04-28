import type { CatalogPort } from '@/adapters/contracts/ports';
import {
  createCatalogSnapshotLoader,
  type CatalogSnapshotLoader,
} from '@/adapters/catalog/catalogSnapshotLoader';

type CreateIntegrationCatalogPortOptions = {
  loader?: CatalogSnapshotLoader;
  snapshotUrl?: string;
};

export function createIntegrationCatalogPort(
  options: CreateIntegrationCatalogPortOptions = {},
): CatalogPort {
  const loader =
    options.loader ?? createCatalogSnapshotLoader({ url: options.snapshotUrl });

  return {
    async loadSnapshot() {
      return loader.loadSnapshot();
    },
    subscribe: loader.subscribe,
  };
}
