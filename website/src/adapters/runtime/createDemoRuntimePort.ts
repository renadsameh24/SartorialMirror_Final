import type { RuntimePort } from '@/adapters/contracts/ports';
import {
  createDemoScenarioDriver,
  type DemoScenarioDriver,
} from '@/mocks/runtime/demoScenarioDriver';

type CreateDemoRuntimePortOptions = {
  driver?: DemoScenarioDriver;
};

export function createDemoRuntimePort(
  options: CreateDemoRuntimePortOptions = {},
): RuntimePort {
  const driver = options.driver ?? createDemoScenarioDriver();

  return {
    subscribe(listener) {
      return driver.subscribeRuntime(listener);
    },
    async send(command) {
      await driver.sendRuntimeCommand(command);
    },
  };
}
