import type {
  DegradedIssue,
  DegradedIssueFamily,
  GuidanceMessage,
  OperationalStatusMap,
} from '@/types/system';
import type { CatalogLoadStatus } from '@/types/catalog';
import type { MeasurementStatus } from '@/types/measurements';
import type { FitStatus } from '@/types/fit';
import type { ShopperPhase } from '@/types/shared';

export type DegradedDerivationInput = {
  catalogStatus: CatalogLoadStatus;
  fitStatus: FitStatus;
  measurementsStatus: MeasurementStatus;
  operationalStatuses: OperationalStatusMap;
  phase: ShopperPhase;
  runtimeGuidance?: GuidanceMessage[];
};

export type DerivedDegradedState = {
  guidance: GuidanceMessage[];
  issues: DegradedIssue[];
};

function createIssue(
  family: DegradedIssueFamily,
  input: Omit<DegradedIssue, 'family' | 'id'>,
): DegradedIssue {
  return {
    ...input,
    family,
    id: family,
  };
}

function createFallbackGuidance(issue: DegradedIssue): GuidanceMessage {
  const guidanceMap: Record<DegradedIssueFamily, GuidanceMessage> = {
    'detection.userMissing': {
      id: 'guidance-detection-user-missing',
      scope: 'detection',
      tone: 'assistive',
      title: 'Step back into view',
      body: 'Return to the center of the frame to continue.',
      actionLabel: 'Reposition',
      actionIntent: 'reposition',
      createdAt: issue.detectedAt,
    },
    'detection.positioning': {
      id: 'guidance-detection-positioning',
      scope: 'detection',
      tone: 'assistive',
      title: 'Hold position',
      body: 'Keep your shoulders square to the display while detection settles.',
      actionLabel: 'Continue',
      actionIntent: 'continue',
      createdAt: issue.detectedAt,
    },
    'runtime.disconnected': {
      id: 'guidance-runtime-disconnected',
      scope: 'system',
      tone: 'warning',
      title: 'Runtime unavailable',
      body: 'Retry in a moment or ask staff for help if the issue persists.',
      actionLabel: 'Retry',
      actionIntent: 'retry',
      createdAt: issue.detectedAt,
    },
    'catalog.unavailable': {
      id: 'guidance-catalog-unavailable',
      scope: 'system',
      tone: 'warning',
      title: 'Catalog unavailable',
      body: 'The local garment catalog is still loading. Please retry shortly.',
      actionLabel: 'Retry',
      actionIntent: 'retry',
      createdAt: issue.detectedAt,
    },
    'unity.delayed': {
      id: 'guidance-unity-delayed',
      scope: 'tryOn',
      tone: 'neutral',
      title: 'Render catching up',
      body: 'Hold position while the try-on view refreshes.',
      actionLabel: 'Continue',
      actionIntent: 'continue',
      createdAt: issue.detectedAt,
    },
    'unity.unavailable': {
      id: 'guidance-unity-unavailable',
      scope: 'tryOn',
      tone: 'warning',
      title: 'Try-on view unavailable',
      body: 'Retry in a moment or return to the catalog while the view reconnects.',
      actionLabel: 'Retry',
      actionIntent: 'retry',
      createdAt: issue.detectedAt,
    },
    'measurements.partial': {
      id: 'guidance-measurements-partial',
      scope: 'fit',
      tone: 'assistive',
      title: 'Measurements still settling',
      body: 'A few measurements are still being refined.',
      actionLabel: 'Continue',
      actionIntent: 'continue',
      createdAt: issue.detectedAt,
    },
    'measurements.unavailable': {
      id: 'guidance-measurements-unavailable',
      scope: 'fit',
      tone: 'warning',
      title: 'Measurements unavailable',
      body: 'Reposition and retry to refresh your measurement set.',
      actionLabel: 'Retry',
      actionIntent: 'retry',
      createdAt: issue.detectedAt,
    },
    'fit.partial': {
      id: 'guidance-fit-partial',
      scope: 'fit',
      tone: 'assistive',
      title: 'Fit estimate still refining',
      body: 'The current recommendation is usable, but more data may improve it.',
      actionLabel: 'Continue',
      actionIntent: 'continue',
      createdAt: issue.detectedAt,
    },
    'fit.unavailable': {
      id: 'guidance-fit-unavailable',
      scope: 'fit',
      tone: 'warning',
      title: 'Fit recommendation unavailable',
      body: 'Retry after measurements refresh or choose another garment.',
      actionLabel: 'Retry',
      actionIntent: 'retry',
      createdAt: issue.detectedAt,
    },
  };

  return guidanceMap[issue.family];
}

export function deriveDegradedState(
  input: DegradedDerivationInput,
): DerivedDegradedState {
  const issues: DegradedIssue[] = [];
  const timestamp =
    input.operationalStatuses.runtime?.updatedAt ??
    input.operationalStatuses.camera?.updatedAt ??
    new Date().toISOString();

  const runtimeStatus = input.operationalStatuses.runtime;
  const cameraStatus = input.operationalStatuses.camera;
  const unityStatus = input.operationalStatuses.unity;

  if (input.phase === 'detection' && cameraStatus?.detectionState === 'lost') {
    issues.push(
      createIssue('detection.userMissing', {
        surface: 'camera',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Return to the frame to continue.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  } else if (
    input.phase === 'detection' &&
    cameraStatus?.detectionState === 'detected'
  ) {
    issues.push(
      createIssue('detection.positioning', {
        surface: 'camera',
        status: 'attention',
        shopperVisible: true,
        summary: 'Hold position while detection settles.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  }

  if (runtimeStatus?.readiness === 'unavailable') {
    issues.push(
      createIssue('runtime.disconnected', {
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: runtimeStatus.summary,
        detectedAt: runtimeStatus.updatedAt,
        sessionScoped: false,
      }),
    );
  }

  if (input.catalogStatus === 'unavailable') {
    issues.push(
      createIssue('catalog.unavailable', {
        surface: 'catalog',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Catalog is unavailable.',
        detectedAt: input.operationalStatuses.catalog?.updatedAt ?? timestamp,
        sessionScoped: false,
      }),
    );
  }

  if (unityStatus?.renderState === 'delayed') {
    issues.push(
      createIssue('unity.delayed', {
        surface: 'unity',
        status: 'attention',
        shopperVisible: true,
        summary: unityStatus.summary,
        detectedAt: unityStatus.updatedAt,
        sessionScoped: true,
      }),
    );
  }

  if (unityStatus?.renderState === 'unavailable') {
    issues.push(
      createIssue('unity.unavailable', {
        surface: 'unity',
        status: 'degraded',
        shopperVisible: true,
        summary: unityStatus.summary,
        detectedAt: unityStatus.updatedAt,
        sessionScoped: false,
      }),
    );
  }

  if (input.measurementsStatus === 'partial') {
    issues.push(
      createIssue('measurements.partial', {
        surface: 'runtime',
        status: 'attention',
        shopperVisible: true,
        summary: 'Measurements are partially available.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  }

  if (input.measurementsStatus === 'unavailable') {
    issues.push(
      createIssue('measurements.unavailable', {
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Measurements are unavailable.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  }

  if (input.fitStatus === 'partial') {
    issues.push(
      createIssue('fit.partial', {
        surface: 'runtime',
        status: 'attention',
        shopperVisible: true,
        summary: 'Fit recommendation is partially available.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  }

  if (input.fitStatus === 'unavailable') {
    issues.push(
      createIssue('fit.unavailable', {
        surface: 'runtime',
        status: 'degraded',
        shopperVisible: true,
        summary: 'Fit recommendation is unavailable.',
        detectedAt: timestamp,
        sessionScoped: true,
      }),
    );
  }

  const guidance =
    input.runtimeGuidance && input.runtimeGuidance.length > 0
      ? input.runtimeGuidance
      : issues.length > 0
        ? [createFallbackGuidance(issues[0]!)]
        : [];

  return {
    guidance,
    issues,
  };
}
