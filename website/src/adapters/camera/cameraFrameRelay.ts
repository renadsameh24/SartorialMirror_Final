import type { CameraOutboundEvent } from '@/adapters/contracts/camera';

export type CameraFrameRelayStatus =
  | 'disabled'
  | 'connecting'
  | 'streaming'
  | 'unavailable';

export type CameraFrameRelayStopReason =
  | 'componentUnmounted'
  | 'streamEnded'
  | 'uplinkUnavailable';

export type CameraFrameRelay = {
  start: (args: {
    sessionId?: string | null;
    stream: MediaStream;
  }) => Promise<void>;
  stop: (reason?: CameraFrameRelayStopReason) => void;
};

type MinimalCanvas2DContext = Pick<
  CanvasRenderingContext2D,
  'drawImage'
>;

type MinimalCanvasElement = Pick<HTMLCanvasElement, 'height' | 'width'> & {
  getContext: (contextId: '2d') => MinimalCanvas2DContext | null;
  toDataURL: (type?: string, quality?: number) => string;
};

type MinimalVideoElement = Pick<
  HTMLVideoElement,
  | 'addEventListener'
  | 'muted'
  | 'playsInline'
  | 'readyState'
  | 'removeEventListener'
  | 'srcObject'
  | 'videoHeight'
  | 'videoWidth'
> & {
  autoplay?: boolean;
  play?: () => Promise<void> | void;
};

type CameraFrameRelayOptions = {
  documentRef?: Pick<Document, 'createElement'>;
  frameIntervalMs?: number;
  imageQuality?: number;
  maxWidth?: number;
  now?: () => string;
  onStateChange?: (status: CameraFrameRelayStatus) => void;
  setIntervalFn?: typeof setInterval;
  clearIntervalFn?: typeof clearInterval;
  url?: string;
  WebSocketImpl?: typeof WebSocket;
};

const VIDEO_READY_STATE = 2;

function createMessage(
  event: CameraOutboundEvent,
) {
  return JSON.stringify(event);
}

function awaitSocketOpen(socket: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    const handleOpen = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Camera uplink WebSocket failed to open.'));
    };
    const cleanup = () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('error', handleError);
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('error', handleError);
  });
}

function awaitVideoReady(video: MinimalVideoElement) {
  if (video.readyState >= VIDEO_READY_STATE && video.videoWidth > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const handleReady = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Camera video stream failed to become readable.'));
    };
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleReady);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('error', handleError);
    };

    video.addEventListener('loadedmetadata', handleReady);
    video.addEventListener('canplay', handleReady);
    video.addEventListener('error', handleError);

    try {
      const playback = video.play?.();

      if (playback && typeof playback.catch === 'function') {
        void playback.catch(() => undefined);
      }
    } catch {
      // Ignore autoplay restrictions or non-browser test environments.
    }
  });
}

export function createCameraFrameRelay(
  options: CameraFrameRelayOptions = {},
): CameraFrameRelay {
  const documentRef = options.documentRef ?? globalThis.document;
  const WebSocketCtor = options.WebSocketImpl ?? globalThis.WebSocket;
  const frameIntervalMs = options.frameIntervalMs ?? 300;
  const imageQuality = options.imageQuality ?? 0.72;
  const maxWidth = options.maxWidth ?? 960;
  const now = options.now ?? (() => new Date().toISOString());
  const setIntervalFn = options.setIntervalFn ?? globalThis.setInterval;
  const clearIntervalFn = options.clearIntervalFn ?? globalThis.clearInterval;

  let frameCount = 0;
  let intervalHandle: ReturnType<typeof setInterval> | null = null;
  let socket: WebSocket | null = null;
  let currentSessionId: string | null | undefined;
  let stopNotified = false;
  let streaming = false;
  let video: MinimalVideoElement | null = null;
  let canvas: MinimalCanvasElement | null = null;
  let context: MinimalCanvas2DContext | null = null;

  function emitState(status: CameraFrameRelayStatus) {
    options.onStateChange?.(status);
  }

  function sendStopMessage(reason: CameraFrameRelayStopReason) {
    if (!socket || socket.readyState !== (WebSocketCtor?.OPEN ?? 1) || stopNotified) {
      return;
    }

    stopNotified = true;
    socket.send(
      createMessage({
        type: 'camera.stream.stopped',
        source: 'app',
        timestamp: now(),
        sessionId: currentSessionId ?? undefined,
        payload: {
          reason,
        },
      }),
    );
  }

  function cleanupSocket() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  function stop(reason: CameraFrameRelayStopReason = 'componentUnmounted') {
    if (intervalHandle) {
      clearIntervalFn(intervalHandle);
      intervalHandle = null;
    }

    if (streaming) {
      sendStopMessage(reason);
    }

    streaming = false;
    stopNotified = false;
    cleanupSocket();
    emitState('disabled');
  }

  async function start({
    sessionId,
    stream,
  }: {
    sessionId?: string | null;
    stream: MediaStream;
  }) {
    stop('componentUnmounted');

    if (!options.url) {
      emitState('unavailable');
      throw new Error('Camera uplink URL is missing.');
    }

    if (!WebSocketCtor) {
      emitState('unavailable');
      throw new Error('Camera uplink WebSocket is unavailable.');
    }

    video = documentRef?.createElement('video') as MinimalVideoElement | null;
    canvas = documentRef?.createElement('canvas') as MinimalCanvasElement | null;
    context = canvas?.getContext('2d') ?? null;

    if (!video || !canvas || !context) {
      emitState('unavailable');
      throw new Error('Camera uplink capture surfaces are unavailable.');
    }

    const videoElement = video;
    const canvasElement = canvas;
    const context2d = context;

    currentSessionId = sessionId;
    frameCount = 0;
    emitState('connecting');

    socket = new WebSocketCtor(options.url);
    socket.addEventListener('close', () => {
      if (streaming) {
        streaming = false;

        if (intervalHandle) {
          clearIntervalFn(intervalHandle);
          intervalHandle = null;
        }

        emitState('unavailable');
      }
    });
    socket.addEventListener('error', () => {
      if (streaming) {
        emitState('unavailable');
      }
    });

    await awaitSocketOpen(socket);

    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;
    videoElement.srcObject = stream;

    await awaitVideoReady(videoElement);

    socket.send(
      createMessage({
        type: 'camera.stream.started',
        source: 'app',
        timestamp: now(),
        sessionId: currentSessionId ?? undefined,
        payload: {
          frameIntervalMs,
          mimeType: 'image/jpeg',
          transport: 'dataUrl',
        },
      }),
    );

    streaming = true;
    emitState('streaming');

    intervalHandle = setIntervalFn(() => {
      if (!socket || socket.readyState !== (WebSocketCtor.OPEN ?? 1)) {
        return;
      }

      if (
        videoElement.readyState < VIDEO_READY_STATE ||
        videoElement.videoWidth === 0
      ) {
        return;
      }

      const scale = Math.min(1, maxWidth / videoElement.videoWidth);
      const width = Math.max(1, Math.round(videoElement.videoWidth * scale));
      const height = Math.max(1, Math.round(videoElement.videoHeight * scale));

      canvasElement.width = width;
      canvasElement.height = height;
      context2d.drawImage(
        videoElement as unknown as CanvasImageSource,
        0,
        0,
        width,
        height,
      );

      socket.send(
        createMessage({
          type: 'camera.frame.captured',
          source: 'app',
          timestamp: now(),
          sessionId: currentSessionId ?? undefined,
          payload: {
            dataUrl: canvasElement.toDataURL('image/jpeg', imageQuality),
            frameId: `frame-${frameCount += 1}`,
            height,
            mimeType: 'image/jpeg',
            width,
          },
        }),
      );
    }, frameIntervalMs);
  }

  return {
    start,
    stop,
  };
}
