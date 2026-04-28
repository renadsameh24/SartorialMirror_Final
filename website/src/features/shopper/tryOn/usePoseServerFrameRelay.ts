import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createPoseServerFrameRelay,
  type PoseServerFrameRelayStatus,
} from '@/adapters/camera/poseServerFrameRelay';
import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';

type UsePoseServerFrameRelayArgs = {
  enabled: boolean;
  stream: MediaStream | null;
};

export function usePoseServerFrameRelay({ enabled, stream }: UsePoseServerFrameRelayArgs) {
  const config = resolveRuntimeConfig();
  // Unity pose server (python) expects binary JPEG frames on ws://127.0.0.1:8000/ws
  const url = (config as unknown as { VITE_UNITY_POSE_WS_URL?: string }).VITE_UNITY_POSE_WS_URL;
  const poseWsUrl = url?.trim().length ? url!.trim() : 'ws://127.0.0.1:8000/ws';

  const [status, setStatus] = useState<PoseServerFrameRelayStatus>(
    enabled ? 'connecting' : 'disabled',
  );
  const statusRef = useRef(status);

  const relay = useMemo(
    () =>
      createPoseServerFrameRelay({
        frameIntervalMs: 100,
        imageQuality: 0.55,
        maxWidth: 640,
        onStateChange: (next) => {
          statusRef.current = next;
          setStatus(next);
        },
        url: poseWsUrl,
      }),
    [poseWsUrl],
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !stream) {
      relay.stop();
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
      .start(stream)
      .catch(() => {
        if (!cancelled) {
          statusRef.current = 'unavailable';
          setStatus('unavailable');
        }
      });

    return () => {
      cancelled = true;
      relay.stop();
    };
  }, [enabled, relay, stream]);

  return status;
}

