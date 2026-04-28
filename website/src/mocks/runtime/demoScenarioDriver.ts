import type { RuntimePort, UnityPort } from '@/adapters/contracts/ports';
import type { SessionId } from '@/types/shared';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';
import {
  createDemoRuntimeLostEvent,
  createDemoRuntimePartialEvents,
  createDemoRuntimeStartEvents,
} from '@/mocks/runtime/runtimeFixtures';
import {
  DEMO_IDLE_UNITY_EVENT,
  createUnityDelayedEvent,
  createUnityRenderSequence,
} from '@/mocks/unity/unityFixtures';

type RuntimeCommand = Parameters<RuntimePort['send']>[0];
type UnityCommand = Parameters<UnityPort['send']>[0];

export type DemoScenarioDriver = {
  subscribeRuntime: (listener: (event: RuntimeInboundEvent) => void) => () => void;
  subscribeUnity: (listener: (event: UnityInboundEvent) => void) => () => void;
  sendRuntimeCommand: (command: RuntimeCommand) => Promise<void>;
  sendUnityCommand: (command: UnityCommand) => Promise<void>;
};

function broadcast<Event>(
  listeners: Set<(event: Event) => void>,
  events: Event | Event[],
) {
  const eventList = Array.isArray(events) ? events : [events];

  for (const event of eventList) {
    for (const listener of listeners) {
      listener(event);
    }
  }
}

export function createDemoScenarioDriver(): DemoScenarioDriver {
  const runtimeListeners = new Set<(event: RuntimeInboundEvent) => void>();
  const unityListeners = new Set<(event: UnityInboundEvent) => void>();

  let activeSessionId: SessionId | null = null;
  let activeGarmentId: string | undefined;
  let activeSizeCode: string | undefined;

  return {
    subscribeRuntime: (listener) => {
      runtimeListeners.add(listener);

      return () => {
        runtimeListeners.delete(listener);
      };
    },
    subscribeUnity: (listener) => {
      unityListeners.add(listener);
      listener(DEMO_IDLE_UNITY_EVENT);

      return () => {
        unityListeners.delete(listener);
      };
    },
    sendRuntimeCommand: (command) => {
      switch (command.type) {
        case 'shopper.session.start':
          if (!command.sessionId) {
            return Promise.resolve();
          }

          activeSessionId = command.sessionId;
          broadcast(runtimeListeners, createDemoRuntimeStartEvents(activeSessionId));
          return Promise.resolve();

        case 'shopper.session.end':
          if (activeSessionId) {
            broadcast(runtimeListeners, createDemoRuntimeLostEvent(activeSessionId));
          }
          activeSessionId = null;
          activeGarmentId = undefined;
          activeSizeCode = undefined;
          return Promise.resolve();

        default:
          return Promise.resolve();
      }
    },
    sendUnityCommand: (command) => {
      if (command.type === 'shopper.session.end') {
        activeGarmentId = undefined;
        activeSizeCode = undefined;
        broadcast(unityListeners, DEMO_IDLE_UNITY_EVENT);
        return Promise.resolve();
      }

      if (!command.sessionId) {
        return Promise.resolve();
      }

      if (command.type === 'shopper.catalog.selectGarment') {
        activeGarmentId = command.payload.garmentId;
      }

      if (command.type === 'shopper.catalog.selectSize') {
        activeSizeCode = command.payload.sizeCode;
      }

      broadcast(
        unityListeners,
        createUnityRenderSequence(
          command.sessionId,
          activeGarmentId,
          activeSizeCode,
        ),
      );

      if (command.type === 'shopper.catalog.selectColor' && activeSessionId) {
        broadcast(
          runtimeListeners,
          createDemoRuntimePartialEvents(activeSessionId),
        );
      }

      if (command.type === 'shopper.catalog.selectSize') {
        broadcast(
          unityListeners,
          createUnityDelayedEvent(command.sessionId, activeGarmentId, activeSizeCode),
        );
      }

      return Promise.resolve();
    },
  };
}
