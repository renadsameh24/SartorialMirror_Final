import type { Garment, GarmentSelection } from '@/types/catalog';
import type { MeasurementSample } from '@/types/measurements';
import type { UiFitRecommendation } from '@/types/fit';

import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import type {
  DegradedReadModel,
  FitReadinessReadModel,
  MeasurementReadinessReadModel,
} from '@/lib/runtime/readModels';

type FitDetailsRailProps = {
  alternativeGarment: Garment | null;
  alternativeSize: string | null;
  degraded: DegradedReadModel;
  fitSummary: string | null;
  fitReadiness: FitReadinessReadModel;
  measurements: MeasurementSample[];
  measurementReadiness: MeasurementReadinessReadModel;
  onApplyRecommendedSize: () => void;
  onBackToTryOn: () => void;
  recommendation: UiFitRecommendation | null;
  selection: GarmentSelection | null;
};

function explanationText(
  recommendation: UiFitRecommendation | null,
  fitReadiness: FitReadinessReadModel,
  measurementReadiness: MeasurementReadinessReadModel,
) {
  if (recommendation?.summary) {
    if (measurementReadiness.state === 'partial') {
      return `${recommendation.summary} This may shift slightly as more measurements settle.`;
    }

    return recommendation.summary;
  }

  if (fitReadiness.state === 'unavailable') {
    return 'Fit guidance is temporarily reduced. You can keep using the live try-on view while the kiosk reconnects.';
  }

  return 'Fit guidance is still settling from the current local session.';
}

export function FitDetailsRail({
  alternativeGarment,
  alternativeSize,
  degraded,
  fitSummary,
  fitReadiness,
  measurements,
  measurementReadiness,
  onApplyRecommendedSize,
  onBackToTryOn,
  recommendation,
  selection,
}: FitDetailsRailProps) {
  return (
    <div className="space-y-lg">
      <Panel className="shopper-fit-details" tone="strong">
        <div className="space-y-lg">
          <PanelHeader
            action={
              recommendation?.fitBand ? (
                <Badge variant="accent">{recommendation.fitBand}</Badge>
              ) : null
            }
            support={fitSummary ?? 'Fit details'}
            title={fitSummary ?? 'Fit guidance is still settling.'}
          />
          <Divider />
          <div className="space-y-lg">
            <p className="type-body text-text-secondary">
              {explanationText(recommendation, fitReadiness, measurementReadiness)}
            </p>

            {recommendation?.reasons.length ? (
              <div className="space-y-sm">
                <p className="shopper-kicker text-text-primary">Why this fit reads this way</p>
                <ul className="space-y-sm text-text-secondary">
                  {recommendation.reasons.map((reason) => (
                    <li className="type-body rounded-panel border border-border-subtle bg-[rgba(255,255,255,0.02)] px-md py-sm" key={reason}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-sm rounded-panel border border-border-subtle bg-[rgba(255,255,255,0.02)] p-lg">
              <p className="shopper-kicker text-text-primary">Size comparison</p>
              <p className="type-body text-text-secondary">
                Current size: {selection?.sizeCode ?? 'Not chosen yet'}
              </p>
              <p className="type-body text-text-secondary">
                Recommended size: {recommendation?.recommendedSize ?? 'Still settling'}
              </p>
            </div>

            {alternativeSize ? (
              <Button onClick={onApplyRecommendedSize} variant="primary">
                Apply Recommended Size
              </Button>
            ) : null}

            {alternativeGarment ? (
              <div className="space-y-sm rounded-panel border border-border-subtle bg-surface-overlay p-lg">
                <p className="shopper-kicker text-text-primary">Alternative garment</p>
                <p className="type-body text-text-secondary">
                  {alternativeGarment.name} is also available in the current local catalog.
                </p>
              </div>
            ) : null}

            {measurements.length > 0 ? (
              <div className="space-y-sm">
                <p className="shopper-kicker text-text-primary">Measurements in view</p>
                <p className="type-body text-text-secondary">
                  {measurements.map((measurement) => measurement.label).join(' · ')}
                </p>
              </div>
            ) : null}

            {degraded.primaryGuidance ? (
              <p className="type-body text-text-secondary">
                {degraded.primaryGuidance.body}
              </p>
            ) : null}

            <Button onClick={onBackToTryOn} variant="secondary">
              Back to Try-On
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
