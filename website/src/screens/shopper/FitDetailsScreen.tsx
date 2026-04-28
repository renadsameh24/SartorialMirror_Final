import { useShallow } from 'zustand/react/shallow';

import { Badge, Button } from '@/components/primitives';
import { FitDetailsRail } from '@/features/shopper/fit/FitDetailsRail';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import {
  readDegradedState,
  readFitReadiness,
  readMeasurementReadiness,
  readUnityRenderReadiness,
} from '@/lib/runtime/readModels';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import {
  selectActiveSelection,
  selectGarmentById,
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
import { selectDisplayMeasurements } from '@/stores/measurements/selectors';
import { selectCanEndSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import { createTryOnStagePresentation } from '@/screens/shopper/TryOnScreen';

type FitDetailsScreenModel = {
  alternativeGarment: ReturnType<typeof selectSelectedGarment>;
  alternativeSize: string | null;
  canEndSession: boolean;
  degraded: ReturnType<typeof readDegradedState>;
  fitReadiness: ReturnType<typeof readFitReadiness>;
  fitSummary: string | null;
  measurements: ReturnType<typeof selectDisplayMeasurements>;
  measurementReadiness: ReturnType<typeof readMeasurementReadiness>;
  onApplyRecommendedSize: () => void;
  onBackToTryOn: () => void;
  onEndSession: () => void;
  recommendation: ReturnType<typeof selectCurrentRecommendation>;
  selectedGarment: ReturnType<typeof selectSelectedGarment>;
  selection: ReturnType<typeof selectActiveSelection>;
  unityReadiness: ReturnType<typeof readUnityRenderReadiness>;
};

export function useFitDetailsScreenModel(): FitDetailsScreenModel {
  const canEndSession = useSessionStore(selectCanEndSession);
  const onBackToTryOn = useSessionStore((state) => state.returnToTryOn);
  const onEndSession = useSessionStore((state) => state.endSession);
  const selectSize = useCatalogStore((state) => state.selectSize);
  const selection = useCatalogStore(selectActiveSelection);
  const selectedGarment = useCatalogStore(selectSelectedGarment);
  useFitStore((state) => state.recommendation);
  const recommendation = selectCurrentRecommendation(useFitStore.getState());
  const fitSummary = useFitStore(selectFitSummary);
  const alternativeSize = useFitStore(selectAlternativeSize);
  const alternativeGarment = useCatalogStore((state) =>
    selectGarmentById(state, recommendation?.alternativeGarmentId),
  );
  const measurements = useMeasurementsStore(useShallow(selectDisplayMeasurements));

  useDegradedStore((state) => state.guidance);
  useDegradedStore((state) => state.issues);
  useSystemHealthStore((state) => state.operationalStatuses);

  const degraded = readDegradedState();
  const measurementReadiness = readMeasurementReadiness();
  const fitReadiness = readFitReadiness();
  const unityReadiness = readUnityRenderReadiness();

  return {
    alternativeGarment,
    alternativeSize,
    canEndSession,
    degraded,
    fitReadiness,
    fitSummary,
    measurements,
    measurementReadiness,
    onApplyRecommendedSize: () => {
      if (alternativeSize) {
        selectSize(alternativeSize);
      }
    },
    onBackToTryOn,
    onEndSession,
    recommendation,
    selectedGarment,
    selection,
    unityReadiness,
  };
}

export function createFitDetailsScreenLayout({
  alternativeGarment,
  alternativeSize,
  canEndSession,
  degraded,
  fitReadiness,
  fitSummary,
  measurements,
  measurementReadiness,
  onApplyRecommendedSize,
  onBackToTryOn,
  onEndSession,
  recommendation,
  selectedGarment,
  selection,
  unityReadiness,
}: FitDetailsScreenModel): ShopperPhaseLayout {
  const garmentName = selectedGarment?.name ?? 'Fit Details';
  const stagePresentation = createTryOnStagePresentation({
    fitReadiness,
    fitSummary,
    garmentName,
    sizeCode: selection?.sizeCode,
    unityReadiness,
  });

  return {
    band: (
      <ShopperBandHeader
        action={
          <>
            <Button onClick={onBackToTryOn} variant="secondary">
              Back to Try-On
            </Button>
            <Button disabled={!canEndSession} onClick={onEndSession} variant="quiet">
              End Session
            </Button>
          </>
        }
        phaseLabel="Fit Details"
        support="Review the current size with plain-language guidance while keeping the mirror view available behind it."
        title={`${garmentName} fit guidance`}
      />
    ),
    stage: stagePresentation.stage,
    rail: (
      <FitDetailsRail
        alternativeGarment={alternativeGarment}
        alternativeSize={alternativeSize}
        degraded={degraded}
        fitReadiness={fitReadiness}
        fitSummary={fitSummary}
        measurements={measurements}
        measurementReadiness={measurementReadiness}
        onApplyRecommendedSize={onApplyRecommendedSize}
        onBackToTryOn={onBackToTryOn}
        recommendation={recommendation}
        selection={selection}
      />
    ),
    overlayTop: stagePresentation.overlayTop,
    overlayBottom: <Badge variant="muted">{fitSummary ?? 'Detailed fit guidance is open.'}</Badge>,
  };
}
