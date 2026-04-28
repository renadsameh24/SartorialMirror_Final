import type { UnityInboundEvent } from '@/adapters/contracts/unity';

export type NormalizedUnityEvent = {
  family: 'unity';
  sessionScoped: boolean;
  event: UnityInboundEvent;
};

export function normalizeUnityEvent(
  event: UnityInboundEvent,
): NormalizedUnityEvent {
  return {
    family: 'unity',
    sessionScoped: Boolean(event.sessionId),
    event,
  };
}
