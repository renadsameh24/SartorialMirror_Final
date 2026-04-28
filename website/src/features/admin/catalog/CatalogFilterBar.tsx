import { Badge, Panel, PanelHeader } from '@/components/primitives';

type CatalogFilterBarProps = {
  categories: Array<{ id: string; label: string }>;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: 'all' | 'disabled' | 'enabled') => void;
  statusFilter: 'all' | 'disabled' | 'enabled';
};

export function CatalogFilterBar({
  categories,
  categoryFilter,
  onCategoryChange,
  onStatusChange,
  statusFilter,
}: CatalogFilterBarProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="muted">Filters</Badge>}
          support="Filter the local curation list by category or enabled state."
          title="Catalog Filters"
        />
        <div className="flex flex-wrap gap-sm">
          <label className="flex flex-col gap-xs">
            <span className="type-label text-text-secondary">Category</span>
            <select
              aria-label="Filter catalog by category"
              className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
              onChange={(event) => onCategoryChange(event.target.value)}
              value={categoryFilter}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-xs">
            <span className="type-label text-text-secondary">Status</span>
            <select
              aria-label="Filter catalog by status"
              className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
              onChange={(event) =>
                onStatusChange(event.target.value as 'all' | 'disabled' | 'enabled')
              }
              value={statusFilter}
            >
              <option value="all">All garments</option>
              <option value="enabled">Enabled only</option>
              <option value="disabled">Disabled only</option>
            </select>
          </label>
        </div>
      </div>
    </Panel>
  );
}
