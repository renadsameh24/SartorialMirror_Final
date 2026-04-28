import { describe, expect, it, vi } from 'vitest';

import { createIntegrationUnityPort } from '@/adapters/unity/createIntegrationUnityPort';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';

const UNITY_EVENT: UnityInboundEvent = {
  type: 'unity.render.stateUpdated',
  source: 'unity',
  timestamp: '2026-03-24T10:00:00.000Z',
  sessionId: 'session-1',
  payload: {
    renderState: 'ready',
    activeGarmentId: 'tailored-blazer',
    activeSizeCode: 'M',
  },
};

describe('createIntegrationUnityPort', () => {
  it('connects on first subscription, parses inbound messages, and disconnects after the last unsubscribe', () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const post = vi.fn();
    const parseMessage = vi.fn(() => UNITY_EVENT);
    const listeners = new Set<(message: string) => void>();

    const port = createIntegrationUnityPort({
      parseMessage,
      transport: {
        connect,
        disconnect,
        emit(message) {
          for (const listener of listeners) {
            listener(message);
          }
        },
        post,
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
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
      listener('raw-unity-message');
    }

    expect(parseMessage).toHaveBeenCalledWith('raw-unity-message');
    expect(first).toHaveBeenCalledWith(UNITY_EVENT);
    expect(second).toHaveBeenCalledWith(UNITY_EVENT);

    unsubscribeFirst();
    expect(disconnect).not.toHaveBeenCalled();

    unsubscribeSecond();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('serializes outbound commands through the transport wrapper only', async () => {
    const post = vi.fn();
    const serializeCommand = vi.fn(() => 'serialized-unity-command');
    const port = createIntegrationUnityPort({
      serializeCommand,
      transport: {
        connect() {},
        disconnect() {},
        emit() {},
        post,
        subscribe() {
          return () => undefined;
        },
      },
    });

    await port.send({
      type: 'shopper.catalog.selectGarment',
      sessionId: 'session-1',
      payload: { garmentId: 'tailored-blazer' },
    });

    expect(serializeCommand).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('serialized-unity-command');
  });
});
