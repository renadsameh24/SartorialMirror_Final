import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import type { GuidanceMessage, OperationalStatus } from '@/types/system';
import { createRuntimeDependencies, type AppRuntimeDependencies } from '@/app/runtime/createRuntimeDependencies';
import type { AppRuntimeBootstrapConfig } from '@/app/runtime/runtimeConfig';
import { applyInboundEvent } from '@/lib/runtime/applyInboundEvent';
import { deriveDegradedState } from '@/lib/runtime/degradedDerivation';
import { normalizeCatalogEvent } from '@/lib/runtime/normalizeCatalogEvent';
import { normalizeRuntimeEvent } from '@/lib/runtime/normalizeRuntimeEvent';
import { normalizeUnityEvent } from '@/lib/runtime/normalizeUnityEvent';
import { shouldApplyInboundEvent } from '@/lib/runtime/staleEventGuard';
import { resetSession } from '@/lib/sessionReset/resetSession';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { useFitStore } from '@/stores/fit/fitStore';
import { useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

export type AppRuntime = {
  getSourceMode: () => AppRuntimeBootstrapConfig['sourceMode'];
  restart: (nextConfig?: Partial<AppRuntimeBootstrapConfig>) => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

function setSurfaceUnavailable(surface: OperationalStatus['surface'], summary: string) {
  useSystemHealthStore.getState().setOperationalStatus(surface, {
    surface,
    readiness: 'unavailable',
    summary,
    updatedAt: new Date().toISOString(),
  });
}

function fireAndForget(promise: Promise<void>, onError: () => void) {
  void promise.catch(() => {
    onError();
  });
}

function shouldClearRuntimeGuidance(
  event:
    | ReturnType<typeof normalizeRuntimeEvent>
    | ReturnType<typeof normalizeUnityEvent>
    | ReturnType<typeof normalizeCatalogEvent>,
) {
  return (
    event.family === 'runtime' &&
    (event.event.type === 'runtime.measurements.updated' ||
      event.event.type === 'runtime.fit.updated' ||
      event.event.type === 'runtime.scan.completed')
  );
}

function shouldRecreateDependencies(
  previous: AppRuntimeBootstrapConfig,
  next: AppRuntimeBootstrapConfig,
) {
  return (
    previous.sourceMode !== next.sourceMode ||
    previous.runtimeWsUrl !== next.runtimeWsUrl ||
    previous.catalogSnapshotUrl !== next.catalogSnapshotUrl ||
    previous.unityAllowedOrigin !== next.unityAllowedOrigin
  );
}

export function createAppRuntime(
  config: AppRuntimeBootstrapConfig,
  deps: AppRuntimeDependencies,
): AppRuntime {
  let currentConfig: AppRuntimeBootstrapConfig = {
    allowManualSwitching: false,
    manualSwitchAudience: 'dev',
    ...config,
  };
  let currentDeps = deps;
  let runtimeGuidance: GuidanceMessage[] = [];
  let started = false;
  const unsubscribers: Array<() => void> = [];

  function syncDerivedState() {
    const session = useSessionStore.getState();
    const catalog = useCatalogStore.getState();
    const measurements = useMeasurementsStore.getState();
    const fit = useFitStore.getState();
    const systemHealth = useSystemHealthStore.getState();

    const derivedState = deriveDegradedState({
      catalogStatus: catalog.status,
      fitStatus: fit.status,
      measurementsStatus: measurements.status,
      operationalStatuses: systemHealth.operationalStatuses,
      phase: session.machine.phase,
      runtimeGuidance,
    });

    useDegradedStore.getState().setIssues(derivedState.issues);
    useDegradedStore.getState().setGuidance(derivedState.guidance);
  }

  function applyNormalizedEvent(
    event:
      | ReturnType<typeof normalizeRuntimeEvent>
      | ReturnType<typeof normalizeUnityEvent>
      | ReturnType<typeof normalizeCatalogEvent>,
  ) {
    const currentMachine = useSessionStore.getState().machine;
    const activeSessionId =
      currentMachine.phase === 'idle'
        ? null
        : 'sessionId' in currentMachine
          ? currentMachine.sessionId
          : null;

    if (!shouldApplyInboundEvent(event, activeSessionId)) {
      return;
    }

    const result = applyInboundEvent(event);

    if (result.guidanceMessages) {
      runtimeGuidance = result.guidanceMessages;
    } else if (shouldClearRuntimeGuidance(event)) {
      runtimeGuidance = [];
    }

    syncDerivedState();
  }

  async function loadCatalogSnapshot() {
    try {
      const snapshotEvent = await currentDeps.catalogPort.loadSnapshot();
      applyNormalizedEvent(normalizeCatalogEvent(snapshotEvent));
    } catch {
      const unavailableEvent: Extract<
        CatalogInboundEvent,
        { type: 'catalog.snapshot.unavailable' }
      > = {
        type: 'catalog.snapshot.unavailable',
        source: 'catalog',
        timestamp: new Date().toISOString(),
        payload: {
          status: 'unavailable',
        },
      };

      applyNormalizedEvent(normalizeCatalogEvent(unavailableEvent));
    }
  }

  function subscribeToInboundEvents() {
    unsubscribers.push(
      currentDeps.runtimePort.subscribe((event) => {
        applyNormalizedEvent(normalizeRuntimeEvent(event));
      }),
    );

    unsubscribers.push(
      currentDeps.unityPort.subscribe((event) => {
        applyNormalizedEvent(normalizeUnityEvent(event));
      }),
    );

    if (currentDeps.catalogPort.subscribe) {
      unsubscribers.push(
        currentDeps.catalogPort.subscribe((event) => {
          applyNormalizedEvent(normalizeCatalogEvent(event));
        }),
      );
    }
  }

  function subscribeToLocalState() {
    unsubscribers.push(
      useAdminStore.subscribe((state, previousState) => {
        if (
          state.intents.healthRefreshToken !== previousState.intents.healthRefreshToken
        ) {
          fireAndForget(
            currentDeps.runtimePort.send({
              type: 'admin.health.refresh',
              payload: {},
            }),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Admin health refresh failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (state.intents.logsRefreshToken !== previousState.intents.logsRefreshToken) {
          fireAndForget(
            currentDeps.runtimePort.send({
              type: 'admin.logs.refresh',
              payload: {},
            }),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Admin logs refresh failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (
          state.intents.calibrationStartToken !== previousState.intents.calibrationStartToken
        ) {
          fireAndForget(
            currentDeps.runtimePort.send({
              type: 'admin.calibration.start',
              payload: {
                profileId: state.intents.requestedCalibrationProfileId,
              },
            }),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Calibration start failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (
          state.intents.calibrationCancelToken !== previousState.intents.calibrationCancelToken
        ) {
          fireAndForget(
            currentDeps.runtimePort.send({
              type: 'admin.calibration.cancel',
              payload: {},
            }),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Calibration cancel failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (
          state.intents.catalogRefreshToken !== previousState.intents.catalogRefreshToken
        ) {
          fireAndForget(loadCatalogSnapshot(), () => {
            setSurfaceUnavailable(
              'catalog',
              'Catalog snapshot refresh failed.',
            );
            syncDerivedState();
          });
        }
      }),
    );

    unsubscribers.push(
      useSessionStore.subscribe((state, previousState) => {
        const previousPhase = previousState.machine.phase;
        const nextPhase = state.machine.phase;

        if (previousPhase !== 'detection' && nextPhase === 'detection') {
          const sessionId =
            'sessionId' in state.machine ? state.machine.sessionId : undefined;

          if (sessionId) {
            fireAndForget(
              currentDeps.runtimePort.send({
                type: 'shopper.session.start',
                sessionId,
                payload: {
                  input: state.lastInputMethod ?? 'keyboard',
                },
              }),
              () => {
                setSurfaceUnavailable(
                  'runtime',
                  'Runtime start command failed to send.',
                );
                syncDerivedState();
              },
            );
          }
        }

        if (previousPhase !== 'sessionEnd' && nextPhase === 'sessionEnd') {
          const sessionId =
            'sessionId' in state.machine ? state.machine.sessionId : undefined;

          if (sessionId) {
            const command = {
              type: 'shopper.session.end' as const,
              sessionId,
              payload: {
                reason: 'userRequested' as const,
              },
            };

            fireAndForget(currentDeps.runtimePort.send(command), () => {
              setSurfaceUnavailable(
                'runtime',
                'Runtime end command failed to send.',
              );
              syncDerivedState();
            });

            fireAndForget(currentDeps.unityPort.send(command), () => {
              setSurfaceUnavailable(
                'unity',
                'Unity end command failed to send.',
              );
              syncDerivedState();
            });
          }

          runtimeGuidance = [];
          resetSession();
          syncDerivedState();
        }
      }),
    );

    unsubscribers.push(
      useCatalogStore.subscribe((state, previousState) => {
        const sessionMachine = useSessionStore.getState().machine;
        const sessionId =
          'sessionId' in sessionMachine ? sessionMachine.sessionId : undefined;

        if (!sessionId) {
          return;
        }

        if (
          state.selection?.garmentId &&
          state.selection.garmentId !== previousState.selection?.garmentId
        ) {
          const command = {
              type: 'shopper.catalog.selectGarment',
              sessionId,
              payload: {
                garmentId: state.selection.garmentId,
              },
            } as const;

          fireAndForget(
            currentDeps.runtimePort.send(command),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Runtime garment selection failed to send.',
              );
              syncDerivedState();
            },
          );

          fireAndForget(
            currentDeps.unityPort.send(command),
            () => {
              setSurfaceUnavailable(
                'unity',
                'Unity garment selection failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (
          state.selection?.sizeCode &&
          state.selection.sizeCode !== previousState.selection?.sizeCode
        ) {
          const command = {
              type: 'shopper.catalog.selectSize',
              sessionId,
              payload: {
                sizeCode: state.selection.sizeCode,
              },
            } as const;

          fireAndForget(
            currentDeps.runtimePort.send(command),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Runtime size selection failed to send.',
              );
              syncDerivedState();
            },
          );

          fireAndForget(
            currentDeps.unityPort.send(command),
            () => {
              setSurfaceUnavailable(
                'unity',
                'Unity size selection failed to send.',
              );
              syncDerivedState();
            },
          );
        }

        if (
          state.selection?.colorId &&
          state.selection.colorId !== previousState.selection?.colorId
        ) {
          const command = {
              type: 'shopper.catalog.selectColor',
              sessionId,
              payload: {
                colorId: state.selection.colorId,
                variantId: state.selection.variantId,
              },
            } as const;

          fireAndForget(
            currentDeps.runtimePort.send(command),
            () => {
              setSurfaceUnavailable(
                'runtime',
                'Runtime color selection failed to send.',
              );
              syncDerivedState();
            },
          );

          fireAndForget(
            currentDeps.unityPort.send(command),
            () => {
              setSurfaceUnavailable(
                'unity',
                'Unity color selection failed to send.',
              );
              syncDerivedState();
            },
          );
        }
      }),
    );
  }

  async function start() {
    if (started) {
      return;
    }

    started = true;
    subscribeToInboundEvents();
    subscribeToLocalState();
    await loadCatalogSnapshot();
    syncDerivedState();
  }

  function stop() {
    while (unsubscribers.length > 0) {
      const unsubscribe = unsubscribers.pop();
      unsubscribe?.();
    }

    runtimeGuidance = [];
    started = false;

    return Promise.resolve();
  }

  return {
    getSourceMode() {
      return currentConfig.sourceMode;
    },
    async restart(nextConfig = {}) {
      const nextResolvedConfig = {
        ...currentConfig,
        ...nextConfig,
      };

      await stop();

      if (shouldRecreateDependencies(currentConfig, nextResolvedConfig)) {
        currentDeps = createRuntimeDependencies(nextResolvedConfig);
      }

      currentConfig = nextResolvedConfig;
      await start();
    },
    start,
    stop,
  };
}
