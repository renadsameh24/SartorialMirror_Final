import type { SessionId } from '@/types/shared';
import type { NormalizedCatalogEvent } from '@/lib/runtime/normalizeCatalogEvent';
import type { NormalizedRuntimeEvent } from '@/lib/runtime/normalizeRuntimeEvent';
import type { NormalizedUnityEvent } from '@/lib/runtime/normalizeUnityEvent';

export type NormalizedInboundEvent =
  | NormalizedRuntimeEvent
  | NormalizedUnityEvent
  | NormalizedCatalogEvent;

export function shouldApplyInboundEvent(
  event: NormalizedInboundEvent,
  activeSessionId: SessionId | null,
): boolean {
  if (!event.sessionScoped) {
    return true;
  }

  if (!activeSessionId) {
    return false;
  }

  return event.event.sessionId == null || event.event.sessionId === activeSessionId;
}
