import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';

export type NormalizedCatalogEvent = {
  family: 'catalog';
  sessionScoped: false;
  event: CatalogInboundEvent;
};

export function normalizeCatalogEvent(
  event: CatalogInboundEvent,
): NormalizedCatalogEvent {
  return {
    family: 'catalog',
    sessionScoped: false,
    event,
  };
}
