import { selectAdminState } from '@/stores/admin/selectors';
import { selectCanEndSession, selectCanStartSession } from '@/stores/session/selectors';
import { selectUiMode } from '@/stores/uiMode/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';

export type AdminAccessGateReadModel = {
  canRequestAccess: boolean;
  canReturnToShopper: boolean;
  shopperState: 'idle' | 'active';
  state: 'blocked' | 'hidden' | 'granted' | 'requested';
  support: string;
};

export function readAdminAccessGate(): AdminAccessGateReadModel {
  const sessionState = useSessionStore.getState();
  const adminState = selectAdminState(useAdminStore.getState());
  const uiMode = selectUiMode(useUiModeStore.getState());
  const canStartSession = selectCanStartSession(sessionState);
  const canEndSession = selectCanEndSession(sessionState);

  if (adminState.access === 'granted') {
    return {
      canRequestAccess: false,
      canReturnToShopper: true,
      shopperState: 'idle',
      state: 'granted',
      support: 'Admin access is unlocked for this local device.',
    };
  }

  if (canEndSession) {
    return {
      canRequestAccess: false,
      canReturnToShopper: uiMode === 'admin',
      shopperState: 'active',
      state: 'blocked',
      support:
        'Local admin access is unavailable right now. End the shopper session, then try again.',
    };
  }

  if (uiMode === 'admin' || adminState.access === 'requested') {
    return {
      canRequestAccess: false,
      canReturnToShopper: true,
      shopperState: 'idle',
      state: 'requested',
      support:
        'Shopper data has already been cleared on this device. Enter the local PIN to open operational tools.',
    };
  }

  return {
    canRequestAccess: canStartSession,
    canReturnToShopper: false,
    shopperState: 'idle',
    state: 'hidden',
    support:
      'Admin access is available after the shopper experience is idle and cleared.',
  };
}
