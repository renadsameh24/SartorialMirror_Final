import { Badge, Divider, Panel, PanelHeader } from '@/components/primitives';
import { StageHeroCard } from '@/features/shopper/common/StageHeroCard';
import { ShopperBandHeader } from '@/features/shopper/common/ShopperBandHeader';
import type { ShopperPhaseLayout } from '@/features/shopper/session/shopperPhaseLayout';

export function createSessionEndConfirmationLayout(): ShopperPhaseLayout {
  return {
    band: (
      <ShopperBandHeader
        action={<Badge variant="muted">Confirmation</Badge>}
        phaseLabel="Session Ended"
        support="The kiosk has cleared the active fitting data and is preparing the welcome state again."
        title="Your fitting has been cleared."
      />
    ),
    stage: (
      <StageHeroCard
        body="Measurements, garment selections, and fit guidance have been removed from this device."
        displayTitle
        eyebrow="Private reset"
        title="Session complete."
      />
    ),
    rail: (
      <Panel className="shopper-rail-card" tone="subtle">
        <div className="space-y-lg">
          <PanelHeader
            action={<Badge variant="muted">Privacy</Badge>}
            support="No garment, fit, or measurement details remain from the previous fitting."
            title="What happens next"
          />
          <Divider />
          <p className="type-body text-text-secondary">
            The welcome screen returns automatically after this brief confirmation.
          </p>
        </div>
      </Panel>
    ),
    overlayTop: null,
    overlayBottom: null,
  };
}
