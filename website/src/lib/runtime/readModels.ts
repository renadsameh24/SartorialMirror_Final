import { selectIsCatalogReady } from '@/stores/catalog/selectors';
import { selectDegradedSeverity, selectHasBlockingDegradedIssue, selectPrimaryGuidance, selectShopperVisibleIssues } from '@/stores/degraded/selectors';
import { selectFitStatus } from '@/stores/fit/selectors';
import { selectMeasurementStatus } from '@/stores/measurements/selectors';
import { selectIsDetectionPhase, selectShopperPhase } from '@/stores/session/selectors';
import { selectOperationalStatus } from '@/stores/systemHealth/selectors';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { useFitStore } from '@/stores/fit/fitStore';
import { useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { GuidanceMessage } from '@/types/system';

export type DetectionReadinessReadModel = {
  blocking: boolean;
  primaryGuidance: GuidanceMessage | null;
  readyToAdvance: boolean;
  state: 'inactive' | 'waitingForUser' | 'positioning' | 'readyToAdvance';
};

export type CatalogReadinessReadModel = {
  blocking: boolean;
  state: 'idle' | 'loading' | 'partial' | 'ready' | 'unavailable';
};

export type UnityRenderReadinessReadModel = {
  blocking: boolean;
  state: 'idle' | 'rendering' | 'delayed' | 'ready' | 'unavailable';
  summary: string | null;
};

export type MeasurementReadinessReadModel = {
  blocking: boolean;
  state: 'idle' | 'collecting' | 'partial' | 'ready' | 'unavailable';
};

export type FitReadinessReadModel = {
  blocking: boolean;
  state: 'idle' | 'pending' | 'partial' | 'ready' | 'unavailable';
};

export type DegradedReadModel = {
  blocking: boolean;
  primaryGuidance: GuidanceMessage | null;
  severity: 'clear' | 'attention' | 'degraded';
  visibleIssues: ReturnType<typeof selectShopperVisibleIssues>;
};

function getRuntimeInput() {
  return {
    catalog: useCatalogStore.getState(),
    degraded: useDegradedStore.getState(),
    fit: useFitStore.getState(),
    measurements: useMeasurementsStore.getState(),
    session: useSessionStore.getState(),
    systemHealth: useSystemHealthStore.getState(),
  };
}

export function readDegradedState(): DegradedReadModel {
  const { degraded } = getRuntimeInput();

  return {
    blocking: selectHasBlockingDegradedIssue(degraded),
    primaryGuidance: selectPrimaryGuidance(degraded),
    severity: selectDegradedSeverity(degraded),
    visibleIssues: selectShopperVisibleIssues(degraded),
  };
}

export function readCatalogReadiness(): CatalogReadinessReadModel {
  const { catalog, degraded } = getRuntimeInput();
  const blocking = selectHasBlockingDegradedIssue(degraded) && catalog.status === 'unavailable';

  return {
    blocking,
    state:
      catalog.status === 'loading'
        ? 'loading'
        : catalog.status === 'partial'
          ? 'partial'
          : catalog.status === 'ready'
            ? 'ready'
            : catalog.status === 'unavailable'
              ? 'unavailable'
              : 'idle',
  };
}

export function readDetectionReadiness(): DetectionReadinessReadModel {
  const input = getRuntimeInput();
  const inDetection = selectIsDetectionPhase(input.session);
  const degraded = readDegradedState();
  const cameraStatus = selectOperationalStatus(input.systemHealth, 'camera');
  const runtimeStatus = selectOperationalStatus(input.systemHealth, 'runtime');
  const catalogReady = selectIsCatalogReady(input.catalog);
  const readyToAdvance =
    inDetection &&
    catalogReady &&
    !degraded.blocking &&
    cameraStatus?.detectionState === 'ready' &&
    runtimeStatus?.readiness !== 'unavailable';

  let state: DetectionReadinessReadModel['state'] = 'inactive';

  if (inDetection) {
    if (cameraStatus?.detectionState === 'lost') {
      state = 'waitingForUser';
    } else if (readyToAdvance) {
      state = 'readyToAdvance';
    } else {
      state = 'positioning';
    }
  }

  return {
    blocking: degraded.blocking && inDetection,
    primaryGuidance: degraded.primaryGuidance,
    readyToAdvance,
    state,
  };
}

export function readUnityRenderReadiness(): UnityRenderReadinessReadModel {
  const input = getRuntimeInput();
  const degraded = readDegradedState();
  const unityStatus = selectOperationalStatus(input.systemHealth, 'unity');

  return {
    blocking:
      degraded.blocking &&
      (unityStatus?.renderState === 'unavailable' ||
        unityStatus?.readiness === 'unavailable'),
    state:
      unityStatus?.renderState ??
      (unityStatus?.readiness === 'ready'
        ? 'ready'
        : unityStatus?.readiness === 'partial'
          ? 'delayed'
          : unityStatus?.readiness === 'pending'
            ? 'rendering'
            : unityStatus?.readiness === 'unavailable'
              ? 'unavailable'
              : 'idle'),
    summary: unityStatus?.summary ?? null,
  };
}

export function readMeasurementReadiness(): MeasurementReadinessReadModel {
  const input = getRuntimeInput();
  const degraded = readDegradedState();
  const state = selectMeasurementStatus(input.measurements);

  return {
    blocking: degraded.blocking && state === 'unavailable',
    state,
  };
}

export function readFitReadiness(): FitReadinessReadModel {
  const input = getRuntimeInput();
  const degraded = readDegradedState();
  const state = selectFitStatus(input.fit);

  return {
    blocking: degraded.blocking && state === 'unavailable',
    state,
  };
}

export function readRuntimeReadModels() {
  return {
    catalog: readCatalogReadiness(),
    degraded: readDegradedState(),
    detection: readDetectionReadiness(),
    fit: readFitReadiness(),
    measurements: readMeasurementReadiness(),
    shopperPhase: selectShopperPhase(useSessionStore.getState()),
    unity: readUnityRenderReadiness(),
  };
}

export function selectReadyToAdvance() {
  return readDetectionReadiness().readyToAdvance;
}
