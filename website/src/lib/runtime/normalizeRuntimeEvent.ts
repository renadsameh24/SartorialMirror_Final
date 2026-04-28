import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';

export type NormalizedRuntimeEvent = {
  family: 'runtime';
  sessionScoped: boolean;
  event: RuntimeInboundEvent;
};

export function normalizeRuntimeEvent(
  event: RuntimeInboundEvent,
): NormalizedRuntimeEvent {
  return {
    family: 'runtime',
    sessionScoped: event.type !== 'runtime.health.updated',
    event,
  };
}
