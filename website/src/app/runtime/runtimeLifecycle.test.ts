import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppRuntime } from '@/app/runtime/createAppRuntime';
import type { AppRuntimeDependencies } from '@/app/runtime/createRuntimeDependencies';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import { DEMO_READY_MEASUREMENT_SNAPSHOT } from '@/mocks/runtime/runtimeFixtures';
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

function createLifecycleDependencies() {
  let runtimeListener: ((event: RuntimeInboundEvent) => void) | null = null;
  let unityListener: ((event: UnityInboundEvent) => void) | null = null;
  const runtimeSend = vi.fn<
    (command: Parameters<AppRuntimeDependencies['runtimePort']['send']>[0]) => Promise<void>
  >(() => Promise.resolve());
  const unitySend = vi.fn<
    (command: Parameters<AppRuntimeDependencies['unityPort']['send']>[0]) => Promise<void>
  >(() => Promise.resolve());
  const loadSnapshot = vi.fn(() =>
    Promise.resolve(DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT),
  );

  const deps: AppRuntimeDependencies = {
    catalogPort: {
      loadSnapshot,
    },
    runtimePort: {
      subscribe(listener) {
        runtimeListener = listener;

        return () => {
          runtimeListener = null;
        };
      },
      send: runtimeSend,
    },
    unityPort: {
      subscribe(listener) {
        unityListener = listener;

        return () => {
          unityListener = null;
        };
      },
      send: unitySend,
    },
  };

  return {
    deps,
    emitRuntime(event: RuntimeInboundEvent) {
      runtimeListener?.(event);
    },
    emitUnity(event: UnityInboundEvent) {
      unityListener?.(event);
    },
    loadSnapshot,
    runtimeSend,
    unitySend,
  };
}

async function flushEffects() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('runtime lifecycle', () => {
  beforeEach(() => {
    resetRuntimeStores();
  });

  it('sequences session start/end and selection side effects through the orchestrator', async () => {
    const { deps, runtimeSend, unitySend } = createLifecycleDependencies();
    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');

    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.session.start' }),
    );

    useCatalogStore.getState().selectGarment(
      'tailored-blazer',
      '2026-03-24T10:00:00.000Z',
    );
    useCatalogStore.getState().selectSize('M');
    useCatalogStore.getState().selectColor(
      'tailored-blazer-navy',
      'tailored-blazer-variant-navy',
    );

    expect(unitySend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectGarment' }),
    );
    expect(unitySend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectSize' }),
    );
    expect(unitySend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectColor' }),
    );
    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectGarment' }),
    );
    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectSize' }),
    );
    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.catalog.selectColor' }),
    );

    useSessionStore.getState().endSession();

    expect(useSessionStore.getState().machine.phase).toBe('idle');
    expect(runtimeSend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.session.end' }),
    );
    expect(unitySend).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shopper.session.end' }),
    );

    await runtime.stop();
  });

  it('ignores stale runtime events after reset', async () => {
    const lifecycle = createLifecycleDependencies();
    const { deps } = lifecycle;
    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');
    const machine = useSessionStore.getState().machine;
    const sessionId = 'sessionId' in machine ? machine.sessionId : null;

    useSessionStore.getState().endSession();

    expect(useSessionStore.getState().machine.phase).toBe('idle');

    if (sessionId) {
      lifecycle.emitRuntime({
        type: 'runtime.measurements.updated',
        source: 'runtime',
        timestamp: '2026-03-24T10:00:00.000Z',
        sessionId,
        payload: {
          snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
        },
      });
    }

    expect(useMeasurementsStore.getState().snapshot).toBeNull();

    await runtime.stop();
  });

  it('reuses the existing catalog snapshot path when admin requests a refresh', async () => {
    const { deps, loadSnapshot } = createLifecycleDependencies();
    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    expect(loadSnapshot).toHaveBeenCalledTimes(1);

    useAdminStore.getState().requestCatalogRefresh();

    await Promise.resolve();
    await Promise.resolve();

    expect(loadSnapshot).toHaveBeenCalledTimes(2);

    await runtime.stop();
  });

  it('marks runtime unavailable when session start or end commands fail without breaking local reset authority', async () => {
    const { deps, runtimeSend } = createLifecycleDependencies();
    runtimeSend.mockImplementation((command) => {
      if (
        command.type === 'shopper.session.start' ||
        command.type === 'shopper.session.end'
      ) {
        return Promise.reject(new Error('Runtime send failed.'));
      }

      return Promise.resolve();
    });

    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');
    await flushEffects();

    expect(useSystemHealthStore.getState().operationalStatuses.runtime).toMatchObject({
      readiness: 'unavailable',
      summary: 'Runtime start command failed to send.',
    });
    expect(useSessionStore.getState().machine.phase).toBe('detection');

    useSessionStore.getState().endSession();
    await flushEffects();

    expect(useSessionStore.getState().machine.phase).toBe('idle');
    expect(useSystemHealthStore.getState().operationalStatuses.runtime).toMatchObject({
      readiness: 'unavailable',
      summary: 'Runtime end command failed to send.',
    });

    await runtime.stop();
  });

  it('marks unity unavailable when selection or session-end sends fail without mutating shopper flow incorrectly', async () => {
    const { deps, unitySend } = createLifecycleDependencies();
    unitySend.mockImplementation((command) => {
      if (
        command.type === 'shopper.catalog.selectGarment' ||
        command.type === 'shopper.session.end'
      ) {
        return Promise.reject(new Error('Unity send failed.'));
      }

      return Promise.resolve();
    });

    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');
    useSessionStore.getState().markDetectionReady();
    useCatalogStore.getState().selectGarment(
      'tailored-blazer',
      '2026-03-24T10:00:00.000Z',
    );
    await flushEffects();

    expect(useSessionStore.getState().machine.phase).toBe('catalog');
    expect(useCatalogStore.getState().selection).toEqual(
      expect.objectContaining({ garmentId: 'tailored-blazer' }),
    );
    expect(useSystemHealthStore.getState().operationalStatuses.unity).toMatchObject({
      readiness: 'unavailable',
      summary: 'Unity garment selection failed to send.',
    });

    useSessionStore.getState().endSession();
    await flushEffects();

    expect(useSessionStore.getState().machine.phase).toBe('idle');
    expect(useSystemHealthStore.getState().operationalStatuses.unity).toMatchObject({
      readiness: 'unavailable',
      summary: 'Unity end command failed to send.',
    });

    await runtime.stop();
  });

  it('clears stale runtime guidance when recovered measurement and fit updates arrive', async () => {
    const lifecycle = createLifecycleDependencies();
    const { deps } = lifecycle;
    const runtime = createAppRuntime(
      {
        sourceMode: 'demo',
      },
      deps,
    );

    await runtime.start();

    useSessionStore.getState().startSession('keyboard');
    const machine = useSessionStore.getState().machine;
    const sessionId = 'sessionId' in machine ? machine.sessionId : 'session-demo-1';

    lifecycle.emitRuntime({
      type: 'runtime.guidance.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:00:00.000Z',
      sessionId,
      payload: {
        messages: [
          {
            id: 'guidance-runtime',
            scope: 'fit',
            tone: 'warning',
            title: 'Hold',
            body: 'Measurements are still settling.',
            createdAt: '2026-03-24T10:00:00.000Z',
          },
        ],
      },
    });

    expect(useDegradedStore.getState().guidance).toHaveLength(1);

    lifecycle.emitRuntime({
      type: 'runtime.measurements.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:01:00.000Z',
      sessionId,
      payload: {
        snapshot: DEMO_READY_MEASUREMENT_SNAPSHOT,
      },
    });
    lifecycle.emitRuntime({
      type: 'runtime.fit.updated',
      source: 'runtime',
      timestamp: '2026-03-24T10:01:00.000Z',
      sessionId,
      payload: {
        recommendation: {
          garmentId: 'tailored-blazer',
          recommendedSize: 'M',
          confidenceBand: 'high',
          confidenceScore: 0.9,
          summary: 'Ready fit.',
          reasons: ['Recovered'],
          updatedAt: '2026-03-24T10:01:00.000Z',
        },
      },
    });

    expect(useDegradedStore.getState().guidance).toEqual([]);

    await runtime.stop();
  });
});
