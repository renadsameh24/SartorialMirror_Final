import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRuntimeTransport } from '@/adapters/runtime/runtimeTransport';

describe('runtimeTransport', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('subscribes, unsubscribes, and forwards outbound messages', () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const onSend = vi.fn();
    const transport = createRuntimeTransport({
      onConnect,
      onDisconnect,
      onSend,
    });
    const listener = vi.fn();

    const unsubscribe = transport.subscribe(listener);

    transport.connect();
    transport.emit('runtime-message');
    transport.send('runtime-command');
    unsubscribe();
    transport.emit('runtime-message-2');
    transport.disconnect();

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('runtime-message');
    expect(onSend).toHaveBeenCalledWith('runtime-command');
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('connects to WebSocket, flushes queued sends, emits messages, and reconnects after close', () => {
    vi.useFakeTimers();

    class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 3;

      static instances: MockWebSocket[] = [];

      listeners = new Map<string, Array<(event: { data?: string }) => void>>();
      readyState = MockWebSocket.CONNECTING;
      sent: string[] = [];
      url: string;

      constructor(url: string) {
        this.url = url;
        MockWebSocket.instances.push(this);
      }

      addEventListener(type: string, listener: (event: { data?: string }) => void) {
        this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
      }

      send(message: string) {
        this.sent.push(message);
      }

      close() {
        this.readyState = MockWebSocket.CLOSED;
        this.dispatch('close');
      }

      dispatch(type: string, event: { data?: string } = {}) {
        for (const listener of this.listeners.get(type) ?? []) {
          listener(event);
        }
      }

      open() {
        this.readyState = MockWebSocket.OPEN;
        this.dispatch('open');
      }

      receive(data: string) {
        this.dispatch('message', { data });
      }
    }

    const listener = vi.fn();
    const transport = createRuntimeTransport({
      now: () => '2026-03-24T10:00:00.000Z',
      reconnectDelayMs: 25,
      url: 'ws://127.0.0.1:8000/ws/runtime',
      WebSocketImpl: MockWebSocket as unknown as typeof WebSocket,
    });

    transport.subscribe(listener);
    transport.connect();
    transport.send('queued-command');

    const firstSocket = MockWebSocket.instances[0]!;
    expect(firstSocket.url).toBe('ws://127.0.0.1:8000/ws/runtime');
    expect(firstSocket.sent).toEqual([]);

    firstSocket.open();
    expect(firstSocket.sent).toEqual(['queued-command']);

    firstSocket.receive('runtime-message');
    expect(listener).toHaveBeenCalledWith('runtime-message');

    firstSocket.close();
    expect(listener).toHaveBeenCalledWith(
      expect.stringContaining('Lost connection to the local backend runtime.'),
    );

    vi.advanceTimersByTime(25);
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});
