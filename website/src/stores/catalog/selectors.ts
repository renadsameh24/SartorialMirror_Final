import type { CatalogStore } from '@/stores/catalog/catalogStore';

export function selectCatalogStatus(state: CatalogStore) {
  return state.status;
}

export function selectVisibleCategories(state: CatalogStore) {
  return [...state.categories].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function selectVisibleGarments(state: CatalogStore) {
  return state.garments.filter(
    (garment) =>
      garment.status !== 'hidden' &&
      (!state.focus.categoryId || garment.categoryId === state.focus.categoryId),
  );
}

export function selectActiveSelection(state: CatalogStore) {
  return state.selection;
}

export function selectActiveCategoryId(state: CatalogStore) {
  return state.focus.categoryId ?? null;
}

export function selectSelectedGarment(state: CatalogStore) {
  if (!state.selection?.garmentId) {
    return null;
  }

  return state.garments.find((garment) => garment.id === state.selection?.garmentId) ?? null;
}

export function selectGarmentById(state: CatalogStore, garmentId?: string | null) {
  if (!garmentId) {
    return null;
  }

  return state.garments.find((garment) => garment.id === garmentId) ?? null;
}

export function selectSelectionReadyForTryOn(state: CatalogStore) {
  return Boolean(state.selection?.garmentId);
}

export function selectIsCatalogReady(state: CatalogStore) {
  return state.status === 'ready' || state.status === 'partial';
}
