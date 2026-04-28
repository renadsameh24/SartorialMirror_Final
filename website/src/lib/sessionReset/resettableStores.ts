import { useCatalogStore } from '@/stores/catalog/catalogStore';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { useFitStore } from '@/stores/fit/fitStore';
import { useMeasurementsStore } from '@/stores/measurements/measurementsStore';
import { useSessionStore } from '@/stores/session/sessionStore';

export const SHOPPER_RESET_ORDER = [
  'degraded',
  'fit',
  'measurements',
  'catalog',
  'session',
] as const;

export type ShopperResetTarget = (typeof SHOPPER_RESET_ORDER)[number];

export const shopperResetHandlers: Record<ShopperResetTarget, () => void> = {
  degraded: () => useDegradedStore.getState().resetSessionState(),
  fit: () => useFitStore.getState().resetSessionState(),
  measurements: () => useMeasurementsStore.getState().resetSessionState(),
  catalog: () => useCatalogStore.getState().resetSessionState(),
  session: () => useSessionStore.getState().completeReset(),
};
