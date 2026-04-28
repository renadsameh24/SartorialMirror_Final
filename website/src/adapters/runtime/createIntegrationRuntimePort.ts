import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { RuntimePort } from '@/adapters/contracts/ports';
import {
  createRuntimeTransport,
  type RuntimeTransport,
} from '@/adapters/runtime/runtimeTransport';

type CreateIntegrationRuntimePortOptions = {
  parseMessage?: (message: string) => RuntimeInboundEvent;
  serializeCommand?: (command: Parameters<RuntimePort['send']>[0]) => string;
  transport?: RuntimeTransport;
  url?: string;
};

export function createIntegrationRuntimePort(
  options: CreateIntegrationRuntimePortOptions = {},
): RuntimePort {
  const transport = options.transport ?? createRuntimeTransport({ url: options.url });
  const parseMessage =
    options.parseMessage ??
    ((message: string) => JSON.parse(message) as RuntimeInboundEvent);
  const serializeCommand =
    options.serializeCommand ??
    ((command: Parameters<RuntimePort['send']>[0]) => JSON.stringify(command));

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
      transport.send(serializeCommand(command));
      return Promise.resolve();
    },
  };
}
