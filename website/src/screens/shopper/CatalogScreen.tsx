import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Button, Panel, PanelHeader } from '@/components/primitives';
import { CatalogCategoryTabs } from '@/features/shopper/catalog/CatalogCategoryTabs';
import { CatalogSelectionRail } from '@/features/shopper/catalog/CatalogSelectionRail';
import { GarmentGrid } from '@/features/shopper/catalog/GarmentGrid';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import { readCatalogReadiness, readDegradedState } from '@/lib/runtime/readModels';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import {
  selectActiveCategoryId,
  selectActiveSelection,
  selectSelectedGarment,
  selectSelectionReadyForTryOn,
  selectVisibleCategories,
  selectVisibleGarments,
} from '@/stores/catalog/selectors';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { selectCanEndSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';

type CatalogScreenModel = {
  activeCategoryId: string | null;
  canEndSession: boolean;
  catalogReadiness: ReturnType<typeof readCatalogReadiness>;
  categories: ReturnType<typeof selectVisibleCategories>;
  currentGarment: ReturnType<typeof selectSelectedGarment>;
  degraded: ReturnType<typeof readDegradedState>;
  endSession: () => void;
  garments: ReturnType<typeof selectVisibleGarments>;
  onColorChange: (value: string) => void;
  onSelectCategory: (categoryId?: string) => void;
  onSelectGarment: (garmentId: string) => void;
  onSizeChange: (value: string) => void;
  onTryOn: () => void;
  selection: ReturnType<typeof selectActiveSelection>;
  selectionReady: boolean;
};

function ensureVariantDefaults(
  currentGarment: CatalogScreenModel['currentGarment'],
  selection: CatalogScreenModel['selection'],
  onColorChange: (value: string) => void,
  onSizeChange: (value: string) => void,
) {
  if (!currentGarment || !selection) {
    return;
  }

  if (!selection.colorId) {
    const defaultColor =
      currentGarment.availableColors.find(
        (color) => color.variantId === currentGarment.defaultVariantId,
      ) ?? currentGarment.availableColors[0];

    if (defaultColor) {
      onColorChange(defaultColor.id);
    }
  }

  if (!selection.sizeCode && currentGarment.availableSizes.length === 1) {
    const [onlySize] = currentGarment.availableSizes;

    if (onlySize) {
      onSizeChange(onlySize.code);
    }
  }
}

export function useCatalogScreenModel(active: boolean): CatalogScreenModel {
  const canEndSession = useSessionStore(selectCanEndSession);
  const endSession = useSessionStore((state) => state.endSession);
  const onTryOn = useSessionStore((state) => state.confirmSelection);
  const categories = useCatalogStore(useShallow(selectVisibleCategories));
  const garments = useCatalogStore(useShallow(selectVisibleGarments));
  const selection = useCatalogStore(selectActiveSelection);
  const currentGarment = useCatalogStore(selectSelectedGarment);
  const selectionReady = useCatalogStore(selectSelectionReadyForTryOn);
  const activeCategoryId = useCatalogStore(selectActiveCategoryId);
  const onSelectCategory = useCatalogStore((state) => state.selectCategory);
  const onSelectGarment = useCatalogStore((state) => state.selectGarment);
  const selectSize = useCatalogStore((state) => state.selectSize);
  const selectColor = useCatalogStore((state) => state.selectColor);

  useDegradedStore((state) => state.guidance);
  useDegradedStore((state) => state.issues);

  const catalogReadiness = readCatalogReadiness();
  const degraded = readDegradedState();

  const onSizeChange = (value: string) => {
    selectSize(value);
  };

  const onColorChange = (value: string) => {
    const color = currentGarment?.availableColors.find((option) => option.id === value);

    if (color) {
      selectColor(color.id, color.variantId);
    }
  };

  useEffect(() => {
    if (active) {
      ensureVariantDefaults(currentGarment, selection, onColorChange, onSizeChange);
    }
  }, [active, currentGarment, selection, onColorChange]);

  return {
    activeCategoryId,
    canEndSession,
    catalogReadiness,
    categories,
    currentGarment,
    degraded,
    endSession,
    garments,
    onColorChange,
    onSelectCategory,
    onSelectGarment,
    onSizeChange,
    onTryOn,
    selection,
    selectionReady,
  };
}

export function createCatalogScreenLayout({
  activeCategoryId,
  canEndSession,
  catalogReadiness,
  categories,
  currentGarment,
  degraded,
  endSession,
  garments,
  onColorChange,
  onSelectCategory,
  onSelectGarment,
  onSizeChange,
  onTryOn,
  selection,
  selectionReady,
}: CatalogScreenModel): ShopperPhaseLayout {
  const categoryLabel =
    categories.find((category) => category.id === activeCategoryId)?.label ?? 'All garments';

  return {
    band: (
      <ShopperBandHeader
        action={
          <Button disabled={!canEndSession} onClick={endSession} variant="quiet">
            End Session
          </Button>
        }
        phaseLabel="Collection"
        support="A concise local edit, prepared for live fitting. Choose a garment now and refine size or finish before entering the mirror."
        title="Choose the look you want to see in motion."
      />
    ),
    stage: (
      <div className="w-full space-y-xl">
        <div className="space-y-lg">
          <div className="flex flex-col gap-lg xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-sm">
              <p className="shopper-kicker text-accent">Edited collection</p>
              <h2 className="type-display font-display max-w-4xl text-[clamp(2.8rem,4vw,4.8rem)]">
                Curated for immediate mirror styling.
              </h2>
              <p className="type-body max-w-3xl text-text-secondary">
                Select from a compact rail of upper-body silhouettes designed for quick comparison, not endless browsing.
              </p>
            </div>
            <Badge variant="muted">{categoryLabel}</Badge>
          </div>

          <CatalogCategoryTabs
            activeCategoryId={activeCategoryId}
            categories={categories}
            onChange={onSelectCategory}
          />
        </div>
        {catalogReadiness.state === 'unavailable' ? (
          <Panel className="shopper-hero-card" tone="strong">
            <div className="space-y-md">
              <PanelHeader
                action={<Badge variant="muted">Unavailable</Badge>}
                support="Available looks return here as soon as the local catalog snapshot recovers."
                title="The collection is briefly unavailable."
              />
            </div>
          </Panel>
        ) : (
          <GarmentGrid
            categories={categories}
            garments={garments}
            onSelect={onSelectGarment}
            selectedGarmentId={selection?.garmentId}
          />
        )}
      </div>
    ),
    rail: (
      <CatalogSelectionRail
        catalogReadiness={catalogReadiness}
        degraded={degraded}
        garment={currentGarment}
        onColorChange={onColorChange}
        onSizeChange={onSizeChange}
        onTryOn={onTryOn}
        selection={selection}
        selectionReady={selectionReady}
      />
    ),
    overlayTop: <Badge variant="muted">{categoryLabel}</Badge>,
    overlayBottom: (
      <Badge variant="muted">
        {degraded.primaryGuidance?.body ?? 'Move through categories, garments, then finish and size controls.'}
      </Badge>
    ),
  };
}
