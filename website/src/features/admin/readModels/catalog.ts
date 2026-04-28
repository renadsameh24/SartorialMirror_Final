import { selectCatalogCurationByGarmentId, selectCatalogCurationEntry } from '@/stores/admin/selectors';
import {
  selectCatalogStatus,
  selectGarmentById,
  selectVisibleCategories,
} from '@/stores/catalog/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import type { AdminCatalogCuration } from '@/types/adminCatalog';
import type { Garment } from '@/types/catalog';

type CatalogRow = {
  categoryId: string;
  categoryLabel: string;
  defaultSizeColorSummary: string;
  defaultVariantSummary: string;
  enabled: boolean;
  garmentId: string;
  name: string;
  sortOrder: number;
  statusLabel: string;
};

export type CatalogCurationSummaryReadModel = {
  actionLabel: string;
  facts: string[];
  id: 'catalog';
  section: 'catalog';
  status: string;
  support: string;
  title: string;
};

export type AdminCatalogWorkspaceReadModel = {
  categories: ReturnType<typeof selectVisibleCategories>;
  rows: CatalogRow[];
  status: ReturnType<typeof selectCatalogStatus>;
  summary: CatalogCurationSummaryReadModel;
};

export type AdminCatalogInspectorReadModel = {
  availableColors: Garment['availableColors'];
  availableSizes: Garment['availableSizes'];
  categoryOptions: ReturnType<typeof selectVisibleCategories>;
  committed: AdminCatalogCuration | null;
  garment: Garment;
  validationIssues: string[];
  variantOptions: Array<{ label: string; value: string }>;
};

function deriveBaseCuration(garment: Garment, index: number): AdminCatalogCuration {
  const defaultColor =
    garment.availableColors.find(
      (color) => color.variantId === garment.defaultVariantId,
    ) ?? garment.availableColors[0];
  const defaultSize = garment.availableSizes[0];

  return {
    categoryId: garment.categoryId,
    defaultColorId: defaultColor?.id,
    defaultSizeCode: defaultSize?.code,
    defaultVariantId: garment.defaultVariantId ?? defaultColor?.variantId,
    enabled: garment.status === 'active',
    garmentId: garment.id,
    sortOrder: index + 1,
  };
}

function resolveCommittedCuration(garment: Garment, index: number): AdminCatalogCuration {
  return (
    selectCatalogCurationEntry(useAdminStore.getState(), garment.id) ??
    deriveBaseCuration(garment, index)
  );
}

export function readCatalogCurationSummary(): CatalogCurationSummaryReadModel {
  const catalog = useCatalogStore.getState();
  const garments = catalog.garments.filter((garment) => garment.status !== 'unavailable');
  const categories = selectVisibleCategories(catalog);
  const curationMap = selectCatalogCurationByGarmentId(useAdminStore.getState());
  const enabledCount = garments.filter((garment, index) =>
    (curationMap[garment.id] ?? deriveBaseCuration(garment, index)).enabled,
  ).length;
  const disabledCount = garments.length - enabledCount;

  return {
    actionLabel: 'Open Catalog',
    facts: [
      `${garments.length} garments`,
      `${enabledCount} enabled / ${disabledCount} disabled`,
      `${categories.length} categories`,
    ],
    id: 'catalog',
    section: 'catalog',
    status: `Snapshot status: ${selectCatalogStatus(catalog)}`,
    support: 'Local operational curation only.',
    title: 'Catalog Summary',
  };
}

export function readAdminCatalogWorkspace(): AdminCatalogWorkspaceReadModel {
  const catalog = useCatalogStore.getState();
  const categories = selectVisibleCategories(catalog);
  const rows = catalog.garments
    .filter((garment) => garment.status !== 'unavailable')
    .map((garment, index) => {
      const committed = resolveCommittedCuration(garment, index);
      const categoryLabel =
        categories.find((category) => category.id === committed.categoryId)?.label ??
        garment.categoryId;
      const defaultColorLabel =
        garment.availableColors.find((color) => color.id === committed.defaultColorId)?.label ??
        'Not set';

      return {
        categoryId: committed.categoryId,
        categoryLabel,
        defaultSizeColorSummary: `${committed.defaultSizeCode ?? 'Not set'} / ${defaultColorLabel}`,
        defaultVariantSummary: committed.defaultVariantId ?? 'Not set',
        enabled: committed.enabled,
        garmentId: garment.id,
        name: garment.name,
        sortOrder: committed.sortOrder,
        statusLabel: committed.enabled ? 'Enabled' : 'Disabled',
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    categories,
    rows,
    status: selectCatalogStatus(catalog),
    summary: readCatalogCurationSummary(),
  };
}

export function readAdminCatalogInspector(
  garmentId?: string | null,
): AdminCatalogInspectorReadModel | null {
  const catalog = useCatalogStore.getState();
  const garment = selectGarmentById(catalog, garmentId);

  if (!garment) {
    return null;
  }

  const garmentIndex = catalog.garments.findIndex((item) => item.id === garment.id);
  const committed = resolveCommittedCuration(garment, garmentIndex);
  const validationIssues: string[] = [];

  if (
    committed.defaultColorId &&
    !garment.availableColors.some((color) => color.id === committed.defaultColorId)
  ) {
    validationIssues.push('Selected default color is no longer available.');
  }

  if (
    committed.defaultSizeCode &&
    !garment.availableSizes.some((size) => size.code === committed.defaultSizeCode)
  ) {
    validationIssues.push('Selected default size is no longer available.');
  }

  if (
    committed.defaultVariantId &&
    !garment.availableColors.some((color) => color.variantId === committed.defaultVariantId)
  ) {
    validationIssues.push('Selected default variant is no longer available.');
  }

  return {
    availableColors: garment.availableColors,
    availableSizes: garment.availableSizes,
    categoryOptions: selectVisibleCategories(catalog),
    committed,
    garment,
    validationIssues,
    variantOptions: garment.availableColors.map((color) => ({
      label: `${color.label} (${color.variantId})`,
      value: color.variantId,
    })),
  };
}
