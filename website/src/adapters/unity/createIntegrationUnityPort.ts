import type { UnityInboundEvent } from '@/adapters/contracts/unity';
import type { UnityPort } from '@/adapters/contracts/ports';
import {
  createUnityTransport,
  type UnityTransport,
} from '@/adapters/unity/unityTransport';

type CreateIntegrationUnityPortOptions = {
  allowedOrigin?: string;
  frameSelector?: string;
  parseMessage?: (message: string) => UnityInboundEvent;
  serializeCommand?: (command: Parameters<UnityPort['send']>[0]) => string;
  transport?: UnityTransport;
};

export function createIntegrationUnityPort(
  options: CreateIntegrationUnityPortOptions = {},
): UnityPort {
  const transport =
    options.transport ??
    createUnityTransport({
      allowedOrigin: options.allowedOrigin,
      frameSelector: options.frameSelector,
    });
  const parseMessage =
    options.parseMessage ??
    ((message: string) => JSON.parse(message) as UnityInboundEvent);
  const serializeCommand =
    options.serializeCommand ??
    ((command: Parameters<UnityPort['send']>[0]) => JSON.stringify(command));

  let subscriptionCount = 0;

  return {
    subscribe(listener) {
      if (subscriptionCount === 0) {
        transport.connect();
      }

      subscriptionCount += 1;

      const unsubscribe = transport.subscribe((message) => {
        listener(parseMessage(message));
      });

      return () => {
        unsubscribe();
        subscriptionCount -= 1;

        if (subscriptionCount === 0) {
          transport.disconnect();
        }
      };
    },
    send(command) {
      transport.post(serializeCommand(command));
      return Promise.resolve();
    },
  };
}
