import { expectTypeOf, describe, it } from 'vitest';

import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import type { AdminCommand, ShopperCommand } from '@/adapters/contracts/commands';
import type { CatalogPort, RuntimePort, UnityPort } from '@/adapters/contracts/ports';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { InboundEventEnvelope } from '@/adapters/contracts/shared';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';

describe('adapter contract types', () => {
  it('uses the shared inbound envelope fields across source-specific events', () => {
    expectTypeOf<RuntimeInboundEvent>().toMatchTypeOf<
      InboundEventEnvelope<string, 'runtime', unknown>
    >();
    expectTypeOf<UnityInboundEvent>().toMatchTypeOf<
      InboundEventEnvelope<string, 'unity', unknown>
    >();
    expectTypeOf<CatalogInboundEvent>().toMatchTypeOf<
      InboundEventEnvelope<string, 'catalog', unknown>
    >();
  });

  it('keeps the locked port and command subsets intact', () => {
    expectTypeOf<Parameters<RuntimePort['send']>[0]>().toMatchTypeOf<
      Extract<
        ShopperCommand | AdminCommand,
        | { type: 'shopper.session.start' }
        | { type: 'shopper.session.end' }
        | { type: 'shopper.catalog.selectGarment' }
        | { type: 'shopper.catalog.selectSize' }
        | { type: 'shopper.catalog.selectColor' }
        | { type: 'admin.calibration.start' }
        | { type: 'admin.calibration.cancel' }
        | { type: 'admin.health.refresh' }
        | { type: 'admin.logs.refresh' }
      >
    >();

    expectTypeOf<Parameters<UnityPort['send']>[0]>().toMatchTypeOf<
      Extract<
        ShopperCommand,
        | { type: 'shopper.catalog.selectGarment' }
        | { type: 'shopper.catalog.selectSize' }
        | { type: 'shopper.catalog.selectColor' }
        | { type: 'shopper.session.end' }
      >
    >();

    expectTypeOf<CatalogPort['subscribe']>().toEqualTypeOf<
      | ((listener: (event: CatalogInboundEvent) => void) => () => void)
      | undefined
    >();
  });
});
