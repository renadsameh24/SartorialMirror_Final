import { useEffect, useRef, useState } from 'react';

import { selectCanEndSession, selectCanStartSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';

const POST_RESET_CONFIRMATION_MS = 2400;

export function usePostResetConfirmation() {
  const canEndSession = useSessionStore(selectCanEndSession);
  const canStartSession = useSessionStore(selectCanStartSession);
  const [visible, setVisible] = useState(false);
  const previousCanEndSession = useRef(canEndSession);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousCanEndSession.current && !canEndSession && canStartSession) {
      setVisible(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, POST_RESET_CONFIRMATION_MS);
    }

    if (canEndSession && visible) {
      setVisible(false);
    }

    previousCanEndSession.current = canEndSession;
  }, [canEndSession, canStartSession, visible]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return visible;
}
