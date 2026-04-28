import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import type { Garment, GarmentCategory } from '@/types/catalog';

const CATEGORY_TOPS: GarmentCategory = {
  id: 'tops',
  label: 'Tops',
  sortOrder: 1,
};

const CATEGORY_OUTERWEAR: GarmentCategory = {
  id: 'outerwear',
  label: 'Outerwear',
  sortOrder: 2,
};

function createGarment(
  id: string,
  name: string,
  categoryId: Garment['categoryId'],
  status: Garment['status'] = 'active',
  overrides: Partial<Garment> = {},
): Garment {
  return {
    id,
    sku: `SKU-${id.toUpperCase()}`,
    name,
    categoryId,
    silhouette: 'upper-body',
    status,
    heroImageUrl: '/garments/shirt_silhouette.svg',
    ...overrides,
    availableSizes: [
      { code: 'S', label: 'Small', availability: 'available' },
      { code: 'M', label: 'Medium', availability: 'available' },
      { code: 'L', label: 'Large', availability: 'available' },
    ],
    availableColors: [
      {
        id: `${id}-navy`,
        label: 'Navy',
        variantId: `${id}-variant-navy`,
        swatchHex: '#20324A',
        availability: 'available',
      },
      {
        id: `${id}-stone`,
        label: 'Stone',
        variantId: `${id}-variant-stone`,
        swatchHex: '#B9B1A4',
        availability: status === 'unavailable' ? 'unavailable' : 'available',
      },
    ],
    defaultVariantId: `${id}-variant-navy`,
  };
}

export const DEMO_CATALOG_CATEGORIES = [CATEGORY_TOPS, CATEGORY_OUTERWEAR];

export const DEMO_CATALOG_GARMENTS: Garment[] = [
  createGarment('original-garment', 'Original Garment', 'tops', 'active', {
    description: 'Your Unity garment baseline. Use Grey for initial alignment and tracking.',
    heroImageUrl: '/garments/original_garment_grey.svg',
    availableColors: [
      {
        id: 'original-garment-grey',
        label: 'Grey (baseline)',
        variantId: 'original-garment-variant-grey',
        swatchHex: '#9CA3AF',
        availability: 'available',
      },
      {
        id: 'original-garment-black',
        label: 'Black',
        variantId: 'original-garment-variant-black',
        swatchHex: '#111827',
        availability: 'available',
      },
      {
        id: 'original-garment-navy',
        label: 'Navy',
        variantId: 'original-garment-variant-navy',
        swatchHex: '#20324A',
        availability: 'available',
      },
    ],
    defaultVariantId: 'original-garment-variant-grey',
  }),
  createGarment('oxford-shirt', 'Oxford Shirt', 'tops'),
  createGarment('linen-shirt', 'Linen Shirt', 'tops'),
  createGarment('silk-blouse', 'Silk Blouse', 'tops'),
  createGarment('cashmere-knit', 'Cashmere Knit', 'tops'),
  createGarment('merino-cardigan', 'Merino Cardigan', 'tops'),
  createGarment('tailored-blazer', 'Tailored Blazer', 'outerwear'),
  createGarment('soft-blazer', 'Soft Blazer', 'outerwear'),
  createGarment('cropped-jacket', 'Cropped Jacket', 'outerwear'),
  createGarment('studio-coat', 'Studio Coat', 'outerwear', 'hidden'),
  createGarment('sample-vest', 'Sample Vest', 'outerwear', 'unavailable'),
];

export const DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT: Extract<
  CatalogInboundEvent,
  { type: 'catalog.snapshot.updated' }
> = {
  type: 'catalog.snapshot.updated',
  source: 'catalog',
  timestamp: '2026-03-24T10:00:00.000Z',
  payload: {
    status: 'ready',
    categories: DEMO_CATALOG_CATEGORIES,
    garments: DEMO_CATALOG_GARMENTS,
  },
};
