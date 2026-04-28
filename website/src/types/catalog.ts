import type {
  AvailabilityState,
  CategoryId,
  ColorId,
  GarmentId,
  GarmentVariantId,
  IsoTimestamp,
  SizeCode,
} from '@/types/shared';

export type CatalogLoadStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'partial'
  | 'unavailable';
export type CatalogItemStatus = 'active' | 'hidden' | 'unavailable';
export type GarmentSilhouette = 'upper-body';

export type GarmentCategory = {
  id: CategoryId;
  label: string;
  sortOrder: number;
};

export type GarmentColorOption = {
  id: ColorId;
  label: string;
  swatchHex?: string;
  variantId: GarmentVariantId;
  availability: AvailabilityState;
};

export type GarmentSizeOption = {
  code: SizeCode;
  label: string;
  availability: AvailabilityState;
};

export type Garment = {
  id: GarmentId;
  sku: string;
  name: string;
  categoryId: CategoryId;
  silhouette: GarmentSilhouette;
  status: CatalogItemStatus;
  description?: string;
  heroImageUrl?: string;
  availableSizes: GarmentSizeOption[];
  availableColors: GarmentColorOption[];
  defaultVariantId?: GarmentVariantId;
};

export type GarmentSelection = {
  garmentId: GarmentId;
  variantId?: GarmentVariantId;
  sizeCode?: SizeCode;
  colorId?: ColorId;
  selectedAt: IsoTimestamp;
};

export type CatalogFocus = {
  categoryId?: CategoryId;
  highlightedGarmentId?: GarmentId;
};
