import type { InboundEventEnvelope } from '@/adapters/contracts/shared';
import type {
  CatalogLoadStatus,
  Garment,
  GarmentCategory,
} from '@/types/catalog';

export type CatalogInboundEvent =
  | InboundEventEnvelope<
      'catalog.snapshot.updated',
      'catalog',
      {
        status: CatalogLoadStatus;
        categories: GarmentCategory[];
        garments: Garment[];
      }
    >
  | InboundEventEnvelope<
      'catalog.snapshot.unavailable',
      'catalog',
      { status: 'unavailable' }
    >;
