import type { Garment } from '@/types/catalog';

import { Badge, Panel } from '@/components/primitives';

type GarmentCardProps = {
  categoryLabel: string;
  garment: Garment;
  onSelect: (garmentId: string) => void;
  selected: boolean;
};

export function GarmentCard({
  categoryLabel,
  garment,
  onSelect,
  selected,
}: GarmentCardProps) {
  return (
    <button
      className="focus-ring w-full rounded-panel text-left"
      onClick={() => onSelect(garment.id)}
      type="button"
    >
      <Panel
        className={[
          'shopper-garment-card h-full min-h-[18rem] overflow-hidden p-0 transition-all duration-standard',
          selected
            ? 'border-accent shadow-[0_24px_52px_rgba(0,0,0,0.24)]'
            : 'hover:-translate-y-0.5 hover:border-border-strong',
        ]
          .filter(Boolean)
          .join(' ')}
        data-selected={selected}
        tone={selected ? 'strong' : 'default'}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="shopper-garment-card-media relative flex min-h-[8.5rem] items-start justify-between gap-md p-xl">
            {garment.heroImageUrl ? (
              <img
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-[12rem] w-[12rem] select-none opacity-60 [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.35))]"
                src={garment.heroImageUrl}
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-sm">
              <Badge variant={selected ? 'accent' : 'muted'}>{categoryLabel}</Badge>
              {selected ? <Badge variant="accent">In view</Badge> : null}
            </div>
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-text-muted">
              Upper-body
            </p>
          </div>

          <div className="flex h-full flex-col justify-between gap-lg p-xl pt-lg">
            <div className="space-y-sm">
              <div className="space-y-xs">
                <h3 className="font-display text-[1.7rem] leading-tight text-text-primary">
                  {garment.name}
                </h3>
                <p className="type-body text-text-secondary">
                  {garment.description ??
                    'Prepared for a quick private fitting with live size and color changes.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-md border-t border-border-subtle pt-lg">
              <p className="type-label text-text-secondary">
                {garment.availableSizes.length} sizes
              </p>
              <p className="type-label text-text-secondary">
                {garment.availableColors.length} finishes
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </button>
  );
}
