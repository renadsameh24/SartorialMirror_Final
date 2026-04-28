import { beforeEach, describe, expect, it } from 'vitest';

import {
  createInitialCatalogState,
  useCatalogStore,
} from '@/stores/catalog/catalogStore';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';

describe('catalogStore', () => {
  beforeEach(() => {
    useCatalogStore.setState(createInitialCatalogState());
  });

  it('preserves selection when a refreshed snapshot still contains the selected garment', () => {
    useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
    useCatalogStore
      .getState()
      .selectGarment('tailored-blazer', '2026-03-24T10:00:00.000Z');
    useCatalogStore.getState().selectSize('M');
    useCatalogStore
      .getState()
      .selectColor('tailored-blazer-navy', 'tailored-blazer-variant-navy');

    useCatalogStore.getState().setSnapshot({
      ...DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload,
      garments: DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload.garments.map((garment) =>
        garment.id === 'tailored-blazer'
          ? { ...garment, description: 'Updated copy.' }
          : garment,
      ),
    });

    expect(useCatalogStore.getState().selection).toEqual(
      expect.objectContaining({
        garmentId: 'tailored-blazer',
        sizeCode: 'M',
        colorId: 'tailored-blazer-navy',
        variantId: 'tailored-blazer-variant-navy',
      }),
    );
    expect(
      useCatalogStore.getState().garments.find((garment) => garment.id === 'tailored-blazer'),
    ).toEqual(expect.objectContaining({ description: 'Updated copy.' }));
  });

  it('keeps the last good catalog entities when an unavailable snapshot arrives', () => {
    useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
    useCatalogStore.getState().highlightGarment('tailored-blazer');

    useCatalogStore.getState().setSnapshot({
      categories: [],
      garments: [],
      status: 'unavailable',
    });

    expect(useCatalogStore.getState().status).toBe('unavailable');
    expect(useCatalogStore.getState().garments).toHaveLength(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload.garments.length,
    );
    expect(useCatalogStore.getState().categories).toEqual(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload.categories,
    );
    expect(useCatalogStore.getState().focus.highlightedGarmentId).toBe('tailored-blazer');
  });

  it('resetSessionState clears shopper selection and focus only', () => {
    useCatalogStore.getState().setSnapshot(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload);
    useCatalogStore.getState().selectCategory('outerwear');
    useCatalogStore.getState().highlightGarment('tailored-blazer');
    useCatalogStore
      .getState()
      .selectGarment('tailored-blazer', '2026-03-24T10:00:00.000Z');

    useCatalogStore.getState().resetSessionState();

    expect(useCatalogStore.getState().selection).toBeNull();
    expect(useCatalogStore.getState().focus).toEqual({});
    expect(useCatalogStore.getState().garments).toHaveLength(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT.payload.garments.length,
    );
    expect(useCatalogStore.getState().status).toBe('ready');
  });
});
