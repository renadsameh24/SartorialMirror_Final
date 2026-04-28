import type { UnityPort } from '@/adapters/contracts/ports';
import {
  createDemoScenarioDriver,
  type DemoScenarioDriver,
} from '@/mocks/runtime/demoScenarioDriver';

type CreateDemoUnityPortOptions = {
  driver?: DemoScenarioDriver;
};

export function createDemoUnityPort(
  options: CreateDemoUnityPortOptions = {},
): UnityPort {
  const driver = options.driver ?? createDemoScenarioDriver();

  return {
    subscribe(listener) {
      return driver.subscribeUnity(listener);
    },
    async send(command) {
      await driver.sendUnityCommand(command);
    },
  };
}
