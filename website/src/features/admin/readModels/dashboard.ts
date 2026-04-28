import { selectAdminState, selectCalibrationState, selectVisibleLogs } from '@/stores/admin/selectors';
import { readCatalogCurationSummary } from '@/features/admin/readModels/catalog';
import {
  selectHealthSignals,
  selectOperationalStatuses,
  selectWorstOperationalReadiness,
  selectWorstSystemStatus,
} from '@/stores/systemHealth/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { AdminSection } from '@/types/admin';
import type { HealthStatus, OperationalReadiness, SystemSurface } from '@/types/system';

export type DashboardSummaryCard = {
  actionLabel: string;
  facts: string[];
  id: 'health' | 'calibration' | 'catalog' | 'logs';
  section: AdminSection | null;
  status: string;
  support: string;
  title: string;
};

export type AdminDashboardSummaryReadModel = {
  accessState: ReturnType<typeof selectAdminState>['access'];
  cards: DashboardSummaryCard[];
  inspectorNote: string;
  urgentSummary: string;
};

function labelHealthStatus(status: HealthStatus | null) {
  switch (status) {
    case 'offline':
      return 'Offline';
    case 'degraded':
      return 'Degraded';
    case 'warning':
      return 'Warning';
    case 'healthy':
      return 'Healthy';
    default:
      return 'Not yet reported';
  }
}

function labelOperationalReadiness(status: OperationalReadiness | null) {
  switch (status) {
    case 'unavailable':
      return 'Attention needed';
    case 'partial':
      return 'Partially ready';
    case 'pending':
      return 'Pending';
    case 'ready':
      return 'Ready';
    case 'idle':
      return 'Idle';
    default:
      return 'Not yet reported';
  }
}

function formatTimestamp(value?: string) {
  if (!value) {
    return 'Not yet reported';
  }

  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  });
}

export function readHealthSummaryCard(): DashboardSummaryCard {
  const systemHealth = useSystemHealthStore.getState();
  const signals = selectHealthSignals(systemHealth);
  const statuses = selectOperationalStatuses(systemHealth);
  const worstSystemStatus = selectWorstSystemStatus(systemHealth);
  const worstOperationalReadiness = selectWorstOperationalReadiness(systemHealth);
  const surfaces: SystemSurface[] = ['camera', 'runtime', 'unity', 'catalog'];
  const readyCount = surfaces.filter(
    (surface) => statuses[surface]?.readiness === 'ready',
  ).length;

  return {
    actionLabel: 'View Detail',
    facts: [
      `Worst health: ${labelHealthStatus(worstSystemStatus)}`,
      `Worst readiness: ${labelOperationalReadiness(worstOperationalReadiness)}`,
      `${readyCount} of ${surfaces.length} surfaces ready`,
    ],
    id: 'health',
    section: null,
    status: signals.length > 0 ? `${signals.length} surface signals available` : 'No health signals yet',
    support: 'Camera, runtime, Unity, and catalog status on this device.',
    title: 'Health Summary',
  };
}

export function readCalibrationSummaryCard(): DashboardSummaryCard {
  const calibration = selectCalibrationState(useAdminStore.getState());

  return {
    actionLabel: 'Open Calibration',
    facts: [
      calibration.activeProfileId
        ? `Active profile: ${calibration.activeProfileId}`
        : 'No profile selected',
      calibration.lastCompletedAt
        ? `Last completed: ${formatTimestamp(calibration.lastCompletedAt)}`
        : 'No completed run recorded',
    ],
    id: 'calibration',
    section: 'calibration',
    status: `Current status: ${calibration.status}`,
    support: 'Local calibration state and readiness only.',
    title: 'Calibration Summary',
  };
}

export function readCatalogSummaryCard(): DashboardSummaryCard {
  return readCatalogCurationSummary();
}

export function readLogSummaryCard(): DashboardSummaryCard {
  const logs = selectVisibleLogs(useAdminStore.getState());
  const warningCount = logs.filter((entry) => entry.level === 'warning').length;
  const errorCount = logs.filter((entry) => entry.level === 'error').length;
  const latestTimestamp = logs[0]?.timestamp ?? null;

  return {
    actionLabel: 'Open Logs',
    facts: [
      `${warningCount} warning entries`,
      `${errorCount} error entries`,
      `Latest log: ${formatTimestamp(latestTimestamp ?? undefined)}`,
    ],
    id: 'logs',
    section: 'logs',
    status: logs.length > 0 ? `${logs.length} recent entries available` : 'No recent logs reported',
    support: 'Recent local operational warnings and errors.',
    title: 'Log Summary',
  };
}

export function readAdminDashboardSummary(): AdminDashboardSummaryReadModel {
  const adminState = selectAdminState(useAdminStore.getState());
  const cards = [
    readHealthSummaryCard(),
    readCalibrationSummaryCard(),
    readCatalogSummaryCard(),
    readLogSummaryCard(),
  ];

  return {
    accessState: adminState.access,
    cards,
    inspectorNote: 'This device remains local-first. Staff tools summarize only local runtime and catalog state.',
    urgentSummary: cards[0]?.status ?? 'No operational summary yet',
  };
}
