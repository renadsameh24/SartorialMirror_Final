import type { ReactNode } from 'react';

type ShopperBandHeaderProps = {
  action?: ReactNode;
  displayTitle?: boolean;
  phaseLabel: string;
  support: string;
  title: string;
};

export function ShopperBandHeader({
  action,
  displayTitle = false,
  phaseLabel,
  support,
  title,
}: ShopperBandHeaderProps) {
  return (
    <div className="shopper-band-header">
      <div className="shopper-band-copy">
        <div className="shopper-band-meta text-[0.72rem] uppercase tracking-[0.28em] text-text-muted">
          <span className="text-accent">The Sartorial Mirror</span>
          <span className="h-px w-8 bg-border-subtle" />
          <span className="shopper-band-phase">{phaseLabel}</span>
        </div>
        <div className="space-y-xs">
          <h1
            className={[
              'max-w-4xl text-balance',
              displayTitle ? 'type-display font-display' : 'type-heading',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </h1>
          <p className="shopper-band-support type-body text-text-secondary">
            {support}
          </p>
        </div>
      </div>

      {action ? (
        <div className="shopper-band-actions">
          <div className="shopper-band-action-cluster">{action}</div>
        </div>
      ) : null}
    </div>
  );
}
