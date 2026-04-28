import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives';
import type {
  FitReadinessReadModel,
  UnityRenderReadinessReadModel,
} from '@/lib/runtime/readModels';

type TryOnStageOverlaysArgs = {
  fitReadiness: FitReadinessReadModel;
  fitSummary: string | null;
  garmentName: string;
  sizeCode?: string;
  unityReadiness: UnityRenderReadinessReadModel;
};

function bottomSummary({
  fitReadiness,
  fitSummary,
  unityReadiness,
}: Omit<TryOnStageOverlaysArgs, 'garmentName' | 'sizeCode'>) {
  if (unityReadiness.state === 'unavailable') {
    return 'Live view temporarily reduced.';
  }

  if (unityReadiness.state === 'delayed') {
    return unityReadiness.summary ?? 'Render catching up.';
  }

  if (fitReadiness.state === 'partial') {
    return fitSummary ?? 'Fit guidance is still settling.';
  }

  return fitSummary ?? unityReadiness.summary ?? 'Live try-on view is active.';
}

export function createTryOnStageOverlays({
  fitReadiness,
  fitSummary,
  garmentName,
  sizeCode,
  unityReadiness,
}: TryOnStageOverlaysArgs): {
  bottom: ReactNode | null;
  top: ReactNode | null;
} {
  return {
    top: (
      <div className="flex flex-wrap items-center gap-sm">
        <Badge variant="accent">{garmentName}</Badge>
        <Badge variant="muted">{sizeCode ? `Size ${sizeCode}` : 'Size open'}</Badge>
      </div>
    ),
    bottom: <Badge variant="muted">{bottomSummary({ fitReadiness, fitSummary, unityReadiness })}</Badge>,
  };
}
