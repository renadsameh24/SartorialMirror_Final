import type { CalibrationState, OperationalLogEntry } from '@/types/admin';
import type { HealthSignal, OperationalStatus } from '@/types/system';

export const DEMO_ADMIN_CALIBRATION_REQUIRED: CalibrationState = {
  status: 'required',
  lastCompletedAt: '2026-03-23T08:30:00.000Z',
};

export const DEMO_ADMIN_CALIBRATION_READY: CalibrationState = {
  status: 'ready',
  activeProfileId: 'local-default-profile',
  lastCompletedAt: '2026-03-24T09:00:00.000Z',
};

export const DEMO_ADMIN_CALIBRATION_IN_PROGRESS: CalibrationState = {
  status: 'inProgress',
  activeProfileId: 'local-default-profile',
};

export const DEMO_ADMIN_LOG_ENTRIES: OperationalLogEntry[] = [
  {
    id: 'admin-log-1',
    level: 'warning',
    source: 'runtime',
    message: 'Runtime is still warming up after the last reset.',
    timestamp: '2026-03-24T10:00:00.000Z',
  },
  {
    id: 'admin-log-2',
    level: 'error',
    source: 'unity',
    message: 'Unity render has not reported readiness for the current local scene.',
    timestamp: '2026-03-24T10:02:00.000Z',
  },
  {
    id: 'admin-log-3',
    level: 'info',
    source: 'catalog',
    message: 'Catalog snapshot loaded from the local fixture bundle.',
    timestamp: '2026-03-24T10:05:00.000Z',
  },
];

export const DEMO_ADMIN_OPERATIONAL_STATUSES: OperationalStatus[] = [
  {
    surface: 'camera',
    readiness: 'ready',
    summary: 'Camera positioning is ready.',
    updatedAt: '2026-03-24T10:00:00.000Z',
    detectionState: 'ready',
  },
  {
    surface: 'runtime',
    readiness: 'ready',
    summary: 'Runtime bridge is connected.',
    updatedAt: '2026-03-24T10:00:00.000Z',
  },
  {
    surface: 'unity',
    readiness: 'partial',
    summary: 'Unity render is still catching up.',
    updatedAt: '2026-03-24T10:00:00.000Z',
    renderState: 'delayed',
  },
  {
    surface: 'catalog',
    readiness: 'ready',
    summary: 'Catalog snapshot is current.',
    updatedAt: '2026-03-24T10:00:00.000Z',
  },
];

export const DEMO_ADMIN_HEALTH_SIGNALS: HealthSignal[] = [
  {
    surface: 'runtime',
    status: 'healthy',
    summary: 'Runtime is healthy.',
    updatedAt: '2026-03-24T10:00:00.000Z',
  },
  {
    surface: 'unity',
    status: 'warning',
    summary: 'Unity is delayed but still reporting.',
    updatedAt: '2026-03-24T10:00:00.000Z',
  },
];
