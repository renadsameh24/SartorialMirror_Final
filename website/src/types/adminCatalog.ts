import type {
  CategoryId,
  ColorId,
  GarmentId,
  GarmentVariantId,
  SizeCode,
} from '@/types/shared';

export type AdminCatalogCuration = {
  categoryId: CategoryId;
  defaultColorId?: ColorId;
  defaultSizeCode?: SizeCode;
  defaultVariantId?: GarmentVariantId;
  enabled: boolean;
  garmentId: GarmentId;
  sortOrder: number;
};

export type AdminCatalogCurationMap = Partial<Record<GarmentId, AdminCatalogCuration>>;
