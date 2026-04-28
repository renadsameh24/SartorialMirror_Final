import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Button, Panel } from '@/components/primitives';
import { MeasurementPanel } from '@/features/shopper/fit/MeasurementPanel';
import { FitSummaryCard } from '@/features/shopper/fit/FitSummaryCard';
import { VariantSelector } from '@/features/shopper/common/VariantSelector';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import { TryOnActionGroup } from '@/features/shopper/tryOn/TryOnActionGroup';
import { createTryOnStageOverlays } from '@/features/shopper/tryOn/TryOnStageOverlays';
import { UnityTryOnStageWithCameraGuides } from '@/features/shopper/tryOn/UnityTryOnStageWithCameraGuides';
import {
  readDegradedState,
  readFitReadiness,
  readMeasurementReadiness,
  readUnityRenderReadiness,
} from '@/lib/runtime/readModels';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import {
  selectActiveSelection,
  selectSelectedGarment,
} from '@/stores/catalog/selectors';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { useFitStore } from '@/stores/fit/fitStore';
import {
  selectAlternativeSize,
  selectCurrentRecommendation,
  selectFitSummary,
} from '@/stores/fit/selectors';
import { useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import {
  selectDisplayMeasurements,
} from '@/stores/measurements/selectors';
import { selectCanEndSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

type TryOnScreenModel = {
  alternativeSize: string | null;
  canEndSession: boolean;
  degraded: ReturnType<typeof readDegradedState>;
  endSession: () => void;
  fitReadiness: ReturnType<typeof readFitReadiness>;
  fitSummary: string | null;
  measurements: ReturnType<typeof selectDisplayMeasurements>;
  measurementReadiness: ReturnType<typeof readMeasurementReadiness>;
  onBackToCatalog: () => void;
  onColorChange: (value: string) => void;
  onEndSession: () => void;
  onFitDetails: () => void;
  onSizeChange: (value: string) => void;
  recommendation: ReturnType<typeof selectCurrentRecommendation>;
  selectedGarment: ReturnType<typeof selectSelectedGarment>;
  selection: ReturnType<typeof selectActiveSelection>;
  unityReadiness: ReturnType<typeof readUnityRenderReadiness>;
};

function ensureTryOnDefaults(
  selectedGarment: TryOnScreenModel['selectedGarment'],
  selection: TryOnScreenModel['selection'],
  onColorChange: (value: string) => void,
  onSizeChange: (value: string) => void,
) {
  if (!selectedGarment || !selection) {
    return;
  }

  if (!selection.colorId) {
    const defaultColor =
      selectedGarment.availableColors.find(
        (color) => color.variantId === selectedGarment.defaultVariantId,
      ) ?? selectedGarment.availableColors[0];

    if (defaultColor) {
      onColorChange(defaultColor.id);
    }
  }

  if (!selection.sizeCode && selectedGarment.availableSizes.length === 1) {
    const [onlySize] = selectedGarment.availableSizes;

    if (onlySize) {
      onSizeChange(onlySize.code);
    }
  }
}

function liveViewCopy(unityReadiness: ReturnType<typeof readUnityRenderReadiness>) {
  switch (unityReadiness.state) {
    case 'unavailable':
      return 'The mirror view is temporarily reduced while the kiosk reconnects.';
    case 'delayed':
      return unityReadiness.summary ?? 'Hold position while the mirror refreshes.';
    case 'rendering':
      return 'The mirror view is updating around the current garment selection.';
    default:
      return 'The mirror stays centered here while measurements and fit guidance update alongside it.';
  }
}

export function createTryOnStagePresentation({
  fitReadiness,
  fitSummary,
  garmentName,
  sizeCode,
  unityReadiness,
}: {
  fitReadiness: ReturnType<typeof readFitReadiness>;
  fitSummary: string | null;
  garmentName: string;
  sizeCode?: string;
  unityReadiness: ReturnType<typeof readUnityRenderReadiness>;
}) {
  const overlays = createTryOnStageOverlays({
    fitReadiness,
    fitSummary,
    garmentName,
    sizeCode,
    unityReadiness,
  });

  return {
    overlayBottom: overlays.bottom,
    overlayTop: overlays.top,
    stage: (
      <div className="flex h-full flex-col justify-end">
        <UnityTryOnStageWithCameraGuides
          body={liveViewCopy(unityReadiness)}
          garmentName={garmentName}
          unityReadiness={unityReadiness}
        />
      </div>
    ),
  };
}

export function useTryOnScreenModel(active: boolean): TryOnScreenModel {
  const canEndSession = useSessionStore(selectCanEndSession);
  const onBackToCatalog = useSessionStore((state) => state.returnToCatalog);
  const onFitDetails = useSessionStore((state) => state.openFitDetails);
  const onEndSession = useSessionStore((state) => state.endSession);
  const selection = useCatalogStore(selectActiveSelection);
  const selectedGarment = useCatalogStore(selectSelectedGarment);
  const selectSize = useCatalogStore((state) => state.selectSize);
  const selectColor = useCatalogStore((state) => state.selectColor);
  const measurements = useMeasurementsStore(useShallow(selectDisplayMeasurements));
  useFitStore((state) => state.recommendation);
  const recommendation = selectCurrentRecommendation(useFitStore.getState());
  const fitSummary = useFitStore(selectFitSummary);
  const alternativeSize = useFitStore(selectAlternativeSize);

  useDegradedStore((state) => state.guidance);
  useDegradedStore((state) => state.issues);
  useSystemHealthStore((state) => state.operationalStatuses);

  const degraded = readDegradedState();
  const unityReadiness = readUnityRenderReadiness();
  const measurementReadiness = readMeasurementReadiness();
  const fitReadiness = readFitReadiness();

  const onSizeChange = (value: string) => {
    selectSize(value);
  };

  const onColorChange = (value: string) => {
    const color = selectedGarment?.availableColors.find((option) => option.id === value);

    if (color) {
      selectColor(color.id, color.variantId);
    }
  };

  useEffect(() => {
    if (active) {
      ensureTryOnDefaults(selectedGarment, selection, onColorChange, onSizeChange);
    }
  }, [active, onColorChange, selectedGarment, selection]);

  return {
    alternativeSize,
    canEndSession,
    degraded,
    endSession: onEndSession,
    fitReadiness,
    fitSummary,
    measurements,
    measurementReadiness,
    onBackToCatalog,
    onColorChange,
    onEndSession,
    onFitDetails,
    onSizeChange,
    recommendation,
    selectedGarment,
    selection,
    unityReadiness,
  };
}

export function createTryOnScreenLayout({
  alternativeSize,
  canEndSession,
  degraded,
  fitReadiness,
  fitSummary,
  measurements,
  measurementReadiness,
  onBackToCatalog,
  onColorChange,
  onEndSession,
  onFitDetails,
  onSizeChange,
  recommendation,
  selectedGarment,
  selection,
  unityReadiness,
}: TryOnScreenModel): ShopperPhaseLayout {
  const garmentName = selectedGarment?.name ?? 'Live Try-On';
  const stagePresentation = createTryOnStagePresentation({
    fitReadiness,
    fitSummary,
    garmentName,
    sizeCode: selection?.sizeCode,
    unityReadiness,
  });
  const sizeOptions =
    selectedGarment?.availableSizes.map((size) => ({
      disabled: size.availability !== 'available',
      value: size.code,
      label: size.label,
    })) ?? [];
  const colorOptions =
    selectedGarment?.availableColors.map((color) => ({
      disabled: color.availability !== 'available',
      swatchHex: color.swatchHex,
      value: color.id,
      label: color.label,
    })) ?? [];

  return {
    band: (
      <ShopperBandHeader
        action={
          <Button disabled={!canEndSession} onClick={onEndSession} variant="quiet">
            End Session
          </Button>
        }
        phaseLabel="Mirror View"
        support="Your selected garment stays dominant on stage while size, finish, measurements, and fit confidence remain close at hand."
        title={garmentName}
      />
    ),
    stage: stagePresentation.stage,
    rail: (
      <div className="space-y-lg">
        <Panel className="shopper-rail-card" tone="default">
          <div className="space-y-lg">
            <div className="space-y-sm">
              <p className="shopper-kicker text-accent">Current look</p>
              <h2 className="type-display font-display text-[clamp(2.1rem,2.6vw,3rem)]">
                {garmentName}
              </h2>
              <p className="type-body text-text-secondary">
                Refine finish and size without leaving the mirror.
              </p>
            </div>
            <VariantSelector
              label="Size"
              onChange={onSizeChange}
              options={sizeOptions}
              value={selection?.sizeCode}
            />
            <VariantSelector
              label="Color"
              onChange={onColorChange}
              options={colorOptions}
              value={selection?.colorId}
            />
          </div>
        </Panel>

        <MeasurementPanel
          measurements={measurements}
          readiness={measurementReadiness}
        />
        <FitSummaryCard
          alternativeSize={alternativeSize}
          fitSummary={fitSummary}
          readiness={fitReadiness}
          recommendation={recommendation}
        />
        {degraded.primaryGuidance ? (
          <Panel className="shopper-rail-card" tone="subtle">
            <p className="type-body text-text-secondary">
              {degraded.primaryGuidance.body}
            </p>
          </Panel>
        ) : null}
        <TryOnActionGroup
          onBackToCatalog={onBackToCatalog}
          onEndSession={onEndSession}
          onFitDetails={onFitDetails}
        />
      </div>
    ),
    overlayTop: stagePresentation.overlayTop,
    overlayBottom: stagePresentation.overlayBottom,
  };
}
