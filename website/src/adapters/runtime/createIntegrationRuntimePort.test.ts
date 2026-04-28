import { describe, expect, it, vi } from 'vitest';

import { createIntegrationRuntimePort } from '@/adapters/runtime/createIntegrationRuntimePort';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';

const RUNTIME_EVENT: RuntimeInboundEvent = {
  type: 'runtime.health.updated',
  source: 'runtime',
  timestamp: '2026-03-24T10:00:00.000Z',
  payload: {
    signals: [],
  },
};

describe('createIntegrationRuntimePort', () => {
  it('connects on first subscription, parses inbound messages, and disconnects after the last unsubscribe', () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const send = vi.fn();
    const parseMessage = vi.fn(() => RUNTIME_EVENT);
    const listeners = new Set<(message: string) => void>();

    const port = createIntegrationRuntimePort({
      parseMessage,
      transport: {
        connect,
        disconnect,
        emit(message) {
          for (const listener of listeners) {
            listener(message);
          }
        },
        send,
        subscribe(nextListener) {
          listeners.add(nextListener);
          return () => {
            listeners.delete(nextListener);
          };
        },
      },
    });

    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = port.subscribe(first);
    const unsubscribeSecond = port.subscribe(second);

    expect(connect).toHaveBeenCalledTimes(1);

    for (const listener of listeners) {
      listener('raw-runtime-message');
    }

    expect(parseMessage).toHaveBeenCalledWith('raw-runtime-message');
    expect(first).toHaveBeenCalledWith(RUNTIME_EVENT);
    expect(second).toHaveBeenCalledWith(RUNTIME_EVENT);

    unsubscribeFirst();
    expect(disconnect).not.toHaveBeenCalled();

    unsubscribeSecond();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('serializes outbound commands through the transport wrapper only', async () => {
    const send = vi.fn();
    const serializeCommand = vi.fn(() => 'serialized-runtime-command');
    const port = createIntegrationRuntimePort({
      serializeCommand,
      transport: {
        connect() {},
        disconnect() {},
        emit() {},
        send,
        subscribe() {
          return () => undefined;
        },
      },
    });

    await port.send({
      type: 'shopper.session.start',
      sessionId: 'session-1',
      payload: { input: 'keyboard' },
    });

    expect(serializeCommand).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('serialized-runtime-command');
  });
});
