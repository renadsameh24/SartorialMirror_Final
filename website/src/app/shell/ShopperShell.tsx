import type { ShellMode } from '@/app/shell/shellMode';
import { ShopperPhaseRenderer } from '@/features/shopper/session/ShopperPhaseRenderer';
import {
  ContextRail,
  OverlayLane,
  ShellBand,
  ShellFrame,
  StageViewport,
} from '@/components/shell';

type ShopperShellProps = {
  onModeChange: (mode: ShellMode) => void;
};

export function ShopperShell({ onModeChange }: ShopperShellProps) {
  void onModeChange;

  return (
    <ShopperPhaseRenderer>
      {(layout) => (
        <ShellFrame className="shopper-shell">
          <ShellBand
            aria-label="Shopper shell band"
            className="shopper-shell-band rounded-shell"
          >
            {layout.band}
          </ShellBand>

          <div className="shopper-shell-row">
            <StageViewport
              aria-label="Protected stage viewport"
              className="shopper-stage rounded-shell"
            >
              <OverlayLane
                aria-label="Top overlay lane"
                className={[
                  'shopper-overlay-lane rounded-overlay',
                  layout.overlayTop ? '' : 'pointer-events-none opacity-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
                position="top"
              >
                {layout.overlayTop}
              </OverlayLane>

              <div className="stage-safe-area">{layout.stage}</div>

              <OverlayLane
                aria-label="Bottom overlay lane"
                className={[
                  'rounded-overlay border border-border-subtle bg-surface-overlay',
                  layout.overlayBottom ? '' : 'pointer-events-none opacity-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
                position="bottom"
              >
                {layout.overlayBottom}
              </OverlayLane>
            </StageViewport>

            <ContextRail
              aria-label="Shopper context rail"
              className="shopper-context-rail rounded-shell"
            >
              {layout.rail}
            </ContextRail>
          </div>
        </ShellFrame>
      )}
    </ShopperPhaseRenderer>
  );
}
