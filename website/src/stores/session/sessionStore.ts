import { create } from 'zustand';

import { adoptSessionId, createFrontendSessionId } from '@/lib/session/sessionId';
import type { SessionStore, ShopperStateNode } from '@/types/session';

export function createInitialSessionState() {
  return {
    lastInputMethod: null,
    machine: { phase: 'idle' } as ShopperStateNode,
    sessionIdentitySource: null,
  };
}

function sessionIdFor(machine: ShopperStateNode) {
  return 'sessionId' in machine ? machine.sessionId : null;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...createInitialSessionState(),
  startSession: (input) => {
    const { machine } = get();

    if (machine.phase !== 'idle') {
      return;
    }

    set({
      lastInputMethod: input,
      machine: {
        phase: 'detection',
        sessionId: createFrontendSessionId(),
      },
      sessionIdentitySource: 'frontend',
    });
  },
  markDetectionReady: () => {
    const { machine } = get();

    if (machine.phase !== 'detection') {
      return;
    }

    set({
      machine: {
        phase: 'catalog',
        sessionId: machine.sessionId,
      },
    });
  },
  confirmSelection: () => {
    const { machine } = get();

    if (machine.phase !== 'catalog') {
      return;
    }

    set({
      machine: {
        phase: 'tryOn',
        sessionId: machine.sessionId,
      },
    });
  },
  returnToCatalog: () => {
    const { machine } = get();

    if (machine.phase !== 'tryOn') {
      return;
    }

    set({
      machine: {
        phase: 'catalog',
        sessionId: machine.sessionId,
      },
    });
  },
  openFitDetails: () => {
    const { machine } = get();

    if (machine.phase !== 'tryOn') {
      return;
    }

    set({
      machine: {
        phase: 'fitDetails',
        sessionId: machine.sessionId,
      },
    });
  },
  returnToTryOn: () => {
    const { machine } = get();

    if (machine.phase !== 'fitDetails') {
      return;
    }

    set({
      machine: {
        phase: 'tryOn',
        sessionId: machine.sessionId,
      },
    });
  },
  endSession: () => {
    const { machine } = get();
    const currentSessionId = sessionIdFor(machine);

    if (!currentSessionId) {
      return;
    }

    set({
      machine: {
        phase: 'sessionEnd',
        sessionId: currentSessionId,
        resetPending: true,
      },
    });
  },
  completeReset: () => {
    const { machine } = get();

    if (machine.phase !== 'sessionEnd') {
      return;
    }

    set({
      ...createInitialSessionState(),
    });
  },
  adoptRuntimeSessionId: (sessionId) => {
    const { machine } = get();
    const adoptedSessionId = adoptSessionId(sessionId);

    switch (machine.phase) {
      case 'detection':
      case 'catalog':
      case 'tryOn':
      case 'fitDetails':
        set({
          machine: {
            phase: machine.phase,
            sessionId: adoptedSessionId,
          },
          sessionIdentitySource: 'runtime',
        });
        return;
      case 'sessionEnd':
        set({
          machine: {
            phase: 'sessionEnd',
            sessionId: adoptedSessionId,
            resetPending: machine.resetPending,
          },
          sessionIdentitySource: 'runtime',
        });
        return;
      default:
        return;
    }
  },
}));
