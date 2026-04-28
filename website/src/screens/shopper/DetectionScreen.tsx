import { useEffect } from 'react';

import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import { CameraStageSurface } from '@/features/shopper/camera/CameraStageSurface';
import { StageHeroCard } from '@/features/shopper/common/StageHeroCard';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import { DetectionReadinessChecklist } from '@/features/shopper/detection/DetectionReadinessChecklist';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import { readDegradedState, readDetectionReadiness } from '@/lib/runtime/readModels';
import { selectCanEndSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useCatalogStore } from '@/stores/catalog/catalogStore';
import { selectCatalogStatus } from '@/stores/catalog/selectors';
import { useDegradedStore } from '@/stores/degraded/degradedStore';
import { useSystemHealthStore } from '@/stores/systemHealth/systemHealthStore';

type DetectionScreenModel = {
  canEndSession: boolean;
  degraded: ReturnType<typeof readDegradedState>;
  detection: ReturnType<typeof readDetectionReadiness>;
  endSession: () => void;
};

function detectionCopy(state: DetectionScreenModel['detection']['state']) {
  switch (state) {
    case 'waitingForUser':
      return {
        overlay: 'Awaiting position',
        stageBody: 'Step back into view to continue.',
        stageTitle: 'Return to the mirror line.',
      };
    case 'readyToAdvance':
      return {
        overlay: 'Ready',
        stageBody: 'Position is settled. The collection opens immediately.',
        stageTitle: 'You are aligned.',
      };
    case 'positioning':
      return {
        overlay: 'Refining view',
        stageBody: 'Hold position while detection settles.',
        stageTitle: 'Hold a calm, centered stance.',
      };
    default:
      return {
        overlay: 'Detection',
        stageBody: 'Stand centered in the frame to continue.',
        stageTitle: 'Step into view.',
      };
  }
}

export function useDetectionScreenModel(active: boolean): DetectionScreenModel {
  const canEndSession = useSessionStore(selectCanEndSession);
  const endSession = useSessionStore((state) => state.endSession);
  const markDetectionReady = useSessionStore((state) => state.markDetectionReady);

  useCatalogStore(selectCatalogStatus);
  useDegradedStore((state) => state.guidance);
  useDegradedStore((state) => state.issues);
  useSystemHealthStore((state) => state.operationalStatuses);

  const detection = readDetectionReadiness();
  const degraded = readDegradedState();

  useEffect(() => {
    if (active && detection.readyToAdvance) {
      markDetectionReady();
    }
  }, [active, detection.readyToAdvance, markDetectionReady]);

  return {
    canEndSession,
    degraded,
    detection,
    endSession,
  };
}

export function createDetectionScreenLayout({
  canEndSession,
  degraded,
  detection,
  endSession,
}: DetectionScreenModel): ShopperPhaseLayout {
  const copy = detectionCopy(detection.state);
  const guidanceBody =
    detection.primaryGuidance?.body ??
    degraded.primaryGuidance?.body ??
    (detection.state === 'waitingForUser'
      ? 'Step back into view to continue.'
      : 'Hold position while detection settles.');

  return {
    band: (
      <ShopperBandHeader
        action={
          <Button disabled={!canEndSession} onClick={endSession} variant="quiet">
            End Session
          </Button>
        }
        phaseLabel="Detection"
        support="Keep shoulders square to the display while the local session settles and prepares the mirror view."
        title="Position for a precise fitting."
      />
    ),
    stage: (
      <div className="flex h-full w-full flex-col justify-end gap-xl">
        <CameraStageSurface
          body="The mirror stage is reading your position, distance, and posture so the fitting view can open cleanly."
          label="Positioning view"
          title="Stand centered and let the view settle."
        />
        <div className="max-w-3xl">
          <StageHeroCard
            body={guidanceBody}
            eyebrow={copy.overlay}
            title={copy.stageTitle}
          />
        </div>
      </div>
    ),
    rail: (
      <div className="space-y-lg">
        <Panel tone="default">
          <div className="space-y-lg">
            <PanelHeader
              action={<Badge variant="muted">{copy.overlay}</Badge>}
              support={guidanceBody}
              title="Readiness guide"
            />
            <Divider />
            <DetectionReadinessChecklist state={detection.state} />
            {degraded.primaryGuidance ? (
              <p className="type-body text-text-secondary">
                {degraded.primaryGuidance.body}
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    ),
    overlayTop: <Badge variant="muted">{copy.overlay}</Badge>,
    overlayBottom: (
      <Badge variant="muted">
        {detection.blocking ? guidanceBody : 'No further action is needed beyond holding position.'}
      </Badge>
    ),
  };
}
