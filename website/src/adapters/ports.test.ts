import { describe, expect, it } from 'vitest';

import { createDemoCatalogPort } from '@/adapters/catalog/createDemoCatalogPort';
import { createDemoRuntimePort } from '@/adapters/runtime/createDemoRuntimePort';
import { createDemoUnityPort } from '@/adapters/unity/createDemoUnityPort';
import { DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT } from '@/mocks/catalog/catalogFixtures';
import { createDemoScenarioDriver } from '@/mocks/runtime/demoScenarioDriver';

describe('demo port implementations', () => {
  it('returns the required catalog snapshot through loadSnapshot()', async () => {
    const catalogPort = createDemoCatalogPort();

    await expect(catalogPort.loadSnapshot()).resolves.toEqual(
      DEMO_CATALOG_SNAPSHOT_UPDATED_EVENT,
    );
    expect(Object.hasOwn(catalogPort, 'subscribe')).toBe(false);
  });

  it('emits normalized runtime and Unity events through the demo driver', async () => {
    const driver = createDemoScenarioDriver();
    const runtimePort = createDemoRuntimePort({ driver });
    const unityPort = createDemoUnityPort({ driver });
    const runtimeEvents: string[] = [];
    const unityEvents: string[] = [];

    const unsubscribeRuntime = runtimePort.subscribe((event) => {
      runtimeEvents.push(event.type);
    });
    const unsubscribeUnity = unityPort.subscribe((event) => {
      unityEvents.push(event.type);
    });

    await runtimePort.send({
      type: 'shopper.session.start',
      sessionId: 'session-demo-1',
      payload: {
        input: 'keyboard',
      },
    });

    await unityPort.send({
      type: 'shopper.catalog.selectGarment',
      sessionId: 'session-demo-1',
      payload: {
        garmentId: 'tailored-blazer',
      },
    });

    await unityPort.send({
      type: 'shopper.catalog.selectColor',
      sessionId: 'session-demo-1',
      payload: {
        colorId: 'tailored-blazer-navy',
        variantId: 'tailored-blazer-variant-navy',
      },
    });

    expect(runtimeEvents).toEqual(
      expect.arrayContaining([
        'runtime.health.updated',
        'runtime.user.detected',
        'runtime.scan.completed',
        'runtime.measurements.updated',
        'runtime.fit.updated',
        'runtime.guidance.updated',
      ]),
    );
    expect(unityEvents).toEqual(
      expect.arrayContaining([
        'unity.frame.updated',
        'unity.render.stateUpdated',
      ]),
    );

    unsubscribeRuntime();
    unsubscribeUnity();
  });
});
