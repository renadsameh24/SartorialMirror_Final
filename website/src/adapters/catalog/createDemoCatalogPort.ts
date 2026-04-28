import type { CatalogPort } from '@/adapters/contracts/ports';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';

export function createDemoCatalogPort(): CatalogPort {
  return {
    loadSnapshot() {
      return Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT);
    },
  };
}
