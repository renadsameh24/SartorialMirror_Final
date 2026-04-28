import { describe, expect, it, vi } from 'vitest';

import { createUnityTransport } from '@/adapters/unity/unityTransport';

describe('unityTransport', () => {
  it('subscribes, unsubscribes, and forwards outbound posts', () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const onPost = vi.fn();
    const transport = createUnityTransport({
      onConnect,
      onDisconnect,
      onPost,
    });
    const listener = vi.fn();

    const unsubscribe = transport.subscribe(listener);

    transport.connect();
    transport.emit('unity-message');
    transport.post('unity-command');
    unsubscribe();
    transport.emit('unity-message-2');
    transport.disconnect();

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('unity-message');
    expect(onPost).toHaveBeenCalledWith('unity-command');
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('posts to the configured Unity origin and ignores messages from other origins', () => {
    const postMessage = vi.fn();
    const targetWindow = { postMessage } as unknown as Window;
    const listener = vi.fn();
    const transport = createUnityTransport({
      allowedOrigin: 'http://127.0.0.1:8080',
      targetWindow,
      windowRef: window,
    });

    const unsubscribe = transport.subscribe(listener);

    transport.connect();
    transport.post('unity-command');

    expect(postMessage).toHaveBeenCalledWith(
      'unity-command',
      'http://127.0.0.1:8080',
    );

    window.dispatchEvent(
      new MessageEvent('message', {
        data: 'ignored',
        origin: 'http://unexpected.local',
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'unity.frame.updated' },
        origin: 'http://127.0.0.1:8080',
      }),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      JSON.stringify({ type: 'unity.frame.updated' }),
    );

    unsubscribe();
    transport.disconnect();
  });
});
