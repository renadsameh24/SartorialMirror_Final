import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCameraFrameRelay } from '@/adapters/camera/cameraFrameRelay';

describe('cameraFrameRelay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens a camera uplink socket, sends start and frame envelopes, then sends stop', async () => {
    vi.useFakeTimers();

    class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 3;

      static instances: MockWebSocket[] = [];

      listeners = new Map<string, Array<() => void>>();
      readyState = MockWebSocket.CONNECTING;
      sent: string[] = [];

      constructor(public url: string) {
        MockWebSocket.instances.push(this);
      }

      addEventListener(type: string, listener: () => void) {
        this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
      }

      removeEventListener(type: string, listener: () => void) {
        this.listeners.set(
          type,
          (this.listeners.get(type) ?? []).filter((item) => item !== listener),
        );
      }

      send(message: string) {
        this.sent.push(message);
      }

      close() {
        this.readyState = MockWebSocket.CLOSED;
        this.dispatch('close');
      }

      dispatch(type: string) {
        for (const listener of this.listeners.get(type) ?? []) {
          listener();
        }
      }

      open() {
        this.readyState = MockWebSocket.OPEN;
        this.dispatch('open');
      }
    }

    const drawImage = vi.fn();
    const fakeCanvas = {
      getContext: vi.fn(() => ({ drawImage })),
      height: 0,
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,frame-data'),
      width: 0,
    };
    const fakeVideo = {
      addEventListener: vi.fn(),
      autoplay: false,
      muted: false,
      play: vi.fn(() => Promise.resolve()),
      playsInline: false,
      readyState: 2,
      removeEventListener: vi.fn(),
      srcObject: null,
      videoHeight: 720,
      videoWidth: 1280,
    };
    const statuses: string[] = [];
    const relay = createCameraFrameRelay({
      documentRef: {
        createElement: vi.fn((tag: string) =>
          tag === 'video' ? fakeVideo : fakeCanvas,
        ) as unknown as Document['createElement'],
      },
      frameIntervalMs: 200,
      now: () => '2026-04-21T12:00:00.000Z',
      onStateChange: (status) => {
        statuses.push(status);
      },
      url: 'ws://127.0.0.1:8000/ws/camera',
      WebSocketImpl: MockWebSocket as unknown as typeof WebSocket,
    });

    const startPromise = relay.start({
      sessionId: 'session-123',
      stream: {
        getTracks: () => [],
      } as unknown as MediaStream,
    });

    const socket = MockWebSocket.instances[0]!;
    expect(socket.url).toBe('ws://127.0.0.1:8000/ws/camera');

    socket.open();
    await startPromise;

    vi.advanceTimersByTime(200);

    expect(statuses).toContain('connecting');
    expect(statuses).toContain('streaming');
    expect(JSON.parse(socket.sent[0] ?? '{}')).toMatchObject({
      type: 'camera.stream.started',
      sessionId: 'session-123',
    });
    expect(JSON.parse(socket.sent[1] ?? '{}')).toMatchObject({
      type: 'camera.frame.captured',
      sessionId: 'session-123',
      payload: {
        dataUrl: 'data:image/jpeg;base64,frame-data',
        width: 960,
      },
    });

    relay.stop();

    expect(JSON.parse(socket.sent[2] ?? '{}')).toMatchObject({
      type: 'camera.stream.stopped',
      sessionId: 'session-123',
    });
  });

  it('fails cleanly when the camera uplink url is missing', async () => {
    const relay = createCameraFrameRelay();

    await expect(
      relay.start({
        stream: {
          getTracks: () => [],
        } as unknown as MediaStream,
      }),
    ).rejects.toThrow(/uplink url is missing/i);
  });
});
