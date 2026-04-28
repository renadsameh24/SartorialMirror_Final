import { useState } from 'react';

import { Badge, Button } from '@/components/primitives';
import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { AdminSectionNav } from '@/features/admin/navigation/AdminSectionNav';
import { readLogWorkspace } from '@/features/admin/readModels/logs';
import { LogFilterBar } from '@/features/admin/logs/LogFilterBar';
import { LogInspectorDetail } from '@/features/admin/logs/LogInspectorDetail';
import { LogTable } from '@/features/admin/logs/LogTable';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';
import type { AdminSection, OperationalLogEntry } from '@/types/admin';

type LogsScreenModel = {
  clearSelection: () => void;
  levelFilter: 'all' | OperationalLogEntry['level'];
  openSection: (section: AdminSection) => void;
  refreshLogs: () => void;
  returnToShopper: () => void;
  selectEntry: (logId: string) => void;
  setLevelFilter: (value: 'all' | OperationalLogEntry['level']) => void;
  setSourceFilter: (value: 'all' | OperationalLogEntry['source']) => void;
  sourceFilter: 'all' | OperationalLogEntry['source'];
  workspace: ReturnType<typeof readLogWorkspace>;
};

export function useAdminLogsScreenModel(): LogsScreenModel {
  const [levelFilter, setLevelFilter] = useState<'all' | OperationalLogEntry['level']>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | OperationalLogEntry['source']>('all');
  const setMode = useUiModeStore((state) => state.setMode);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const requestLogsRefresh = useAdminStore((state) => state.requestLogsRefresh);
  const selectLogEntry = useAdminStore((state) => state.selectLogEntry);

  return {
    clearSelection: () => selectLogEntry(undefined),
    levelFilter,
    openSection: (section) => setActiveSection(section),
    refreshLogs: () => requestLogsRefresh(),
    returnToShopper: () => {
      setAccess('hidden');
      setActiveSection('dashboard');
      setMode('shopper');
    },
    selectEntry: (logId) => selectLogEntry(logId),
    setLevelFilter,
    setSourceFilter,
    sourceFilter,
    workspace: readLogWorkspace(),
  };
}

export function createAdminLogsScreenLayout({
  clearSelection,
  levelFilter,
  openSection,
  refreshLogs,
  returnToShopper,
  selectEntry,
  setLevelFilter,
  setSourceFilter,
  sourceFilter,
  workspace,
}: LogsScreenModel): AdminSectionLayout {
  const filteredEntries = workspace.entries.filter((entry) => {
    const levelMatch = levelFilter === 'all' || entry.level === levelFilter;
    const sourceMatch = sourceFilter === 'all' || entry.source === sourceFilter;

    return levelMatch && sourceMatch;
  });

  return {
    commandBar: (
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="accent">Operational Mode</Badge>
            <Badge variant="operational">{workspace.counts.warning} warnings</Badge>
            <Badge variant="destructive">{workspace.counts.error} errors</Badge>
          </div>
          <h1 className="type-heading">Logs</h1>
          <p className="type-body text-text-secondary">
            Staff-readable local operational logs only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button onClick={refreshLogs} variant="quiet">
            Refresh Logs
          </Button>
          <Button onClick={returnToShopper} variant="quiet">
            Return to Shopper
          </Button>
        </div>
      </div>
    ),
    nav: (
      <AdminSectionNav activeSection="logs" onSelect={(section) => openSection(section)} />
    ),
    workspace: (
      <div className="space-y-lg">
        <LogFilterBar
          level={levelFilter}
          newestTimestamp={workspace.newestTimestamp}
          onLevelChange={setLevelFilter}
          onSourceChange={setSourceFilter}
          source={sourceFilter}
          sources={workspace.sources}
        />
        <LogTable
          entries={filteredEntries}
          onSelect={selectEntry}
          selectedLogId={workspace.selectedEntry?.id}
        />
      </div>
    ),
    inspector: <LogInspectorDetail onClear={clearSelection} workspace={workspace} />,
  };
}
