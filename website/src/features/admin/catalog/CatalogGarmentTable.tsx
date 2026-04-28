import { Badge, Panel, PanelHeader } from '@/components/primitives';
import type { AdminCatalogWorkspaceReadModel } from '@/features/admin/readModels/catalog';

type CatalogGarmentTableProps = {
  onSelect: (garmentId: string) => void;
  rows: AdminCatalogWorkspaceReadModel['rows'];
  selectedGarmentId?: string | null;
};

export function CatalogGarmentTable({
  onSelect,
  rows,
  selectedGarmentId,
}: CatalogGarmentTableProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="operational">{rows.length} garments</Badge>}
          support="Select a garment row to open its curation controls."
          title="Catalog Curation"
        />
        <div className="space-y-sm">
          {rows.map((row) => (
            <button
              key={row.garmentId}
              className={[
                'focus-ring w-full rounded-panel border px-lg py-md text-left',
                row.garmentId === selectedGarmentId
                  ? 'border-accent bg-surface-strong'
                  : 'border-border-subtle bg-surface-overlay',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(row.garmentId)}
              type="button"
            >
              <div className="grid gap-sm lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,1.4fr)_minmax(0,1.2fr)]">
                <div>
                  <p className="type-label text-text-primary">{row.name}</p>
                  <p className="type-body text-text-secondary">{row.categoryLabel}</p>
                </div>
                <div className="type-body text-text-secondary">{row.categoryLabel}</div>
                <div>
                  <Badge variant={row.enabled ? 'accent' : 'muted'}>{row.statusLabel}</Badge>
                </div>
                <div className="type-body text-text-secondary">Order {row.sortOrder}</div>
                <div className="type-body text-text-secondary">{row.defaultVariantSummary}</div>
                <div className="type-body text-text-secondary">
                  {row.defaultSizeColorSummary}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
