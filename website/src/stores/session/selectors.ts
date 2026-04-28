import { sessionIdOf, sessionPhaseOf, type SessionStore } from '@/types/session';

export function selectShopperPhase(state: SessionStore) {
  return sessionPhaseOf(state.machine);
}

export function selectSessionId(state: SessionStore) {
  return sessionIdOf(state.machine);
}

export function selectCanStartSession(state: SessionStore) {
  return state.machine.phase === 'idle';
}

export function selectIsDetectionPhase(state: SessionStore) {
  return state.machine.phase === 'detection';
}

export function selectCanEndSession(state: SessionStore) {
  return state.machine.phase !== 'idle';
}

export function selectResetPending(state: SessionStore) {
  return state.machine.phase === 'sessionEnd' ? state.machine.resetPending : false;
}
