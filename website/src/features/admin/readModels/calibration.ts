import { readCalibrationSummaryCard } from '@/features/admin/readModels/dashboard';
import { selectAdminState, selectCalibrationState } from '@/stores/admin/selectors';
import {
  selectHealthSignals,
  selectOperationalStatus,
  selectOperationalStatuses,
} from '@/stores/systemHealth/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { SystemSurface } from '@/types/system';

type CalibrationPrerequisite = {
  label: string;
  ready: boolean;
  summary: string;
};

export type CalibrationWorkspaceReadModel = {
  canCancel: boolean;
  canStart: boolean;
  currentSection: ReturnType<typeof selectAdminState>['activeSection'];
  inspectorNotes: string[];
  prerequisites: CalibrationPrerequisite[];
  progressCopy: string;
  statusLabel: string;
  summary: ReturnType<typeof readCalibrationSummaryCard>;
};

const REQUIRED_SURFACES: Array<{ label: string; surface: SystemSurface }> = [
  { label: 'Camera ready', surface: 'camera' },
  { label: 'Runtime ready', surface: 'runtime' },
  { label: 'Catalog snapshot ready', surface: 'catalog' },
];

export { readCalibrationSummaryCard };

export function readCalibrationWorkspace(): CalibrationWorkspaceReadModel {
  const adminStore = useAdminStore.getState();
  const systemHealth = useSystemHealthStore.getState();
  const calibration = selectCalibrationState(adminStore);
  const signals = selectHealthSignals(systemHealth);
  const statuses = selectOperationalStatuses(systemHealth);
  const prerequisites = REQUIRED_SURFACES.map((item) => {
    const status = selectOperationalStatus(systemHealth, item.surface);

    return {
      label: item.label,
      ready: status?.readiness === 'ready',
      summary: status?.summary ?? 'Not yet reported.',
    };
  });
  const readyCount = prerequisites.filter((item) => item.ready).length;
  const canStart =
    calibration.status !== 'inProgress' &&
    calibration.status !== 'failed' &&
    prerequisites.every((item) => item.ready);
  const canCancel = calibration.status === 'inProgress';

  return {
    canCancel,
    canStart,
    currentSection: selectAdminState(adminStore).activeSection,
    inspectorNotes: [
      calibration.activeProfileId
        ? `Active profile: ${calibration.activeProfileId}`
        : 'No active profile selected.',
      calibration.lastCompletedAt
        ? `Last completed: ${new Date(calibration.lastCompletedAt).toLocaleString()}`
        : 'No completed run recorded on this device.',
      `${signals.length} operational health signals available.`,
      `Tracked surfaces: ${Object.keys(statuses).length}`,
    ],
    prerequisites,
    progressCopy: canStart
      ? 'All local prerequisites are ready. You can start calibration now.'
      : `Calibration waits on ${prerequisites.length - readyCount} prerequisite${prerequisites.length - readyCount === 1 ? '' : 's'}.`,
    statusLabel: calibration.status,
    summary: readCalibrationSummaryCard(),
  };
}
