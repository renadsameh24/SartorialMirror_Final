import type { UiFitRecommendation } from '@/types/fit';

import { Badge, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { FitReadinessReadModel } from '@/lib/runtime/readModels';

type FitSummaryCardProps = {
  alternativeSize: string | null;
  fitSummary: string | null;
  readiness: FitReadinessReadModel;
  recommendation: UiFitRecommendation | null;
};

function readinessBody(readiness: FitReadinessReadModel) {
  switch (readiness.state) {
    case 'partial':
      return 'Current fit guidance may improve as more data settles.';
    case 'unavailable':
      return 'Fit guidance is temporarily reduced. You can still keep the live view active.';
    case 'pending':
      return 'Fit guidance is arriving while the session stays active.';
    default:
      return 'Plain-language fit guidance updates locally during the session.';
  }
}

export function FitSummaryCard({
  alternativeSize,
  fitSummary,
  readiness,
  recommendation,
}: FitSummaryCardProps) {
  return (
    <Panel className="shopper-fit-summary" tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={
            recommendation?.fitBand ? (
              <Badge variant="accent">{recommendation.fitBand}</Badge>
            ) : null
          }
          support={fitSummary ?? readinessBody(readiness)}
          title="Fit Guidance"
        />
        <Divider />
        <div className="space-y-sm">
          {recommendation?.recommendedSize ? (
            <p className="type-body text-text-primary">
              Recommended size: <span className="type-label">{recommendation.recommendedSize}</span>
            </p>
          ) : null}
          {recommendation?.evaluatedSize ? (
            <p className="type-body text-text-secondary">
              Current size: {recommendation.evaluatedSize}
            </p>
          ) : null}
          {alternativeSize ? (
            <p className="type-body text-text-secondary">
              You can compare against {alternativeSize} in the full fit notes.
            </p>
          ) : null}
          {!recommendation ? (
            <p className="type-body text-text-secondary">{readinessBody(readiness)}</p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
