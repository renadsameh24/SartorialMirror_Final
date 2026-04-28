import type { FitRecommendation } from '@/types/fit';
import type { MeasurementSnapshot } from '@/types/measurements';
import type { GuidanceMessage, HealthSignal } from '@/types/system';
import type { InboundEventEnvelope } from '@/adapters/contracts/shared';

export type RuntimeInboundEvent =
  | InboundEventEnvelope<
      'runtime.user.detected',
      'runtime',
      { detectionState: 'detected'; guidance?: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.user.lost',
      'runtime',
      { detectionState: 'lost'; guidance?: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.scan.completed',
      'runtime',
      { readyForCatalog: boolean }
    >
  | InboundEventEnvelope<
      'runtime.measurements.updated',
      'runtime',
      { snapshot: MeasurementSnapshot }
    >
  | InboundEventEnvelope<
      'runtime.fit.updated',
      'runtime',
      { recommendation: FitRecommendation }
    >
  | InboundEventEnvelope<
      'runtime.guidance.updated',
      'runtime',
      { messages: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.health.updated',
      'runtime',
      { signals: HealthSignal[] }
    >;
