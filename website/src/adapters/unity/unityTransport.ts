export type UnityTransport = {
  connect: () => void;
  disconnect: () => void;
  emit: (message: string) => void;
  post: (message: string) => void;
  subscribe: (listener: (message: string) => void) => () => void;
};

type UnityTransportOptions = {
  allowedOrigin?: string;
  documentRef?: Document;
  frameSelector?: string;
  maxQueuedMessages?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onPost?: (message: string) => void;
  targetWindow?: Window;
  windowRef?: Window;
};

export function createUnityTransport(
  options: UnityTransportOptions = {},
): UnityTransport {
  const listeners = new Set<(message: string) => void>();
  const queuedMessages: string[] = [];
  const maxQueuedMessages = options.maxQueuedMessages ?? 20;
  const windowRef = options.windowRef ?? globalThis.window;
  const documentRef = options.documentRef ?? globalThis.document;
  const frameSelector =
    options.frameSelector ?? '[data-unity-webgl-frame="true"]';
  let connected = false;
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  function broadcast(message: string) {
    for (const listener of listeners) {
      listener(message);
    }
  }

  function resolveTargetWindow(): Window | null {
    if (options.targetWindow) {
      return options.targetWindow;
    }

    const frame = documentRef?.querySelector<HTMLIFrameElement>(frameSelector);

    return frame?.contentWindow ?? null;
  }

  function normalizeInboundData(data: unknown) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  function flushQueuedMessages() {
    const target = resolveTargetWindow();

    if (!target || !options.allowedOrigin) {
      return;
    }

    while (queuedMessages.length > 0) {
      const message = queuedMessages.shift();

      if (message) {
        target.postMessage(message, options.allowedOrigin);
        options.onPost?.(message);
      }
    }
  }

  function queueMessage(message: string) {
    if (queuedMessages.length >= maxQueuedMessages) {
      queuedMessages.shift();
    }

    queuedMessages.push(message);
  }

  function isSessionEndMessage(message: string) {
    try {
      const parsed = JSON.parse(message) as unknown;

      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        'type' in parsed &&
        parsed.type === 'shopper.session.end'
      );
    } catch {
      return false;
    }
  }

  function handleMessage(event: MessageEvent) {
    if (options.allowedOrigin && event.origin !== options.allowedOrigin) {
      return;
    }

    broadcast(normalizeInboundData(event.data));
  }

  return {
    connect() {
      if (!options.allowedOrigin) {
        options.onConnect?.();
        return;
      }

      if (connected) {
        return;
      }

      connected = true;
      windowRef?.addEventListener('message', handleMessage);
      flushTimer = setInterval(flushQueuedMessages, 250);
      options.onConnect?.();
    },
    disconnect() {
      if (!options.allowedOrigin) {
        options.onDisconnect?.();
        return;
      }

      connected = false;
      windowRef?.removeEventListener('message', handleMessage);

      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }

      options.onDisconnect?.();
    },
    emit(message) {
      broadcast(message);
    },
    post(message) {
      if (!options.allowedOrigin) {
        options.onPost?.(message);
        return;
      }

      const isSessionEnd = isSessionEndMessage(message);

      if (isSessionEnd) {
        queuedMessages.length = 0;
      }

      const target = resolveTargetWindow();

      if (!target) {
        if (isSessionEnd) {
          return;
        }

        queueMessage(message);
        return;
      }

      target.postMessage(message, options.allowedOrigin);
      options.onPost?.(message);
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
