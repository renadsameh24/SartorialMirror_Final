import { shopperResetHandlers, SHOPPER_RESET_ORDER } from '@/lib/sessionReset/resettableStores';
import { useSessionStore } from '@/stores/session/sessionStore';

export function resetSession() {
  const sessionState = useSessionStore.getState();

  if (sessionState.machine.phase !== 'sessionEnd') {
    sessionState.endSession();
  }

  for (const target of SHOPPER_RESET_ORDER) {
    shopperResetHandlers[target]();
  }
}
