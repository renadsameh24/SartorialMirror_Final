import type { UnityInboundEvent } from '@/adapters/contracts/unity';
import type { GarmentId, SessionId, SizeCode } from '@/types/shared';

const FIXTURE_TIMESTAMP = '2026-03-24T10:00:00.000Z';

export const DEMO_IDLE_UNITY_EVENT: UnityInboundEvent = {
  type: 'unity.frame.updated',
  source: 'unity',
  timestamp: FIXTURE_TIMESTAMP,
  payload: {
    renderState: 'idle',
  },
};

export function createUnityRenderSequence(
  sessionId: SessionId,
  garmentId?: GarmentId,
  sizeCode?: SizeCode,
): UnityInboundEvent[] {
  return [
    {
      type: 'unity.render.stateUpdated',
      source: 'unity',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        renderState: 'rendering',
        activeGarmentId: garmentId,
        activeSizeCode: sizeCode,
      },
    },
    {
      type: 'unity.render.stateUpdated',
      source: 'unity',
      timestamp: FIXTURE_TIMESTAMP,
      sessionId,
      payload: {
        renderState: 'ready',
        activeGarmentId: garmentId,
        activeSizeCode: sizeCode,
      },
    },
  ];
}

export function createUnityDelayedEvent(
  sessionId: SessionId,
  garmentId?: GarmentId,
  sizeCode?: SizeCode,
): UnityInboundEvent {
  return {
    type: 'unity.render.stateUpdated',
    source: 'unity',
    timestamp: FIXTURE_TIMESTAMP,
    sessionId,
    payload: {
      renderState: 'delayed',
      activeGarmentId: garmentId,
      activeSizeCode: sizeCode,
    },
  };
}
