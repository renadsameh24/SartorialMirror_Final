import type { AdminStore } from '@/stores/admin/adminStore';

export function selectAdminState(state: AdminStore) {
  return state.operationalState;
}

export function selectAdminIntents(state: AdminStore) {
  return state.intents;
}

export function selectCatalogCurationByGarmentId(state: AdminStore) {
  return state.catalogCurationByGarmentId;
}

export function selectCalibrationState(state: AdminStore) {
  return state.operationalState.calibration;
}

export function selectVisibleLogs(state: AdminStore) {
  return state.logs;
}

export function selectSelectedLogEntry(state: AdminStore) {
  if (!state.operationalState.selectedLogEntryId) {
    return null;
  }

  return (
    state.logs.find((entry) => entry.id === state.operationalState.selectedLogEntryId) ??
    null
  );
}

export function selectCatalogCurationEntry(
  state: AdminStore,
  garmentId?: string | null,
) {
  if (!garmentId) {
    return null;
  }

  return state.catalogCurationByGarmentId[garmentId] ?? null;
}
