import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createLocalCameraPreview,
  stopMediaStream,
} from '@/adapters/camera/localCameraPreview';

export type LocalCameraPreviewStatus =
  | 'disabled'
  | 'requesting'
  | 'ready'
  | 'unavailable';

export function useLocalCameraPreview(enabled: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] =
    useState<LocalCameraPreviewStatus>(enabled ? 'requesting' : 'disabled');
  const controller = useMemo(() => createLocalCameraPreview(), []);
  const statusRef = useRef(status);
  const streamRef = useRef(stream);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      controller.stop();

      if (streamRef.current) {
        setStream(null);
      }

      if (statusRef.current !== 'disabled') {
        setStatus('disabled');
      }

      return;
    }

    setStatus('requesting');

    void controller
      .start()
      .then((nextStream) => {
        if (cancelled) {
          stopMediaStream(nextStream);
          return;
        }

        setStream(nextStream);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStream(null);
          setStatus('unavailable');
        }
      });

    return () => {
      cancelled = true;
      controller.stop();
      setStream(null);
    };
  }, [controller, enabled]);

  return {
    status,
    stream,
  };
}
