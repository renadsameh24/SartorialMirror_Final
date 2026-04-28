import { useEffect, useRef } from 'react';

import { resolveRuntimeConfig } from '@/app/runtime/runtimeConfig';
import { Badge, Panel } from '@/components/primitives';
import { LocalIntegrationAlert } from '@/features/shopper/common/LocalIntegrationAlert';
import { useCameraFrameRelay } from '@/features/shopper/camera/useCameraFrameRelay';
import { useLocalCameraPreview } from '@/features/shopper/camera/useLocalCameraPreview';
import { useUpperBodyAlignmentFromRef } from '@/features/shopper/tryOn/useUpperBodyAlignment';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';
import type { OperationalStatusMap } from '@/types/system';

const BUILD_ID = 'pose-fallback-v3';

function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function garmentPlacementFromLandmarksScreen(args: {
  // screen coords in SVG units
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  leftHip?: { x: number; y: number };
  rightHip?: { x: number; y: number };
}) {
  const { leftShoulder: ls, rightShoulder: rs, leftHip: lh, rightHip: rh } = args;

  const shoulderMid = { x: (ls.x + rs.x) * 0.5, y: (ls.y + rs.y) * 0.5 };
  const dx = rs.x - ls.x;
  const dy = rs.y - ls.y;
  const shoulderDist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Estimate torso length if hips aren't visible (upper-body focus).
  const hipMid = lh && rh ? { x: (lh.x + rh.x) * 0.5, y: (lh.y + rh.y) * 0.5 } : null;
  const torso = hipMid ? Math.abs(hipMid.y - shoulderMid.y) : shoulderDist * 1.35;

  // Garment sizing tuned for on-camera overlay. Use multipliers rather than huge absolute scaling
  // so the shirt stays within the stage viewport.
  const width = clamp(shoulderDist * 3.0, 220, 980);
  const height = clamp(torso * 1.8, width * 0.95, width * 1.65);

  // Put the collar just above the shoulder line.
  const center = { x: shoulderMid.x, y: shoulderMid.y + height * 0.18 };
  const topLeft = { x: center.x - width * 0.5, y: center.y - height * 0.35 };

  return { topLeft, width, height, angle, center };
}

type CameraStageSurfaceProps = {
  body: string;
  label: string;
  title: string;
};

function statusCopy(status: ReturnType<typeof useLocalCameraPreview>['status']) {
  switch (status) {
    case 'ready':
      return {
        label: 'Camera ready',
        title: 'You are in view.',
        body: 'The local camera preview stays on this device and clears when the session ends.',
      };
    case 'requesting':
      return {
        label: 'Opening camera',
        title: 'Preparing the mirror view.',
        body: 'Allow camera access on this device to show the local reflection.',
      };
    case 'unavailable':
      return {
        label: 'Camera unavailable',
        title: 'Mirror preview is reduced.',
        body: 'You can continue with local tracking status, or ask staff to check camera access.',
      };
    default:
      return null;
  }
}

function resolveCameraAlert({
  cameraUplinkEnabled,
  cameraPreviewEnabled,
  relayStatus,
  operationalStatuses,
  previewStatus,
  sourceMode,
}: {
  cameraUplinkEnabled: boolean;
  cameraPreviewEnabled: boolean;
  relayStatus: ReturnType<typeof useCameraFrameRelay>;
  operationalStatuses: OperationalStatusMap;
  previewStatus: ReturnType<typeof useLocalCameraPreview>['status'];
  sourceMode: ReturnType<typeof resolveRuntimeConfig>['sourceMode'];
}) {
  if (sourceMode === 'integration' && cameraUplinkEnabled && relayStatus === 'unavailable') {
    return {
      body: 'The device camera opened locally, but the live camera feed is not reaching the backend runtime. Start the local camera WebSocket on 127.0.0.1:8000/ws/camera, then retry.',
      title: 'Camera feed is not reaching the backend.',
    };
  }

  if (sourceMode === 'integration') {
    const runtimeUnavailable =
      operationalStatuses.runtime?.readiness === 'unavailable';
    const catalogUnavailable =
      operationalStatuses.catalog?.readiness === 'unavailable';

    if (runtimeUnavailable || catalogUnavailable) {
      return {
        body: 'Start the local FastAPI runtime on 127.0.0.1:8000, then retry. The camera preview can stay local on this device, but detection, catalog, and fit updates need the backend connection.',
        title: 'Cannot connect to the local backend system.',
      };
    }
  }

  if (cameraPreviewEnabled && previewStatus === 'unavailable') {
    return {
      body: 'Allow browser camera access to show the local mirror preview. No frames are uploaded from this front end.',
      title: 'Camera preview is unavailable on this device.',
    };
  }

  return null;
}

export function CameraStageSurface({
  body,
  label,
  title,
}: CameraStageSurfaceProps) {
  const {
    cameraPreviewEnabled = false,
    cameraUplinkEnabled = false,
    sourceMode,
  } = resolveRuntimeConfig();
  const sessionMachine = useSessionStore((state) => state.machine);
  const phase = sessionMachine.phase;
  const sessionId = 'sessionId' in sessionMachine ? sessionMachine.sessionId : null;
  // Requirement: website camera is ON on homepage (idle), OFF after Start Session.
  // (Camera in Mirror View is handled by Unity WebGL instead.)
  const shouldRequestCamera =
    phase === 'idle' && (cameraPreviewEnabled || cameraUplinkEnabled);
  const { status, stream } = useLocalCameraPreview(shouldRequestCamera);
  const relayStatus = useCameraFrameRelay({
    enabled: sourceMode === 'integration' && cameraUplinkEnabled,
    sessionId,
    stream,
  });
  const operationalStatuses = useSystemHealthStore(
    (state) => state.operationalStatuses,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const alignment = useUpperBodyAlignmentFromRef(videoRef);
  const copy = statusCopy(status);
  const alert = resolveCameraAlert({
    cameraUplinkEnabled,
    cameraPreviewEnabled,
    relayStatus,
    operationalStatuses,
    previewStatus: status,
    sourceMode,
  });
  const resolvedLabel = copy?.label ?? label;
  const resolvedTitle = copy?.title ?? title;
  const resolvedBody = copy?.body ?? body;

  const alignmentCopy =
    status !== 'ready'
      ? null
      : alignment.state === 'loadingModel'
        ? { title: 'Loading pose tracker…', body: 'Preparing upper-body alignment guides.' }
        : alignment.state === 'error'
          ? { title: 'Pose tracker error', body: alignment.message }
        : alignment.state === 'noPerson'
          ? {
              title: 'Step into frame',
              body:
                `Make sure both shoulders are visible. Arms help but are optional.` +
                (alignment.debug
                  ? ` (debug: noPoseFrames=${alignment.debug.noPoseFrames}, shouldersMissingFrames=${alignment.debug.shouldersMissingFrames ?? 'n/a'}, shouldersSeen=${alignment.debug.shouldersSeen ?? 'n/a'}, mpFrames=${alignment.debug.mpFramesProcessed ?? 'n/a'}, video=${alignment.debug.video ? `${alignment.debug.video.w}x${alignment.debug.video.h} rs=${alignment.debug.video.readyState} t=${alignment.debug.video.t.toFixed(2)}` : 'n/a'}, tf=${alignment.debug.tf})`
                  : ''),
            }
          : alignment.state === 'tracking'
            ? alignment.aligned
            ? { title: `Aligned (${alignment.source})`, body: `Confidence ${(alignment.confidence * 100).toFixed(0)}%. Hold still for a moment, then proceed.` }
            : { title: `Adjust position (${alignment.source})`, body: `Confidence ${(alignment.confidence * 100).toFixed(0)}%. Move closer/farther until dots settle inside the guide.` }
            : null;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      if (stream && !/jsdom/i.test(globalThis.navigator?.userAgent ?? '')) {
        try {
          const playback = videoRef.current.play?.();

          if (playback && typeof playback.catch === 'function') {
            void playback.catch(() => undefined);
          }
        } catch {
          // JSDOM does not implement HTMLMediaElement.play; browsers will still
          // honor the muted autoplay flow when available.
        }
      }
    }
  }, [stream]);

  return (
    <Panel className="camera-stage-surface min-h-[32rem]" tone="strong">
      {cameraPreviewEnabled && stream && status === 'ready' ? (
        <>
          <video
            ref={videoRef}
            aria-label="Local camera preview"
            autoPlay
            className="camera-stage-video"
            muted
            playsInline
          />
          <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 1000 750" role="presentation">
            <defs>
              <linearGradient id="guideGlowStage" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
            </defs>

            <path
              d="M500 70c260 0 430 170 430 360v160c0 90-74 164-164 164H234c-90 0-164-74-164-164V430c0-190 170-360 430-360Z"
              fill="rgba(0,0,0,0.10)"
              stroke={alignment.state === 'tracking' && alignment.aligned ? 'rgba(141,163,155,0.95)' : 'url(#guideGlowStage)'}
              strokeWidth="6"
            />

            {alignment.state === 'tracking' ? (
              <>
                {(() => {
                  const toX = (x: number) => 1000 * (1 - x); // video mirrored by CSS
                  const toY = (y: number) => 750 * y;
                  const pts = alignment.landmarks;
                  const dot = (x: number, y: number, r: number, fill: string) => (
                    <circle cx={x} cy={y} r={r} fill={fill} />
                  );
                  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => (
                    <line
                      x1={toX(a.x)}
                      y1={toY(a.y)}
                      x2={toX(b.x)}
                      y2={toY(b.y)}
                      stroke={alignment.aligned ? 'rgba(141,163,155,0.85)' : 'rgba(255,255,255,0.45)'}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  );

                  const extend = (
                    a: { x: number; y: number },
                    b: { x: number; y: number },
                    factor: number,
                  ) => {
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    return {
                      a: { x: a.x - dx * factor, y: a.y - dy * factor },
                      b: { x: b.x + dx * factor, y: b.y + dy * factor },
                    };
                  };
                  return (
                    <>
                      {(() => {
                        // Extended shoulder guide matches perceived shoulder span better.
                        const s = extend(pts.leftShoulder, pts.rightShoulder, 0.60);
                        return (
                          <>
                            {line(s.a, s.b)}
                            {dot(toX(s.a.x), toY(s.a.y), 8, 'rgba(255,255,255,0.55)')}
                            {dot(toX(s.b.x), toY(s.b.y), 8, 'rgba(255,255,255,0.55)')}
                          </>
                        );
                      })()}
                      {(() => {
                        const s = extend(pts.leftShoulder, pts.rightShoulder, 0.60);
                        // Attach arms to the extended shoulder endpoints so the guide + garment feel connected.
                        return (
                          <>
                            {pts.leftElbow ? line(s.a, pts.leftElbow) : null}
                            {pts.leftElbow && pts.leftWrist ? line(pts.leftElbow, pts.leftWrist) : null}
                            {pts.rightElbow ? line(s.b, pts.rightElbow) : null}
                            {pts.rightElbow && pts.rightWrist ? line(pts.rightElbow, pts.rightWrist) : null}
                          </>
                        );
                      })()}
                      {dot(toX(pts.leftShoulder.x), toY(pts.leftShoulder.y), 14, 'rgba(211,192,155,0.92)')}
                      {dot(toX(pts.rightShoulder.x), toY(pts.rightShoulder.y), 14, 'rgba(211,192,155,0.92)')}
                      {pts.leftElbow ? dot(toX(pts.leftElbow.x), toY(pts.leftElbow.y), 10, 'rgba(255,255,255,0.75)') : null}
                      {pts.rightElbow ? dot(toX(pts.rightElbow.x), toY(pts.rightElbow.y), 10, 'rgba(255,255,255,0.75)') : null}
                      {pts.leftWrist ? dot(toX(pts.leftWrist.x), toY(pts.leftWrist.y), 10, 'rgba(255,255,255,0.75)') : null}
                      {pts.rightWrist ? dot(toX(pts.rightWrist.x), toY(pts.rightWrist.y), 10, 'rgba(255,255,255,0.75)') : null}
                    </>
                  );
                })()}
              </>
            ) : null}

            <line x1="500" y1="120" x2="500" y2="710" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
            <circle cx="500" cy="355" r="10" fill="rgba(141,163,155,0.9)" />
          </svg>
        </>
      ) : null}
      <div className="camera-stage-scrim" />
      <div className="relative z-10 flex h-full min-h-[18rem] flex-col justify-between gap-xl">
        <div className="flex items-start justify-between gap-md">
          <Badge className="backdrop-blur-sm" variant="muted">
            {resolvedLabel}
          </Badge>
          <Badge variant={status === 'unavailable' ? 'muted' : 'accent'}>
            {cameraPreviewEnabled
              ? 'Local preview'
              : cameraUplinkEnabled
                ? relayStatus === 'streaming'
                  ? 'Camera feed live'
                  : 'Camera feed'
                : 'Preview off'}
          </Badge>
        </div>
        <div className="space-y-md">
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="muted">build {BUILD_ID}</Badge>
          </div>
          {alert ? (
            <LocalIntegrationAlert body={alert.body} title={alert.title} />
          ) : null}
          <h2 className="type-display font-display max-w-2xl text-[clamp(2.5rem,4vw,4.5rem)]">
            {resolvedTitle}
          </h2>
          <p className="type-body max-w-2xl text-text-secondary">
            {alignmentCopy ? (
              <>
                <span className="font-semibold text-text-primary">{alignmentCopy.title}.</span>{' '}
                {alignmentCopy.body}
              </>
            ) : (
              resolvedBody
            )}
          </p>
        </div>
      </div>
    </Panel>
  );
}
