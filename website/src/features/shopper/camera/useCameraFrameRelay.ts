import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createCameraFrameRelay,
  type CameraFrameRelayStatus,
} from '@/adapters/camera/cameraFrameRelay';
import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';

type UseCameraFrameRelayArgs = {
  enabled: boolean;
  sessionId?: string | null;
  stream: MediaStream | null;
};

export function useCameraFrameRelay({
  enabled,
  sessionId,
  stream,
}: UseCameraFrameRelayArgs) {
  const { cameraUplinkWsUrl } = resolveRuntimeConfig();
  const [status, setStatus] =
    useState<CameraFrameRelayStatus>(enabled ? 'connecting' : 'disabled');
  const statusRef = useRef(status);
  const relay = useMemo(
    () =>
      createCameraFrameRelay({
        // Keep payloads comfortably under typical WS message limits.
        // JPEG data URLs can get large fast; a conservative default avoids
        // silent disconnects that show up as "camera feed not reaching backend".
        frameIntervalMs: 500,
        imageQuality: 0.55,
        maxWidth: 640,
        onStateChange: (nextStatus) => {
          statusRef.current = nextStatus;
          setStatus(nextStatus);
        },
        url: cameraUplinkWsUrl,
      }),
    [cameraUplinkWsUrl],
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !stream) {
      relay.stop('componentUnmounted');

      if (statusRef.current !== 'disabled') {
        statusRef.current = 'disabled';
        setStatus('disabled');
      }

      return;
    }

    if (statusRef.current !== 'connecting') {
      statusRef.current = 'connecting';
      setStatus('connecting');
    }

    void relay
      .start({
        sessionId,
        stream,
      })
      .catch(() => {
        if (!cancelled) {
          statusRef.current = 'unavailable';
          setStatus('unavailable');
        }
      });

    return () => {
      cancelled = true;
      relay.stop('componentUnmounted');
    };
  }, [enabled, relay, sessionId, stream]);

  return status;
}
