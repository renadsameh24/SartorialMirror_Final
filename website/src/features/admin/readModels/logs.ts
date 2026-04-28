import { readLogSummaryCard } from '@/features/admin/readModels/dashboard';
import { selectSelectedLogEntry, selectVisibleLogs } from '@/stores/admin/selectors';
import { selectOperationalStatuses } from '@/stores/systemHealth/selectors';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { OperationalLogEntry } from '@/types/admin';

export type LogWorkspaceReadModel = {
  counts: {
    error: number;
    info: number;
    warning: number;
  };
  entries: OperationalLogEntry[];
  newestTimestamp: string | null;
  relatedSurfaceSummary: string | null;
  selectedEntry: ReturnType<typeof selectSelectedLogEntry>;
  sources: Array<OperationalLogEntry['source']>;
};

export { readLogSummaryCard };

export function readLogWorkspace(): LogWorkspaceReadModel {
  const adminStore = useAdminStore.getState();
  const logs = selectVisibleLogs(adminStore);
  const selectedEntry = selectSelectedLogEntry(adminStore);
  const statuses = selectOperationalStatuses(useSystemHealthStore.getState());

  return {
    counts: {
      error: logs.filter((entry) => entry.level === 'error').length,
      info: logs.filter((entry) => entry.level === 'info').length,
      warning: logs.filter((entry) => entry.level === 'warning').length,
    },
    entries: logs,
    newestTimestamp: logs[0]?.timestamp ?? null,
    relatedSurfaceSummary:
      selectedEntry && selectedEntry.source !== 'admin'
        ? statuses[selectedEntry.source]?.summary ?? null
        : null,
    selectedEntry,
    sources: Array.from(new Set(logs.map((entry) => entry.source))),
  };
}
