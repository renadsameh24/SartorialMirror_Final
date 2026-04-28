import type { CatalogInboundEvent } from '@/adapters/contracts/catalog';
import type { AdminCommand, ShopperCommand } from '@/adapters/contracts/commands';
import type { RuntimeInboundEvent } from '@/adapters/contracts/runtime';
import type { UnityInboundEvent } from '@/adapters/contracts/unity';

type RuntimeCommand = Extract<
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
>;

type UnityCommand = Extract<
  ShopperCommand,
  | { type: 'shopper.catalog.selectGarment' }
  | { type: 'shopper.catalog.selectSize' }
  | { type: 'shopper.catalog.selectColor' }
  | { type: 'shopper.session.end' }
>;

export interface RuntimePort {
  subscribe(listener: (event: RuntimeInboundEvent) => void): () => void;
  send(command: RuntimeCommand): Promise<void>;
}

export interface UnityPort {
  subscribe(listener: (event: UnityInboundEvent) => void): () => void;
  send(command: UnityCommand): Promise<void>;
}

export interface CatalogPort {
  loadSnapshot(): Promise<
    Extract<CatalogInboundEvent, { type: 'catalog.snapshot.updated' }>
  >;
  subscribe?(listener: (event: CatalogInboundEvent) => void): () => void;
}
