import type { InboundEventEnvelope } from '@/adapters/contracts/shared';
import type { GarmentId, SizeCode } from '@/types/shared';
import type { UnityRenderState } from '@/types/system';

export type UnityInboundEvent =
  | InboundEventEnvelope<
      'unity.render.stateUpdated',
      'unity',
      {
        renderState: UnityRenderState;
        activeGarmentId?: GarmentId;
        activeSizeCode?: SizeCode;
      }
    >
  | InboundEventEnvelope<
      'unity.frame.updated',
      'unity',
      { renderState: UnityRenderState }
    >;
