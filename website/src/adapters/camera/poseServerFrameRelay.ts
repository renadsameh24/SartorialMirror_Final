export type PoseServerFrameRelayStatus =
  | 'disabled'
  | 'connecting'
  | 'streaming'
  | 'unavailable';

type MinimalCanvas2DContext = Pick<CanvasRenderingContext2D, 'drawImage'>;

type MinimalCanvasElement = Pick<HTMLCanvasElement, 'height' | 'width'> & {
  getContext: (contextId: '2d') => MinimalCanvas2DContext | null;
  toBlob: (
    callback: (blob: Blob | null) => void,
    type?: string,
    quality?: number,
  ) => void;
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

type PoseServerFrameRelayOptions = {
  documentRef?: Pick<Document, 'createElement'>;
  frameIntervalMs?: number;
  imageQuality?: number;
  maxWidth?: number;
  onStateChange?: (status: PoseServerFrameRelayStatus) => void;
  url: string;
  WebSocketImpl?: typeof WebSocket;
};

const VIDEO_READY_STATE = 2;

function awaitSocketOpen(socket: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    const handleOpen = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Pose server WebSocket failed to open.'));
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
      if (playback && typeof (playback as Promise<void>).catch === 'function') {
        void (playback as Promise<void>).catch(() => undefined);
      }
    } catch {
      // ignore autoplay restrictions
    }
  });
}

function blobToArrayBuffer(blob: Blob) {
  return blob.arrayBuffer();
}

export function createPoseServerFrameRelay(options: PoseServerFrameRelayOptions) {
  const documentRef = options.documentRef ?? globalThis.document;
  const WebSocketCtor = options.WebSocketImpl ?? globalThis.WebSocket;
  const frameIntervalMs = options.frameIntervalMs ?? 100;
  const imageQuality = options.imageQuality ?? 0.55;
  const maxWidth = options.maxWidth ?? 640;

  let socket: WebSocket | null = null;
  let intervalHandle: ReturnType<typeof setInterval> | null = null;
  let streaming = false;
  let video: MinimalVideoElement | null = null;
  let canvas: MinimalCanvasElement | null = null;
  let context: MinimalCanvas2DContext | null = null;

  function emit(status: PoseServerFrameRelayStatus) {
    options.onStateChange?.(status);
  }

  function cleanupSocket() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  function stop() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    streaming = false;
    cleanupSocket();
    emit('disabled');
  }

  async function start(stream: MediaStream) {
    stop();

    if (!WebSocketCtor) {
      emit('unavailable');
      throw new Error('WebSocket is unavailable.');
    }

    video = documentRef?.createElement('video') as MinimalVideoElement | null;
    canvas = documentRef?.createElement('canvas') as MinimalCanvasElement | null;
    context = canvas?.getContext('2d') ?? null;

    if (!video || !canvas || !context) {
      emit('unavailable');
      throw new Error('Capture surfaces are unavailable.');
    }

    emit('connecting');
    socket = new WebSocketCtor(options.url);
    socket.binaryType = 'arraybuffer';

    await awaitSocketOpen(socket);

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;

    await awaitVideoReady(video);

    streaming = true;
    emit('streaming');

    intervalHandle = setInterval(() => {
      if (!socket || socket.readyState !== (WebSocketCtor.OPEN ?? 1)) return;
      if (!video || !canvas || !context) return;
      if (video.readyState < VIDEO_READY_STATE || video.videoWidth === 0) return;

      const scale = Math.min(1, maxWidth / video.videoWidth);
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));

      canvas.width = width;
      canvas.height = height;
      context.drawImage(video as unknown as CanvasImageSource, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || !socket || socket.readyState !== (WebSocketCtor.OPEN ?? 1)) return;
          void blobToArrayBuffer(blob).then((buffer) => {
            if (!socket || socket.readyState !== (WebSocketCtor.OPEN ?? 1)) return;
            socket.send(buffer);
          });
        },
        'image/jpeg',
        imageQuality,
      );
    }, frameIntervalMs);
  }

  return { start, stop };
}

