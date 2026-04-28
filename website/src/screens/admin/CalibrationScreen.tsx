import { Badge, Button } from '@/components/primitives';
import type { AdminSectionLayout } from '@/features/admin/adminSectionLayout';
import { CalibrationActionPanel } from '@/features/admin/calibration/CalibrationActionPanel';
import { CalibrationChecklist } from '@/features/admin/calibration/CalibrationChecklist';
import { CalibrationStatusPanel } from '@/features/admin/calibration/CalibrationStatusPanel';
import { AdminSectionNav } from '@/features/admin/navigation/AdminSectionNav';
import { readCalibrationWorkspace } from '@/features/admin/readModels/calibration';
import { useAdminStore } from '@/stores/admin/adminStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';
import type { AdminSection } from '@/types/admin';

type CalibrationScreenModel = {
  openSection: (section: AdminSection) => void;
  returnToShopper: () => void;
  startCalibration: () => void;
  cancelCalibration: () => void;
  workspace: ReturnType<typeof readCalibrationWorkspace>;
};

export function useAdminCalibrationScreenModel(): CalibrationScreenModel {
  const setMode = useUiModeStore((state) => state.setMode);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const requestCalibrationStart = useAdminStore((state) => state.requestCalibrationStart);
  const requestCalibrationCancel = useAdminStore((state) => state.requestCalibrationCancel);
  const setCalibration = useAdminStore((state) => state.setCalibration);
  const currentCalibration = useAdminStore((state) => state.operationalState.calibration);

  return {
    cancelCalibration: () => {
      requestCalibrationCancel();
      setCalibration({
        ...currentCalibration,
        status: 'idle',
      });
    },
    openSection: (section) => setActiveSection(section),
    returnToShopper: () => {
      setAccess('hidden');
      setActiveSection('dashboard');
      setMode('shopper');
    },
    startCalibration: () => {
      requestCalibrationStart(currentCalibration.activeProfileId);
      setCalibration({
        ...currentCalibration,
        activeProfileId: currentCalibration.activeProfileId ?? 'local-default-profile',
        status: 'inProgress',
      });
    },
    workspace: readCalibrationWorkspace(),
  };
}

export function createAdminCalibrationScreenLayout({
  cancelCalibration,
  openSection,
  returnToShopper,
  startCalibration,
  workspace,
}: CalibrationScreenModel): AdminSectionLayout {
  return {
    commandBar: (
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="accent">Operational Mode</Badge>
            <Badge variant="operational">{workspace.statusLabel}</Badge>
          </div>
          <h1 className="type-heading">Calibration</h1>
          <p className="type-body text-text-secondary">
            Local calibration controls and readiness only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button disabled={!workspace.canStart} onClick={startCalibration} variant="primary">
            Start Calibration
          </Button>
          {workspace.canCancel ? (
            <Button onClick={cancelCalibration} variant="destructive">
              Cancel Calibration
            </Button>
          ) : null}
          <Button onClick={returnToShopper} variant="quiet">
            Return to Shopper
          </Button>
        </div>
      </div>
    ),
    nav: (
      <AdminSectionNav
        activeSection="calibration"
        onSelect={(section) => openSection(section)}
      />
    ),
    workspace: (
      <div className="space-y-lg">
        <CalibrationStatusPanel summary={workspace.summary} />
        <CalibrationChecklist prerequisites={workspace.prerequisites} />
        <CalibrationActionPanel
          canCancel={workspace.canCancel}
          canStart={workspace.canStart}
          onCancel={cancelCalibration}
          onStart={startCalibration}
          progressCopy={workspace.progressCopy}
        />
      </div>
    ),
    inspector: (
      <div className="space-y-lg">
        {workspace.inspectorNotes.map((note) => (
          <div key={note} className="rounded-panel border border-border-subtle bg-surface-overlay px-lg py-md">
            <p className="type-body text-text-secondary">{note}</p>
          </div>
        ))}
      </div>
    ),
  };
}
