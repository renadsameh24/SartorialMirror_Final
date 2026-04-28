import { create } from 'zustand';

import type {
  CatalogFocus,
  CatalogLoadStatus,
  Garment,
  GarmentCategory,
  GarmentSelection,
} from '@/types/catalog';
import type {
  CategoryId,
  ColorId,
  GarmentId,
  GarmentVariantId,
  IsoTimestamp,
  SizeCode,
} from '@/types/shared';

export type CatalogStoreState = {
  focus: CatalogFocus;
  garments: Garment[];
  categories: GarmentCategory[];
  selection: GarmentSelection | null;
  status: CatalogLoadStatus;
};

export type CatalogStoreActions = {
  clearFocus: () => void;
  highlightGarment: (garmentId?: GarmentId) => void;
  resetSessionState: () => void;
  selectCategory: (categoryId?: CategoryId) => void;
  selectColor: (colorId: ColorId, variantId?: GarmentVariantId) => void;
  selectGarment: (garmentId: GarmentId, selectedAt?: IsoTimestamp) => void;
  selectSize: (sizeCode: SizeCode) => void;
  setSnapshot: (input: {
    categories: GarmentCategory[];
    garments: Garment[];
    status: CatalogLoadStatus;
  }) => void;
};

export type CatalogStore = CatalogStoreState & CatalogStoreActions;

export function createInitialCatalogState(): CatalogStoreState {
  return {
    focus: {},
    garments: [],
    categories: [],
    selection: null,
    status: 'idle',
  };
}

function timestampOrNow(value?: IsoTimestamp) {
  return value ?? new Date().toISOString();
}

function hasGarment(
  garments: Garment[],
  garmentId?: GarmentId,
): garmentId is GarmentId {
  if (!garmentId) {
    return false;
  }

  return garments.some((garment) => garment.id === garmentId);
}

function hasCategory(
  categories: GarmentCategory[],
  categoryId?: CategoryId,
): categoryId is CategoryId {
  if (!categoryId) {
    return false;
  }

  return categories.some((category) => category.id === categoryId);
}

export const useCatalogStore = create<CatalogStore>()((set) => ({
  ...createInitialCatalogState(),
  clearFocus: () => set({ focus: {} }),
  highlightGarment: (garmentId) =>
    set((state) => ({
      focus: {
        ...state.focus,
        highlightedGarmentId: garmentId,
      },
    })),
  resetSessionState: () =>
    set({
      focus: {},
      selection: null,
    }),
  selectCategory: (categoryId) =>
    set((state) => ({
      focus: {
        ...state.focus,
        categoryId,
      },
    })),
  selectColor: (colorId, variantId) =>
    set((state) => ({
      selection: state.selection
        ? {
            ...state.selection,
            colorId,
            variantId: variantId ?? state.selection.variantId,
          }
        : null,
    })),
  selectGarment: (garmentId, selectedAt) =>
    set((state) => ({
      focus: {
        ...state.focus,
        highlightedGarmentId: garmentId,
      },
      selection: {
        garmentId,
        selectedAt: timestampOrNow(selectedAt),
      },
    })),
  selectSize: (sizeCode) =>
    set((state) => ({
      selection: state.selection ? { ...state.selection, sizeCode } : null,
    })),
  setSnapshot: ({ categories, garments, status }) =>
    set((state) => {
      const nextCategories = status === 'unavailable' ? state.categories : categories;
      const nextGarments = status === 'unavailable' ? state.garments : garments;

      return {
        categories: nextCategories,
        garments: nextGarments,
        focus: {
          categoryId: hasCategory(nextCategories, state.focus.categoryId)
            ? state.focus.categoryId
            : undefined,
          highlightedGarmentId: hasGarment(
            nextGarments,
            state.focus.highlightedGarmentId,
          )
            ? state.focus.highlightedGarmentId
            : undefined,
        },
        selection: state.selection,
        status,
      };
    }),
}));
