import { beforeEach, describe, expect, it } from 'vitest';

import { selectShopperPhase } from '@/stores/session/selectors';
import {
  createInitialSessionState,
  useSessionStore,
} from '@/stores/session/sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState(createInitialSessionState());
  });

  it('follows the canonical shopper transition path', () => {
    const session = useSessionStore.getState();

    session.startSession('keyboard');
    expect(selectShopperPhase(useSessionStore.getState())).toBe('detection');

    session.markDetectionReady();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('catalog');

    session.confirmSelection();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('tryOn');

    session.openFitDetails();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('fitDetails');

    session.returnToTryOn();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('tryOn');

    session.endSession();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('sessionEnd');
  });

  it('ignores invalid transitions outside the allowed phase graph', () => {
    const session = useSessionStore.getState();

    session.confirmSelection();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('idle');

    session.startSession('mouse');
    session.openFitDetails();
    expect(selectShopperPhase(useSessionStore.getState())).toBe('detection');
  });

  it('creates frontend session ids by default and adopts runtime ids when provided', () => {
    const session = useSessionStore.getState();

    session.startSession('keyboard');

    const frontendSessionId = useSessionStore.getState().machine;
    expect(frontendSessionId.phase).toBe('detection');
    expect('sessionId' in frontendSessionId && frontendSessionId.sessionId).toMatch(
      /^session-/,
    );
    expect(useSessionStore.getState().sessionIdentitySource).toBe('frontend');

    session.adoptRuntimeSessionId('runtime-session-123');

    const adoptedSession = useSessionStore.getState().machine;
    expect('sessionId' in adoptedSession && adoptedSession.sessionId).toBe(
      'runtime-session-123',
    );
    expect(useSessionStore.getState().sessionIdentitySource).toBe('runtime');
  });

  it('keeps repeated endSession calls stable and adopts runtime ids during sessionEnd', () => {
    const session = useSessionStore.getState();

    session.startSession('keyboard');
    const detectionMachine = useSessionStore.getState().machine;
    const detectionSessionId =
      'sessionId' in detectionMachine ? detectionMachine.sessionId : null;

    session.endSession();
    session.endSession();

    const sessionEndMachine = useSessionStore.getState().machine;
    expect(sessionEndMachine.phase).toBe('sessionEnd');
    expect('sessionId' in sessionEndMachine && sessionEndMachine.sessionId).toBe(
      detectionSessionId,
    );
    expect('resetPending' in sessionEndMachine && sessionEndMachine.resetPending).toBe(
      true,
    );

    session.adoptRuntimeSessionId('runtime-session-end');

    const adoptedMachine = useSessionStore.getState().machine;
    expect(adoptedMachine).toMatchObject({
      phase: 'sessionEnd',
      resetPending: true,
      sessionId: 'runtime-session-end',
    });
    expect(useSessionStore.getState().sessionIdentitySource).toBe('runtime');
  });

  it('keeps invalid transitions as no-ops without mutating the current session identity', () => {
    const session = useSessionStore.getState();

    session.startSession('mouse');
    const startedMachine = useSessionStore.getState().machine;
    const sessionId = 'sessionId' in startedMachine ? startedMachine.sessionId : null;

    session.startSession('keyboard');
    session.returnToTryOn();
    session.completeReset();

    const nextMachine = useSessionStore.getState().machine;
    expect(nextMachine).toMatchObject({
      phase: 'detection',
      sessionId,
    });
    expect(useSessionStore.getState().lastInputMethod).toBe('mouse');
    expect(useSessionStore.getState().sessionIdentitySource).toBe('frontend');
  });
});
