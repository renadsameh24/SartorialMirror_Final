import { useState } from 'react';

import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';
import { Badge, Panel } from '@/components/primitives';
import { LocalIntegrationAlert } from '@/features/shopper/common/LocalIntegrationAlert';
import type { UnityRenderReadinessReadModel } from '@/lib/runtime/readModels';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { OperationalStatusMap } from '@/types/system';

type UnityStageSurfaceProps = {
  body: string;
  garmentName: string;
  unityReadiness: UnityRenderReadinessReadModel;
};

function stateLabel(readiness: UnityRenderReadinessReadModel['state']) {
  switch (readiness) {
    case 'ready':
      return 'Unity ready';
    case 'rendering':
      return 'Rendering';
    case 'delayed':
      return 'Catching up';
    case 'unavailable':
      return 'Unity unavailable';
    default:
      return 'Unity stage';
  }
}

function resolveUnityAlert({
  frameFailed,
  operationalStatuses,
  sourceMode,
}: {
  frameFailed: boolean;
  operationalStatuses: OperationalStatusMap;
  sourceMode: ReturnType<typeof resolveRuntimeConfig>['sourceMode'];
}) {
  if (sourceMode !== 'integration') {
    return null;
  }

  const runtimeUnavailable =
    operationalStatuses.runtime?.readiness === 'unavailable';
  const catalogUnavailable =
    operationalStatuses.catalog?.readiness === 'unavailable';
  const unityUnavailable =
    frameFailed ||
    operationalStatuses.unity?.readiness === 'unavailable' ||
    operationalStatuses.unity?.renderState === 'unavailable';

  if ((runtimeUnavailable || catalogUnavailable) && unityUnavailable) {
    return {
      body: 'Start the local FastAPI runtime on 127.0.0.1:8000 and the local Unity WebGL host on 127.0.0.1:8080, then retry.',
      title: 'Cannot connect to the local backend or Unity view.',
    };
  }

  if (runtimeUnavailable || catalogUnavailable) {
    return {
      body: 'Start the local FastAPI runtime on 127.0.0.1:8000, then retry so garment, measurement, and fit updates can resume.',
      title: 'Cannot connect to the local backend system.',
    };
  }

  if (unityUnavailable) {
    return {
      body: 'Start the local Unity WebGL host on 127.0.0.1:8080 and confirm it can receive postMessage commands from this front end.',
      title: 'Cannot connect to the local Unity view.',
    };
  }

  return null;
}

export function UnityStageSurface({
  body,
  garmentName,
  unityReadiness,
}: UnityStageSurfaceProps) {
  const config = resolveRuntimeConfig();
  const [frameFailed, setFrameFailed] = useState(false);
  const operationalStatuses = useSystemHealthStore(
    (state) => state.operationalStatuses,
  );
  const unityWebglUrl = config.unityWebglUrl ?? '';
  const unityAllowedOrigin = config.unityAllowedOrigin ?? '';
  const alert = resolveUnityAlert({
    frameFailed,
    operationalStatuses,
    sourceMode: config.sourceMode,
  });
  const shouldEmbedUnity =
    unityWebglUrl.length > 0 &&
    !frameFailed;

  return (
    <Panel
      className="unity-stage-surface min-h-[28rem] border-border-subtle"
      tone="strong"
    >
      {shouldEmbedUnity ? (
        <iframe
          allow="fullscreen; gamepad"
          aria-label="Unity try-on view"
          className="unity-stage-frame"
          data-unity-webgl-frame="true"
          onError={() => setFrameFailed(true)}
          src={unityWebglUrl}
          title="Unity try-on view"
        />
      ) : null}
      <div className="unity-stage-scrim" />
      <div className="relative z-10 flex h-full min-h-[24rem] flex-col justify-end gap-xl">
        <div className="flex flex-wrap items-center gap-sm">
          <Badge variant="accent">Mirror view</Badge>
          <Badge variant="muted">{stateLabel(unityReadiness.state)}</Badge>
          {shouldEmbedUnity ? (
            <Badge variant="muted">
              {unityAllowedOrigin.replace(/^https?:\/\//, '')}
            </Badge>
          ) : null}
        </div>
        <div className="space-y-sm">
          {alert ? (
            <LocalIntegrationAlert body={alert.body} title={alert.title} />
          ) : null}
          <h2 className="type-display font-display max-w-3xl text-[clamp(2.8rem,4vw,4.8rem)]">
            {garmentName}
          </h2>
          <p className="type-body max-w-2xl text-text-secondary">{body}</p>
          {frameFailed ? (
            <p className="type-body max-w-2xl text-text-secondary">
              The try-on view did not load. Staff can confirm the local Unity
              surface is running.
            </p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
