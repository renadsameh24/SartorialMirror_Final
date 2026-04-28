import { useRef } from 'react';

import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';
import { Badge, Panel } from '@/components/primitives';
import { LocalIntegrationAlert } from '@/features/shopper/common/LocalIntegrationAlert';
import { useCameraFrameRelay } from '@/features/shopper/camera/useCameraFrameRelay';
import type { UnityRenderReadinessReadModel } from '@/lib/runtime/readModels';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { OperationalStatusMap } from '@/types/system';

type UnityTryOnStageWithCameraGuidesProps = {
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

function resolveCameraOverlayCopy() {
  return 'Mirror View uses Unity camera. Stand centered so shoulders match the guide.';
}

export function UnityTryOnStageWithCameraGuides({
  body,
  garmentName,
  unityReadiness,
}: UnityTryOnStageWithCameraGuidesProps) {
  const config = resolveRuntimeConfig();
  const operationalStatuses = useSystemHealthStore((state) => state.operationalStatuses);

  const unityWebglUrl = config.unityWebglUrl ?? '';
  const unityAllowedOrigin = config.unityAllowedOrigin ?? '';
  const shouldEmbedUnity =
    unityWebglUrl.length > 0;

  const sessionMachine = useSessionStore((state) => state.machine);
  const sessionId = 'sessionId' in sessionMachine ? sessionMachine.sessionId : null;
  const relayStatus = useCameraFrameRelay({
    enabled: config.sourceMode === 'integration' && config.cameraUplinkEnabled === true,
    sessionId,
    stream: null,
  });

  const frameFailedRef = useRef(false);

  const alert = resolveUnityAlert({
    frameFailed: frameFailedRef.current,
    operationalStatuses,
    sourceMode: config.sourceMode,
  });

  return (
    <Panel className="unity-stage-surface min-h-[28rem] border-border-subtle" tone="strong">
      {/* Unity overlay (real garment render). Needs transparent WebGL background in the Unity build. */}
      {shouldEmbedUnity ? (
        <iframe
          // Allow Unity WebGL to use WebCamTexture (pose pipeline) inside the iframe.
          // (We still rely on WebGL transparency to see the website camera behind it.)
          allow="camera *; microphone *; autoplay; fullscreen; gamepad"
          aria-label="Unity try-on view"
          className="unity-stage-frame"
          data-unity-webgl-frame="true"
          onError={() => {
            frameFailedRef.current = true;
          }}
          src={unityWebglUrl}
          title="Unity try-on view"
        />
      ) : null}

      {/* NOTE: keep stage readable, but avoid a dark overlay that can make Unity look black. */}

      {/* Guides above Unity camera background */}
      {shouldEmbedUnity ? (
        <svg className="absolute inset-0 z-20 h-full w-full" viewBox="0 0 1000 750" role="presentation">
              <defs>
                <linearGradient id="guideGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                </linearGradient>
              </defs>

              {/* Upper-body capture region (wider: nearly full stage) */}
              <path
                d="M500 70c260 0 430 170 430 360v160c0 90-74 164-164 164H234c-90 0-164-74-164-164V430c0-190 170-360 430-360Z"
                fill="rgba(0,0,0,0.10)"
                stroke="url(#guideGlow)"
                strokeWidth="6"
              />

              {/* Midline + chest target */}
              <line x1="500" y1="120" x2="500" y2="710" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
              <circle cx="500" cy="355" r="10" fill="rgba(141,163,155,0.9)" />
        </svg>
      ) : null}

      <div className="absolute left-6 top-6 z-30 flex flex-wrap items-center gap-2">
        <Badge className="backdrop-blur-sm" variant="muted">
          Upper-body alignment
        </Badge>
        <Badge variant={relayStatus === 'streaming' ? 'accent' : 'muted'}>
          {config.cameraUplinkEnabled ? (relayStatus === 'streaming' ? 'Feed live' : 'Feed') : 'Local'}
        </Badge>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-30">
        <div className="max-w-3xl rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
          <p className="type-body text-text-secondary">{resolveCameraOverlayCopy()}</p>
        </div>
      </div>

      <div className="relative z-10 flex h-full min-h-[24rem] flex-col justify-end gap-xl">
        <div className="flex flex-wrap items-center gap-sm">
          <Badge variant="accent">Mirror view</Badge>
          <Badge variant="muted">{stateLabel(unityReadiness.state)}</Badge>
          {shouldEmbedUnity ? (
            <Badge variant="muted">{unityAllowedOrigin.replace(/^https?:\/\//, '')}</Badge>
          ) : null}
        </div>
        <div className="space-y-sm">
          {alert ? <LocalIntegrationAlert body={alert.body} title={alert.title} /> : null}
          <h2 className="type-display font-display max-w-3xl text-[clamp(2.8rem,4vw,4.8rem)]">
            {garmentName}
          </h2>
          <p className="type-body max-w-2xl text-text-secondary">{body}</p>
        </div>
      </div>
    </Panel>
  );
}

