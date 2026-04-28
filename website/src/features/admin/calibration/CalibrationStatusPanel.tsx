import { Badge, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { CalibrationWorkspaceReadModel } from '@/features/admin/readModels/calibration';

type CalibrationStatusPanelProps = {
  summary: CalibrationWorkspaceReadModel['summary'];
};

export function CalibrationStatusPanel({
  summary,
}: CalibrationStatusPanelProps) {
  return (
    <Panel tone="strong">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="operational">{summary.status}</Badge>}
          support="Current local calibration status."
          title="Calibration Status"
        />
        <Divider />
        {summary.facts.map((fact) => (
          <p key={fact} className="type-body text-text-secondary">
            {fact}
          </p>
        ))}
      </div>
    </Panel>
  );
}
