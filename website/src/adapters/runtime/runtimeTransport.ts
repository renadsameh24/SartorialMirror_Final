export type RuntimeTransport = {
  connect: () => void;
  disconnect: () => void;
  emit: (message: string) => void;
  send: (message: string) => void;
  subscribe: (listener: (message: string) => void) => () => void;
};

type RuntimeTransportOptions = {
  maxQueuedMessages?: number;
  maxReconnectAttempts?: number;
  now?: () => string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event | Error) => void;
  onSend?: (message: string) => void;
  reconnectDelayMs?: number;
  url?: string;
  WebSocketImpl?: typeof WebSocket;
};

function createOfflineHealthMessage(summary: string, timestamp: string) {
  return JSON.stringify({
    type: 'runtime.health.updated',
    source: 'runtime',
    timestamp,
    payload: {
      signals: [
        {
          surface: 'runtime',
          status: 'offline',
          summary,
          updatedAt: timestamp,
        },
      ],
    },
  });
}

export function createRuntimeTransport(
  options: RuntimeTransportOptions = {},
): RuntimeTransport {
  const listeners = new Set<(message: string) => void>();
  const queuedMessages: string[] = [];
  const maxQueuedMessages = options.maxQueuedMessages ?? 20;
  const maxReconnectAttempts = options.maxReconnectAttempts ?? 1;
  const reconnectDelayMs = options.reconnectDelayMs ?? 1000;
  const now = options.now ?? (() => new Date().toISOString());
  const WebSocketCtor = options.WebSocketImpl ?? globalThis.WebSocket;
  const openState = WebSocketCtor?.OPEN ?? 1;
  const connectingState = WebSocketCtor?.CONNECTING ?? 0;
  const closedState = WebSocketCtor?.CLOSED ?? 3;

  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionallyDisconnected = false;

  function broadcast(message: string) {
    for (const listener of listeners) {
      listener(message);
    }
  }

  function emitOffline(summary: string) {
    broadcast(createOfflineHealthMessage(summary, now()));
  }

  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function flushQueuedMessages() {
    if (!socket || socket.readyState !== openState) {
      return;
    }

    while (queuedMessages.length > 0) {
      const message = queuedMessages.shift();

      if (message) {
        socket.send(message);
        options.onSend?.(message);
      }
    }
  }

  function scheduleReconnect(connect: () => void) {
    if (
      intentionallyDisconnected ||
      reconnectAttempts >= maxReconnectAttempts ||
      reconnectTimer
    ) {
      return;
    }

    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelayMs);
  }

  return {
    connect() {
      if (!options.url) {
        options.onConnect?.();
        return;
      }

      if (!WebSocketCtor) {
        emitOffline('Local backend connection is unavailable in this browser.');
        return;
      }

      if (
        socket &&
        (socket.readyState === openState ||
          socket.readyState === connectingState)
      ) {
        return;
      }

      intentionallyDisconnected = false;
      socket = new WebSocketCtor(options.url);

      socket.addEventListener('open', () => {
        reconnectAttempts = 0;
        options.onConnect?.();
        flushQueuedMessages();
      });

      socket.addEventListener('message', (event) => {
        broadcast(String(event.data));
      });

      socket.addEventListener('error', (event) => {
        options.onError?.(event);
        emitOffline('Cannot connect to the local backend runtime.');
      });

      socket.addEventListener('close', () => {
        socket = null;
        options.onDisconnect?.();

        if (!intentionallyDisconnected) {
          emitOffline('Lost connection to the local backend runtime.');
          scheduleReconnect(() => this.connect());
        }
      });
    },
    disconnect() {
      intentionallyDisconnected = true;
      clearReconnectTimer();

      if (!options.url) {
        options.onDisconnect?.();
        return;
      }

      if (socket) {
        socket.close();
        socket = null;
      } else {
        options.onDisconnect?.();
      }
    },
    emit(message) {
      broadcast(message);
    },
    send(message) {
      if (!options.url) {
        options.onSend?.(message);
        return;
      }

      if (socket?.readyState === openState) {
        socket.send(message);
        options.onSend?.(message);
        return;
      }

      if (queuedMessages.length >= maxQueuedMessages) {
        queuedMessages.shift();
      }

      queuedMessages.push(message);

      if (!socket || socket.readyState === closedState) {
        this.connect();
      }
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
