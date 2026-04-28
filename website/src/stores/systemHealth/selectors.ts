import type { HealthStatus, SystemSurface } from '@/types/system';
import type { SystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

const healthRank: Record<HealthStatus, number> = {
  healthy: 0,
  warning: 1,
  degraded: 2,
  offline: 3,
};

export function selectHealthSignals(state: SystemHealthStore) {
  return state.signals;
}

export function selectOperationalStatuses(state: SystemHealthStore) {
  return state.operationalStatuses;
}

export function selectOperationalStatus(
  state: SystemHealthStore,
  surface: SystemSurface,
) {
  return state.operationalStatuses[surface] ?? null;
}

export function selectWorstSystemStatus(state: SystemHealthStore) {
  const [firstSignal, ...remainingSignals] = state.signals;

  if (!firstSignal) {
    return null;
  }

  return remainingSignals.reduce(
    (currentWorst, signal) =>
      healthRank[signal.status] > healthRank[currentWorst]
        ? signal.status
        : currentWorst,
    firstSignal.status,
  );
}

export function selectWorstOperationalReadiness(state: SystemHealthStore) {
  const statuses = Object.values(state.operationalStatuses);

  if (statuses.length === 0) {
    return null;
  }

  const readinessRank = {
    idle: 0,
    pending: 1,
    partial: 2,
    ready: 3,
    unavailable: 4,
  } as const;

  return statuses.reduce((currentWorst, status) => {
    if (!currentWorst) {
      return status.readiness;
    }

    return readinessRank[status.readiness] > readinessRank[currentWorst]
      ? status.readiness
      : currentWorst;
  }, null as (typeof statuses)[number]['readiness'] | null);
}
