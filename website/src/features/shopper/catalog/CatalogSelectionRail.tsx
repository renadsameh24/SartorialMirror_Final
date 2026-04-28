import type { Garment, GarmentSelection } from '@/types/catalog';

import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import { VariantSelector } from '@/features/shopper/common/VariantSelector';
import type { CatalogReadinessReadModel, DegradedReadModel } from '@/lib/runtime/readModels';

type CatalogSelectionRailProps = {
  catalogReadiness: CatalogReadinessReadModel;
  degraded: DegradedReadModel;
  garment: Garment | null;
  onColorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onTryOn: () => void;
  selection: GarmentSelection | null;
  selectionReady: boolean;
};

export function CatalogSelectionRail({
  catalogReadiness,
  degraded,
  garment,
  onColorChange,
  onSizeChange,
  onTryOn,
  selection,
  selectionReady,
}: CatalogSelectionRailProps) {
  const colorOptions =
    garment?.availableColors.map((color) => ({
      disabled: color.availability !== 'available',
      swatchHex: color.swatchHex,
      value: color.id,
      label: color.label,
    })) ?? [];
  const sizeOptions =
    garment?.availableSizes.map((size) => ({
      disabled: size.availability !== 'available',
      value: size.code,
      label: size.label,
    })) ?? [];
  const unavailable = catalogReadiness.state === 'unavailable';

  return (
    <div className="space-y-lg">
      <Panel className="shopper-rail-card" tone="default">
        <div className="space-y-lg">
          <PanelHeader
            action={
              <Badge variant={selectionReady && !unavailable ? 'accent' : 'muted'}>
                {selectionReady && !unavailable ? 'Ready for mirror' : 'Selection'}
              </Badge>
            }
            support={
              garment
                ? 'Refine the silhouette here, then move straight into the mirror.'
                : 'Choose one look to continue.'
            }
            title={garment?.name ?? 'Choose a look'}
          />
          <Divider />
          {garment ? (
            <div className="space-y-lg">
              <div className="rounded-panel border border-border-subtle bg-surface-overlay p-lg">
                <p className="shopper-kicker text-text-primary">Selected garment</p>
                <p className="mt-sm text-[1.05rem] font-semibold text-text-primary">
                  {garment.name}
                </p>
                <p className="mt-xs type-body text-text-secondary">
                  {garment.description ??
                    'A small local edit, selected for quick styling and live fit guidance.'}
                </p>
              </div>
              <p className="type-body text-text-secondary">
                Refine size and finish here, then move directly into the mirror without leaving the current session.
              </p>
              <VariantSelector
                label="Size"
                onChange={onSizeChange}
                options={sizeOptions}
                value={selection?.sizeCode}
              />
              <VariantSelector
                label="Color"
                onChange={onColorChange}
                options={colorOptions}
                value={selection?.colorId}
              />
            </div>
          ) : (
            <p className="type-body text-text-secondary">
              Select one garment to open sizing and finish choices.
            </p>
          )}
          <Button
            className="w-full"
            disabled={!selectionReady || unavailable}
            onClick={onTryOn}
            size="lg"
            variant="primary"
          >
            Enter Mirror View
          </Button>
          {unavailable ? (
            <p className="type-body text-text-secondary">
              The collection is briefly unavailable. Available looks will return as soon as the local
              snapshot settles.
            </p>
          ) : degraded.primaryGuidance ? (
            <p className="type-body text-text-secondary">
              {degraded.primaryGuidance.body}
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
