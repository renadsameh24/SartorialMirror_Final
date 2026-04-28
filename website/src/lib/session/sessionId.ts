import type { SessionId } from '@/types/shared';

const SESSION_PREFIX = 'session';

export function createFrontendSessionId(): SessionId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${SESSION_PREFIX}-${crypto.randomUUID()}`;
  }

  return `${SESSION_PREFIX}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function adoptSessionId(sessionId: SessionId): SessionId {
  return sessionId;
}
