import type {
  SessionId,
  ShopperInputMethod,
  ShopperPhase,
  SessionIdentitySource,
} from '@/types/shared';

export type ShopperStateNode =
  | { phase: 'idle' }
  | { phase: 'detection'; sessionId: SessionId }
  | { phase: 'catalog'; sessionId: SessionId }
  | { phase: 'tryOn'; sessionId: SessionId }
  | { phase: 'fitDetails'; sessionId: SessionId }
  | { phase: 'sessionEnd'; sessionId: SessionId; resetPending: boolean };

export type SessionTransitionApi = {
  startSession: (input: ShopperInputMethod) => void;
  markDetectionReady: () => void;
  confirmSelection: () => void;
  returnToCatalog: () => void;
  openFitDetails: () => void;
  returnToTryOn: () => void;
  endSession: () => void;
  completeReset: () => void;
};

export type SessionState = {
  lastInputMethod: ShopperInputMethod | null;
  machine: ShopperStateNode;
  sessionIdentitySource: SessionIdentitySource | null;
};

export type SessionActions = SessionTransitionApi & {
  adoptRuntimeSessionId: (sessionId: SessionId) => void;
};

export type SessionStore = SessionState & SessionActions;

export function sessionPhaseOf(machine: ShopperStateNode): ShopperPhase {
  return machine.phase;
}

export function sessionIdOf(machine: ShopperStateNode): SessionId | null {
  return 'sessionId' in machine ? machine.sessionId : null;
}
