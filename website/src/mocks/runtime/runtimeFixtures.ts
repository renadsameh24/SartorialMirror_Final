import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { FitRecommendation } from '@/types/fit';
import type { MeasurementSnapshot } from '@/types/measurements';
import type { GuidanceMessage, HealthSignal } from '@/types/system';
import type { SessionId } from '@/types/shared';

const FIXTURE_TIMESTAMP = '2026-03-24T10:00:00.000Z';

export const DEMO_HEALTHY_SIGNALS: HealthSignal[] = [
  {
    surface: 'camera',
    status: 'healthy',
    summary: 'Camera feed is stable.',
    updatedAt: FIXTURE_TIMESTAMP,
  },
  {
    surface: 'runtime',
    status: 'healthy',
    summary: 'Runtime connection is available.',
    updatedAt: FIXTURE_TIMESTAMP,
  },
  {
    surface: 'unity',
    status: 'healthy',
    summary: 'Unity bridge is responsive.',
    updatedAt: FIXTURE_TIMESTAMP,
  },
  {
    surface: 'catalog',
    status: 'healthy',
    summary: 'Local catalog snapshot is loaded.',
    updatedAt: FIXTURE_TIMESTAMP,
  },
];

export const DEMO_DETECTION_GUIDANCE: GuidanceMessage[] = [
  {
    id: 'guidance-detection-position',
    scope: 'detection',
    tone: 'assistive',
    title: 'Adjust position',
    body: 'Stand centered in the frame to continue.',
    actionLabel: 'Reposition',
    actionIntent: 'reposition',
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export const DEMO_TRY_ON_GUIDANCE: GuidanceMessage[] = [
  {
    id: 'guidance-tryon-render',
    scope: 'tryOn',
    tone: 'neutral',
    title: 'Render catching up',
    body: 'Hold position while the try-on view refreshes.',
    actionLabel: 'Continue',
    actionIntent: 'continue',
    createdAt: FIXTURE_TIMESTAMP,
  },
];

export const DEMO_READY_MEASUREMENT_SNAPSHOT: MeasurementSnapshot = {
  status: 'ready',
  lastUpdatedAt: FIXTURE_TIMESTAMP,
  samples: [
    {
      id: 'measurement-chest',
      key: 'chest',
      label: 'Chest',
      valueCm: 98,
      unit: 'cm',
      source: 'runtime',
      capturedAt: FIXTURE_TIMESTAMP,
    },
    {
      id: 'measurement-waist',
      key: 'waist',
      label: 'Waist',
      valueCm: 84,
      unit: 'cm',
      source: 'runtime',
      capturedAt: FIXTURE_TIMESTAMP,
    },
    {
      id: 'measurement-shoulder',
      key: 'shoulderWidth',
      label: 'Shoulder Width',
      valueCm: 46,
      unit: 'cm',
      source: 'runtime',
      capturedAt: FIXTURE_TIMESTAMP,
    },
    {
      id: 'measurement-sleeve',
      key: 'sleeveLength',
      label: 'Sleeve Length',
      valueCm: 64,
      unit: 'cm',
      source: 'runtime',
      capturedAt: FIXTURE_TIMESTAMP,
    },
    {
      id: 'measurement-torso',
      key: 'torsoLength',
      label: 'Torso Length',
      valueCm: 71,
      unit: 'cm',
      source: 'runtime',
      capturedAt: FIXTURE_TIMESTAMP,
    },
  ],
};

export const DEMO_PARTIAL_MEASUREMENT_SNAPSHOT: MeasurementSnapshot = {
  ...DEMO_READY_MEASUREMENT_SNAPSHOT,
  status: 'partial',
  samples: DEMO_READY_MEASUREMENT_SNAPSHOT.samples.map((sample) =>
    sample.key === 'sleeveLength' ? { ...sample, valueCm: null } : sample,
  ),
};

export const DEMO_READY_FIT_RECOMMENDATION: FitRecommendation = {
  garmentId: 'tailored-blazer',
  evaluatedSize: 'M',
  recommendedSize: 'M',
  fitBand: 'bestFit',
  confidenceBand: 'high',
  confidenceScore: 0.92,
  summary: 'Current size is the best fit.',
  reasons: ['Chest and shoulder measurements align well.'],
  alternativeSize: 'L',
  updatedAt: FIXTURE_TIMESTAMP,
};

export const DEMO_PARTIAL_FIT_RECOMMENDATION: FitRecommendation = {
  garmentId: 'tailored-blazer',
  evaluatedSize: 'M',
  recommendedSize: 'L',
  fitBand: 'slightlyTight',
  confidenceBand: 'medium',
  confidenceScore: 0.64,
  summary: 'A larger size may feel more comfortable.',
  reasons: ['Sleeve estimate is still settling.'],
  alternativeSize: 'L',
  updatedAt: FIXTURE_TIMESTAMP,
};

export function createDemoRuntimeStartEvents(
  sessionId: SessionId,
): RuntimeInboundEvent[] {
  return [
    {
      type: 'runtime.health.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      payload: {
        signals: DEMO_HEALTHY_SIGNALS,
      },
    },
    {
      type: 'runtime.user.detected',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        detectionState: 'detected',
        guidance: DEMO_DETECTION_GUIDANCE,
      },
    },
    {
      type: 'runtime.scan.completed',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        readyForCatalog: true,
      },
    },
    {
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
      },
    },
    {
      type: 'runtime.fit.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        recommendation: DEMO_READY_FIT_RECOMMENDATION,
      },
    },
  ];
}

export function createDemoRuntimePartialEvents(
  sessionId: SessionId,
): RuntimeInboundEvent[] {
  return [
    {
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        snapshot: DEMO_PARTIAL_MEASUREMENT_SNAPSHOT,
      },
    },
    {
      type: 'runtime.fit.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        recommendation: DEMO_PARTIAL_FIT_RECOMMENDATION,
      },
    },
    {
      type: 'runtime.guidance.updated',
      source: 'runtime',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        messages: DEMO_TRY_ON_GUIDANCE,
      },
    },
  ];
}

export function createDemoRuntimeLostEvent(
  sessionId: SessionId,
): Extract<RuntimeInboundEvent, { type: 'runtime.user.lost' }> {
  return {
    type: 'runtime.user.lost',
    source: 'runtime',
    timestamp: FIXTURE_TIMESTAMP,
    sessionId,
    payload: {
      detectionState: 'lost',
      guidance: DEMO_DETECTION_GUIDANCE,
    },
  };
}
