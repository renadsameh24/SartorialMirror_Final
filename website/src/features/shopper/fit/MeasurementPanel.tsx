import type { MeasurementSample } from '@/types/measurements';

import { Badge, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { MeasurementReadinessReadModel } from '@/lib/runtime/readModels';

type MeasurementPanelProps = {
  measurements: MeasurementSample[];
  readiness: MeasurementReadinessReadModel;
};

function statusBody(readiness: MeasurementReadinessReadModel) {
  switch (readiness.state) {
    case 'partial':
      return 'Available measurements stay visible while the rest settle.';
    case 'unavailable':
      return 'Measurements are temporarily reduced, but the session can continue.';
    case 'collecting':
      return 'Measurements are updating while you hold position.';
    default:
      return 'Current measurements update locally during the session.';
  }
}

export function MeasurementPanel({
  measurements,
  readiness,
}: MeasurementPanelProps) {
  return (
    <Panel className="shopper-rail-card" tone="subtle">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="muted">Local read</Badge>}
          support={statusBody(readiness)}
          title="Measurements"
        />
        <Divider />
        {measurements.length > 0 ? (
          <dl className="space-y-sm">
            {measurements.map((measurement) => (
              <div
                className="flex items-center justify-between gap-md rounded-[20px] border border-border-subtle bg-[rgba(255,255,255,0.02)] px-md py-sm"
                key={measurement.id}
              >
                <dt className="type-body text-text-secondary">{measurement.label}</dt>
                <dd className="type-label text-text-primary">
                  {measurement.valueCm} {measurement.unit}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="type-body text-text-secondary">{statusBody(readiness)}</p>
        )}
      </div>
    </Panel>
  );
}
