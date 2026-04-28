import type { Garment, GarmentCategory } from '@/types/catalog';

import { GarmentCard } from '@/features/shopper/catalog/GarmentCard';

type GarmentGridProps = {
  categories: GarmentCategory[];
  garments: Garment[];
  onSelect: (garmentId: string) => void;
  selectedGarmentId?: string;
};

export function GarmentGrid({
  categories,
  garments,
  onSelect,
  selectedGarmentId,
}: GarmentGridProps) {
  const categoryLabels = new Map(
    categories.map((category) => [category.id, category.label]),
  );

  if (garments.length === 0) {
    return (
      <div className="rounded-panel border border-border-subtle bg-surface-overlay p-xl">
        <div className="space-y-sm">
          <p className="shopper-kicker">Collection</p>
          <h3 className="type-display font-display text-[clamp(2.4rem,3.2vw,3.8rem)]">
            Choose a garment
          </h3>
          <p className="type-body text-text-secondary">
            Select one look to begin the live fitting view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-xl md:grid-cols-2 xl:grid-cols-3">
      {garments.map((garment) => (
        <GarmentCard
          categoryLabel={categoryLabels.get(garment.categoryId) ?? 'Collection'}
          garment={garment}
          key={garment.id}
          onSelect={onSelect}
          selected={selectedGarmentId === garment.id}
        />
      ))}
    </div>
  );
}
