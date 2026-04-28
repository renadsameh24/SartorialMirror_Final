import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import { CameraStageSurface } from '@/features/shopper/camera/CameraStageSurface';
import { StageHeroButton, StageHeroCard } from '@/features/shopper/common/StageHeroCard';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';
import { readDegradedState } from '@/lib/runtime/readModels';
import { useAdminStore } from '@/stores/admin/adminStore';
import { selectCanStartSession } from '@/stores/session/selectors';
import { useSessionStore } from '@/stores/session/sessionStore';
import { useUiModeStore } from '@/stores/uiMode/uiModeStore';

type IdleScreenModel = {
  canStartSession: boolean;
  degraded: ReturnType<typeof readDegradedState>;
  requestAdminAccess: () => void;
  startSession: () => void;
};

export function useIdleScreenModel(): IdleScreenModel {
  const canStartSession = useSessionStore(selectCanStartSession);
  const startSession = useSessionStore((state) => state.startSession);
  const setAccess = useAdminStore((state) => state.setAccess);
  const setActiveSection = useAdminStore((state) => state.setActiveSection);
  const setMode = useUiModeStore((state) => state.setMode);

  return {
    canStartSession,
    degraded: readDegradedState(),
    requestAdminAccess: () => {
      setAccess('requested');
      setActiveSection('dashboard');
      setMode('admin');
    },
    startSession: () => startSession('keyboard'),
  };
}

export function createIdleScreenLayout({
  canStartSession,
  degraded,
  requestAdminAccess,
  startSession,
}: IdleScreenModel): ShopperPhaseLayout {
  return {
    band: (
      <ShopperBandHeader
        action={<Badge variant="accent">Local session reset</Badge>}
        phaseLabel="Welcome"
        support="A private upper-body fitting experience with local processing and a deterministic reset at session close."
        title="A more considered fitting experience."
        displayTitle
      />
    ),
    stage: (
      <div className="flex h-full w-full flex-col justify-end gap-xl">
        <CameraStageSurface
          body="When the kiosk is ready, your reflection and selected look take over this stage with minimal distraction."
          label="Mirror stage"
          title="Step closer when you are ready."
        />
        <StageHeroCard
          action={
            <StageHeroButton disabled={!canStartSession} onClick={startSession}>
              Start Session
            </StageHeroButton>
          }
          body="Begin a private fitting. Measurements, selections, and fit guidance stay on this device for this visit only, then clear automatically."
          displayTitle
          eyebrow="Local-first fitting"
          title="Discover the collection in mirror."
        />
      </div>
    ),
    rail: (
      <div className="space-y-lg">
        <Panel className="shopper-rail-card" tone="default">
          <div className="space-y-lg">
            <PanelHeader
              action={<Badge variant="muted">Privacy</Badge>}
              support="Keyboard and mouse are always supported."
              title="Before you begin"
            />
            <Divider />
            <p className="type-body text-text-secondary">
              Start from the stage, settle into view, then browse a small edited collection built for fast live fitting.
            </p>
            {degraded.primaryGuidance ? (
              <p className="type-body text-text-secondary">
                {degraded.primaryGuidance.body}
              </p>
            ) : null}
            <div className="pt-sm">
              <Button onClick={requestAdminAccess} variant="quiet">
                Staff Access
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    ),
    overlayTop: <Badge variant="muted">Measurements clear after every session</Badge>,
    overlayBottom: null,
  };
}
