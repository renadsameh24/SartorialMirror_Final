import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import { useFitStore } from '@/stores/fit/fitStore';
import { useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { GuidanceMessage, HealthSignal, OperationalStatus } from '@/types/system';
import type { NormalizedCatalogEvent } from '@/lib/runtime/normalizeCatalogEvent';
import type { NormalizedRuntimeEvent } from '@/lib/runtime/normalizeRuntimeEvent';
import type { NormalizedUnityEvent } from '@/lib/runtime/normalizeUnityEvent';

export type ApplyInboundEventResult = {
  guidanceMessages?: GuidanceMessage[];
};

export type AppNormalizedInboundEvent =
  | NormalizedRuntimeEvent
  | NormalizedUnityEvent
  | NormalizedCatalogEvent;

function nowOr(eventTimestamp: string) {
  return eventTimestamp ?? new Date().toISOString();
}

function readinessFromHealthStatus(signal: HealthSignal): OperationalStatus['readiness'] {
  switch (signal.status) {
    case 'healthy':
      return 'ready';
    case 'warning':
      return 'partial';
    case 'degraded':
      return 'partial';
    case 'offline':
      return 'unavailable';
  }
}

function readinessFromCatalogEvent(
  event: CatalogInboundEvent,
): OperationalStatus['readiness'] {
  if (event.type === 'catalog.snapshot.unavailable') {
    return 'unavailable';
  }

  switch (event.payload.status) {
    case 'ready':
      return 'ready';
    case 'partial':
      return 'partial';
    case 'loading':
      return 'pending';
    case 'unavailable':
      return 'unavailable';
    default:
      return 'idle';
  }
}

function readinessFromUnityEvent(
  event: UnityInboundEvent,
): OperationalStatus['readiness'] {
  switch (event.payload.renderState) {
    case 'ready':
      return 'ready';
    case 'rendering':
      return 'pending';
    case 'delayed':
      return 'partial';
    case 'unavailable':
      return 'unavailable';
    default:
      return 'idle';
  }
}

function setOperationalStatus(status: OperationalStatus) {
  useSystemHealthStore.getState().setOperationalStatus(status.surface, status);
}

function applyRuntimeEvent(
  event: RuntimeInboundEvent,
): ApplyInboundEventResult {
  switch (event.type) {
    case 'runtime.user.detected':
      setOperationalStatus({
        surface: 'camera',
        readiness: 'ready',
        summary: 'Shopper detected in frame.',
        updatedAt: nowOr(event.timestamp),
        detectionState: 'detected',
      });
      setOperationalStatus({
        surface: 'runtime',
        readiness: 'ready',
        summary: 'Runtime session is active.',
        updatedAt: nowOr(event.timestamp),
      });
      return {
        guidanceMessages: event.payload.guidance ?? [],
      };

    case 'runtime.user.lost':
      setOperationalStatus({
        surface: 'camera',
        readiness: 'partial',
        summary: 'Shopper is no longer centered in frame.',
        updatedAt: nowOr(event.timestamp),
        detectionState: 'lost',
      });
      return {
        guidanceMessages: event.payload.guidance ?? [],
      };

    case 'runtime.scan.completed':
      setOperationalStatus({
        surface: 'camera',
        readiness: event.payload.readyForCatalog ? 'ready' : 'pending',
        summary: event.payload.readyForCatalog
          ? 'Detection is ready to advance.'
          : 'Detection is still stabilizing.',
        updatedAt: nowOr(event.timestamp),
        detectionState: event.payload.readyForCatalog ? 'ready' : 'detected',
      });

      if (event.payload.readyForCatalog) {
        useSessionStore.getState().markDetectionReady();
      }

      return {};

    case 'runtime.measurements.updated':
      useMeasurementsStore.getState().setSnapshot(event.payload.snapshot);
      return {};

    case 'runtime.fit.updated':
      useFitStore.getState().setRecommendation(event.payload.recommendation);
      return {};

    case 'runtime.guidance.updated':
      return {
        guidanceMessages: event.payload.messages,
      };

    case 'runtime.health.updated':
      useSystemHealthStore.getState().setSignals(event.payload.signals);
      useSystemHealthStore.getState().setOperationalStatuses(
        event.payload.signals.map((signal) => ({
          surface: signal.surface,
          readiness: readinessFromHealthStatus(signal),
          summary: signal.summary,
          updatedAt: signal.updatedAt,
        })),
      );
      return {};
  }
}

function applyUnityEvent(event: UnityInboundEvent): ApplyInboundEventResult {
  const activeGarmentId =
    'activeGarmentId' in event.payload ? event.payload.activeGarmentId : undefined;
  const activeSizeCode =
    'activeSizeCode' in event.payload ? event.payload.activeSizeCode : undefined;

  setOperationalStatus({
    surface: 'unity',
    readiness: readinessFromUnityEvent(event),
    summary:
      event.payload.renderState === 'ready'
        ? 'Unity render is ready.'
        : event.payload.renderState === 'delayed'
          ? 'Unity render is delayed.'
          : event.payload.renderState === 'rendering'
            ? 'Unity render is updating.'
            : event.payload.renderState === 'unavailable'
              ? 'Unity render is unavailable.'
              : 'Unity render is idle.',
    updatedAt: nowOr(event.timestamp),
    renderState: event.payload.renderState,
    activeGarmentId,
    activeSizeCode,
  });

  return {};
}

function applyCatalogEvent(event: CatalogInboundEvent): ApplyInboundEventResult {
  const catalogStore = useCatalogStore.getState();

  if (event.type === 'catalog.snapshot.updated') {
    catalogStore.setSnapshot({
      categories: event.payload.categories,
      garments: event.payload.garments,
      status: event.payload.status,
    });
  } else {
    catalogStore.setSnapshot({
      categories: catalogStore.categories,
      garments: catalogStore.garments,
      status: 'unavailable',
    });
  }

  setOperationalStatus({
    surface: 'catalog',
    readiness: readinessFromCatalogEvent(event),
    summary:
      event.type === 'catalog.snapshot.updated'
        ? 'Catalog snapshot is available.'
        : 'Catalog snapshot is unavailable.',
    updatedAt: nowOr(event.timestamp),
  });

  return {};
}

export function applyInboundEvent(
  event: AppNormalizedInboundEvent,
): ApplyInboundEventResult {
  switch (event.family) {
    case 'runtime':
      return applyRuntimeEvent(event.event);
    case 'unity':
      return applyUnityEvent(event.event);
    case 'catalog':
      return applyCatalogEvent(event.event);
  }
}
