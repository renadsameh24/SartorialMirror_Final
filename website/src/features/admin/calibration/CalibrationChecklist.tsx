import { Badge, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { CalibrationWorkspaceReadModel } from '@/features/admin/readModels/calibration';

type CalibrationChecklistProps = {
  prerequisites: CalibrationWorkspaceReadModel['prerequisites'];
};

export function CalibrationChecklist({
  prerequisites,
}: CalibrationChecklistProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="muted">Checklist</Badge>}
          support="Calibration starts only after these local prerequisites are ready."
          title="Readiness Checklist"
        />
        <Divider />
        <div className="space-y-sm">
          {prerequisites.map((item) => (
            <div
              key={item.label}
              className="rounded-panel border border-border-subtle bg-surface-overlay px-lg py-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <p className="type-label text-text-primary">{item.label}</p>
                <Badge variant={item.ready ? 'accent' : 'muted'}>
                  {item.ready ? 'Ready' : 'Waiting'}
                </Badge>
              </div>
              <p className="type-body text-text-secondary">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
