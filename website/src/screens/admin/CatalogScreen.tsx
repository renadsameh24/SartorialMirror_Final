import { useEffect, useState } from 'react';

import { Badge, Button } from '@/components/primitives';
import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { CatalogFilterBar } from '@/features/admin/catalog/CatalogFilterBar';
import { CatalogGarmentTable } from '@/features/admin/catalog/CatalogGarmentTable';
import { CatalogInspectorEditor } from '@/features/admin/catalog/CatalogInspectorEditor';
import { CatalogSummaryStrip } from '@/features/admin/catalog/CatalogSummaryStrip';
import { AdminSectionNav } from '@/features/admin/navigation/AdminSectionNav';
import {
  readAdminCatalogInspector,
  readAdminCatalogWorkspace,
} from '@/features/admin/readModels/catalog';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';
import type { AdminCatalogCuration } from '@/types/adminCatalog';
import type { AdminSection } from '@/types/admin';

type CatalogScreenModel = {
  categoryFilter: string;
  changeDraft: (next: AdminCatalogCuration) => void;
  discardDraft: () => void;
  draft: AdminCatalogCuration | null;
  hasUnsavedChanges: boolean;
  inspector: ReturnType<typeof readAdminCatalogInspector>;
  moveDown: () => void;
  moveUp: () => void;
  openSection: (section: AdminSection) => void;
  refreshSnapshot: () => void;
  returnToShopper: () => void;
  saveDraft: () => void;
  selectGarment: (garmentId: string) => void;
  selectedGarmentId: string | null;
  setCategoryFilter: (value: string) => void;
  setStatusFilter: (value: 'all' | 'disabled' | 'enabled') => void;
  statusFilter: 'all' | 'disabled' | 'enabled';
  workspace: ReturnType<typeof readAdminCatalogWorkspace>;
};

function sameDraft(left: AdminCatalogCuration | null, right: AdminCatalogCuration | null) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function useAdminCatalogScreenModel(): CatalogScreenModel {
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disabled' | 'enabled'>('all');
  const [draft, setDraft] = useState<AdminCatalogCuration | null>(null);
  const setMode = useUiModeStore((state) => state.setMode);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const setCatalogCurationEntry = useAdminStore((state) => state.setCatalogCurationEntry);
  const requestCatalogRefresh = useAdminStore((state) => state.requestCatalogRefresh);
  const workspace = readAdminCatalogWorkspace();
  const inspector = readAdminCatalogInspector(selectedGarmentId);
  const committedSignature = inspector?.committed
    ? JSON.stringify(inspector.committed)
    : 'null';

  useEffect(() => {
    if (!selectedGarmentId && workspace.rows[0]) {
      setSelectedGarmentId(workspace.rows[0].garmentId);
    }
  }, [selectedGarmentId, workspace.rows]);

  useEffect(() => {
    setDraft((current) => {
      const nextDraft = inspector?.committed ?? null;

      return sameDraft(current, nextDraft) ? current : nextDraft;
    });
  }, [committedSignature, selectedGarmentId]);

  return {
    categoryFilter,
    changeDraft: (next) => setDraft(next),
    discardDraft: () => setDraft(inspector?.committed ?? null),
    draft,
    hasUnsavedChanges: !sameDraft(draft, inspector?.committed ?? null),
    inspector,
    moveDown: () =>
      setDraft((current) =>
        current
          ? {
              ...current,
              sortOrder: current.sortOrder + 1,
            }
          : current,
      ),
    moveUp: () =>
      setDraft((current) =>
        current
          ? {
              ...current,
              sortOrder: Math.max(1, current.sortOrder - 1),
            }
          : current,
      ),
    openSection: (section) => setActiveSection(section),
    refreshSnapshot: () => {
      const canContinue =
        !draft ||
        sameDraft(draft, inspector?.committed ?? null) ||
        window.confirm(
          'Refreshing the local snapshot will discard unsaved curation. Continue?',
        );

      if (!canContinue) {
        return;
      }

      setDraft(inspector?.committed ?? null);
      requestCatalogRefresh();
    },
    returnToShopper: () => {
      setAccess('hidden');
      setActiveSection('dashboard');
      setMode('shopper');
    },
    saveDraft: () => {
      if (!draft) {
        return;
      }

      setCatalogCurationEntry(draft.garmentId, draft);
    },
    selectGarment: (garmentId) => setSelectedGarmentId(garmentId),
    selectedGarmentId,
    setCategoryFilter,
    setStatusFilter,
    statusFilter,
    workspace,
  };
}

export function createAdminCatalogScreenLayout({
  categoryFilter,
  changeDraft,
  discardDraft,
  draft,
  hasUnsavedChanges,
  inspector,
  moveDown,
  moveUp,
  openSection,
  refreshSnapshot,
  returnToShopper,
  saveDraft,
  selectGarment,
  selectedGarmentId,
  setCategoryFilter,
  setStatusFilter,
  statusFilter,
  workspace,
}: CatalogScreenModel): AdminSectionLayout {
  const filteredRows = workspace.rows.filter((row) => {
    const categoryMatch = categoryFilter === 'all' || row.categoryId === categoryFilter;
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && row.enabled) ||
      (statusFilter === 'disabled' && !row.enabled);

    return categoryMatch && statusMatch;
  });
  const saveDisabled = !draft || !hasUnsavedChanges || (inspector?.validationIssues.length ?? 0) > 0;

  return {
    commandBar: (
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="accent">Operational Mode</Badge>
            <Badge variant="operational">{workspace.summary.status}</Badge>
          </div>
          <h1 className="type-heading">Catalog</h1>
          <p className="type-body text-text-secondary">
            Local garment curation and snapshot controls only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button onClick={refreshSnapshot} variant="quiet">
            Refresh Snapshot
          </Button>
          <Button disabled={saveDisabled} onClick={saveDraft} variant="primary">
            Save Curation
          </Button>
          <Button onClick={returnToShopper} variant="quiet">
            Return to Shopper
          </Button>
        </div>
      </div>
    ),
    nav: (
      <AdminSectionNav activeSection="catalog" onSelect={(section) => openSection(section)} />
    ),
    workspace: (
      <div className="space-y-lg">
        <CatalogSummaryStrip summary={workspace.summary} />
        <CatalogFilterBar
          categories={workspace.categories}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          statusFilter={statusFilter}
        />
        <CatalogGarmentTable
          onSelect={selectGarment}
          rows={filteredRows}
          selectedGarmentId={selectedGarmentId}
        />
      </div>
    ),
    inspector: (
      <CatalogInspectorEditor
        draft={draft}
        hasUnsavedChanges={hasUnsavedChanges}
        inspector={inspector}
        onChange={changeDraft}
        onDiscard={discardDraft}
        onMoveDown={moveDown}
        onMoveUp={moveUp}
        onSave={saveDraft}
        saveDisabled={saveDisabled}
      />
    ),
  };
}
