import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppRuntime } from '@/app/runtime/createAppRuntime';
import {
  DEFAULT_CAMERA_UPLINK_WS_URL,
  DEFAULT_CATALOG_SNAPSHOT_URL,
  DEFAULT_RUNTIME_WS_URL,
  DEFAULT_UNITY_ALLOWED_ORIGIN,
  DEFAULT_UNITY_WEBGL_URL,
  resolveRuntimeConfig,
} from '@/app/runtime/runtimeConfig';
import type { AppRuntimeDependencies } from '@/app/runtime/createRuntimeDependencies';
import {
  DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT,
} from '@/mocks/catalog/catalogFixtures';
import { createInitialAdminState, useAdminStore } from '@/stores/admin/adminStore';
import { createInitialCatalogState, useCatalogStore } from '@/stores/catalog/catalogStore';
import { createInitialDegradedState, useDegradedStore } from '@/stores/degraded/degradedStore';
import { createInitialFitState, useFitStore } from '@/stores/fit/fitStore';
import { createInitialMeasurementsState, useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { createInitialSessionState, useSessionStore } from '@/stores/session/sessionStore';
import { createInitialSystemHealthState, useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

function resetRuntimeStores() {
  useAdminStore.setState(createInitialAdminState());
  useSessionStore.setState(createInitialSessionState());
  useCatalogStore.setState(createInitialCatalogState());
  useMeasurementsStore.setState(createInitialMeasurementsState());
  useFitStore.setState(createInitialFitState());
  useSystemHealthStore.setState(createInitialSystemHealthState());
  useDegradedStore.setState(createInitialDegradedState());
}

function createTestDependencies() {
  const runtimeUnsubscribe = vi.fn();
  const unityUnsubscribe = vi.fn();
  const runtimeSubscribe = vi.fn(() => runtimeUnsubscribe);
  const unitySubscribe = vi.fn(() => unityUnsubscribe);
  const runtimeSend = vi.fn(() => Promise.resolve());
  const unitySend = vi.fn(() => Promise.resolve());
  const loadSnapshot = vi.fn(() =>
    Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
  );

  const deps: AppRuntimeDependencies = {
    catalogPort: {
      loadSnapshot,
    },
    runtimePort: {
      subscribe: runtimeSubscribe,
      send: runtimeSend,
    },
    unityPort: {
      subscribe: unitySubscribe,
      send: unitySend,
    },
  };

  return {
    deps,
    loadSnapshot,
    runtimeSend,
    runtimeSubscribe,
    runtimeUnsubscribe,
    unitySend,
    unitySubscribe,
    unityUnsubscribe,
  };
}

function createHistoricalListenerDependencies() {
  const runtimeListeners: Array<(event: Parameters<AppRuntimeDependencies['runtimePort']['subscribe']>[0] extends (event: infer T) => void ? T : never) => void> = [];
  const unityListeners: Array<(event: Parameters<AppRuntimeDependencies['unityPort']['subscribe']>[0] extends (event: infer T) => void ? T : never) => void> = [];

  const deps: AppRuntimeDependencies = {
    catalogPort: {
      loadSnapshot: vi.fn(() =>
        Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
      ),
    },
    runtimePort: {
      subscribe(listener) {
        runtimeListeners.push(listener);
        return () => undefined;
      },
      send: vi.fn(() => Promise.resolve()),
    },
    unityPort: {
      subscribe(listener) {
        unityListeners.push(listener);
        return () => undefined;
      },
      send: vi.fn(() => Promise.resolve()),
    },
  };

  return {
    deps,
    runtimeListeners,
    unityListeners,
  };
}

describe('createAppRuntime', () => {
  beforeEach(() => {
    resetRuntimeStores();
  });

  it('resolves runtime config from bootstrap env with manual switching disabled by default', () => {
    expect(resolveRuntimeConfig({})).toEqual({
      allowManualSwitching: false,
      cameraUplinkEnabled: false,
      cameraUplinkWsUrl: DEFAULT_CAMERA_UPLINK_WS_URL,
      cameraPreviewEnabled: false,
      catalogSnapshotUrl: DEFAULT_CATALOG_SNAPSHOT_URL,
      manualSwitchAudience: 'dev',
      runtimeWsUrl: DEFAULT_RUNTIME_WS_URL,
      sourceMode: 'demo',
      unityAllowedOrigin: DEFAULT_UNITY_ALLOWED_ORIGIN,
      unityWebglUrl: DEFAULT_UNITY_WEBGL_URL,
    });

    expect(
      resolveRuntimeConfig({
        VITE_CAMERA_UPLINK_ENABLED: 'true',
        VITE_CAMERA_UPLINK_WS_URL: 'ws://localhost:8000/custom/camera',
        VITE_CAMERA_PREVIEW_ENABLED: 'true',
        VITE_CATALOG_SNAPSHOT_URL: 'http://localhost:8000/custom/catalog',
        DEV: true,
        VITE_RUNTIME_ALLOW_MANUAL_SWITCHING: 'true',
        VITE_RUNTIME_MANUAL_SWITCH_AUDIENCE: 'admin',
        VITE_RUNTIME_SOURCE_MODE: 'integration',
        VITE_RUNTIME_WS_URL: 'ws://localhost:8000/custom/runtime',
        VITE_UNITY_ALLOWED_ORIGIN: 'http://localhost:9000',
        VITE_UNITY_WEBGL_URL: 'http://localhost:9000/unity/',
      }),
    ).toEqual({
      allowManualSwitching: true,
      cameraUplinkEnabled: true,
      cameraUplinkWsUrl: 'ws://localhost:8000/custom/camera',
      cameraPreviewEnabled: true,
      catalogSnapshotUrl: 'http://localhost:8000/custom/catalog',
      manualSwitchAudience: 'admin',
      runtimeWsUrl: 'ws://localhost:8000/custom/runtime',
      sourceMode: 'integration',
      unityAllowedOrigin: 'http://localhost:9000',
      unityWebglUrl: 'http://localhost:9000/unity/',
    });
  });

  it('starts only once and tears subscriptions down on stop', async () => {
    const {
      deps,
      loadSnapshot,
      runtimeSubscribe,
      runtimeUnsubscribe,
      unitySubscribe,
      unityUnsubscribe,
    } = createTestDependencies();

    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();
    await runtime.start();

    expect(runtime.getSourceMode()).toBe('demo');
    expect(loadSnapshot).toHaveBeenCalledTimes(1);
    expect(runtimeSubscribe).toHaveBeenCalledTimes(1);
    expect(unitySubscribe).toHaveBeenCalledTimes(1);

    await runtime.stop();

    expect(runtimeUnsubscribe).toHaveBeenCalledTimes(1);
    expect(unityUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('restarts without leaking subscriptions or duplicating snapshot loads', async () => {
    const {
      deps,
      loadSnapshot,
      runtimeSubscribe,
      runtimeUnsubscribe,
      unitySubscribe,
      unityUnsubscribe,
    } = createTestDependencies();

    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();
    await runtime.restart();

    expect(loadSnapshot).toHaveBeenCalledTimes(2);
    expect(runtimeSubscribe).toHaveBeenCalledTimes(2);
    expect(unitySubscribe).toHaveBeenCalledTimes(2);
    expect(runtimeUnsubscribe).toHaveBeenCalledTimes(1);
    expect(unityUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('rejects leaked stale session listeners after restart while still accepting app-scoped events', async () => {
    const { deps, runtimeListeners } = createHistoricalListenerDependencies();
    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');
    const startedMachine = useSessionStore.getState().machine;
    const previousSessionId =
      'sessionId' in startedMachine ? startedMachine.sessionId : null;

    const oldRuntimeListener = runtimeListeners[0];
    expect(oldRuntimeListener).toBeDefined();

    useSessionStore.getState().endSession();
    await runtime.restart();

    oldRuntimeListener?.({
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:01:00.000Z',
      sessionId: previousSessionId ?? 'session-old',
      payload: {
        snapshot: {
          status: 'ready',
          lastUpdatedAt: '2026-03-24T10:01:00.000Z',
          samples: [],
        },
      },
    });

    expect(useMeasurementsStore.getState().snapshot).toBeNull();

    oldRuntimeListener?.({
      type: 'runtime.health.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:01:00.000Z',
      payload: {
        signals: [],
      },
    });

    expect(useSystemHealthStore.getState().signals).toEqual([]);
  });
});
