import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';

type CalibrationActionPanelProps = {
  canCancel: boolean;
  canStart: boolean;
  onCancel: () => void;
  onStart: () => void;
  progressCopy: string;
};

export function CalibrationActionPanel({
  canCancel,
  canStart,
  onCancel,
  onStart,
  progressCopy,
}: CalibrationActionPanelProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="operational">Controls</Badge>}
          support="Operational actions stay local to this device."
          title="Calibration Actions"
        />
        <Divider />
        <p className="type-body text-text-secondary">{progressCopy}</p>
        <div className="flex flex-wrap items-center gap-sm">
          <Button disabled={!canStart} onClick={onStart} variant="primary">
            Start Calibration
          </Button>
          {canCancel ? (
            <Button onClick={onCancel} variant="destructive">
              Cancel Calibration
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
