import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { AdminCatalogCuration } from '@/types/adminCatalog';
import type { AdminCatalogInspectorReadModel } from '@/features/admin/readModels/catalog';

type CatalogInspectorEditorProps = {
  draft: AdminCatalogCuration | null;
  hasUnsavedChanges: boolean;
  inspector: AdminCatalogInspectorReadModel | null;
  onChange: (next: AdminCatalogCuration) => void;
  onDiscard: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
};

export function CatalogInspectorEditor({
  draft,
  hasUnsavedChanges,
  inspector,
  onChange,
  onDiscard,
  onMoveDown,
  onMoveUp,
  onSave,
  saveDisabled = false,
}: CatalogInspectorEditorProps) {
  if (!inspector || !draft) {
    return (
      <Panel tone="subtle">
        <div className="space-y-lg">
          <PanelHeader
            action={<Badge variant="muted">No selection</Badge>}
            support="Select a garment row to curate its local metadata here."
            title="Catalog Inspector"
          />
        </div>
      </Panel>
    );
  }

  return (
    <Panel tone="subtle">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant={draft.enabled ? 'accent' : 'muted'}>{draft.enabled ? 'Enabled' : 'Disabled'}</Badge>}
          support={inspector.garment.sku}
          title={inspector.garment.name}
        />
        <Divider />

        <label className="flex items-center justify-between gap-sm">
          <span className="type-label text-text-primary">Enabled</span>
          <input
            aria-label="Enabled"
            checked={draft.enabled}
            onChange={(event) =>
              onChange({
                ...draft,
                enabled: event.target.checked,
              })
            }
            type="checkbox"
          />
        </label>

        <label className="flex flex-col gap-xs">
          <span className="type-label text-text-secondary">Category</span>
          <select
            aria-label="Category assignment"
            className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
            onChange={(event) =>
              onChange({
                ...draft,
                categoryId: event.target.value,
              })
            }
            value={draft.categoryId}
          >
            {inspector.categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-sm">
          <p className="type-label text-text-secondary">Ordering</p>
          <div className="flex flex-wrap items-center gap-sm">
            <Badge variant="muted">Order {draft.sortOrder}</Badge>
            <Button onClick={onMoveUp} variant="quiet">
              Move Up
            </Button>
            <Button onClick={onMoveDown} variant="quiet">
              Move Down
            </Button>
          </div>
        </div>

        <label className="flex flex-col gap-xs">
          <span className="type-label text-text-secondary">Default Variant</span>
          <select
            aria-label="Default variant"
            className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
            onChange={(event) =>
              onChange({
                ...draft,
                defaultVariantId: event.target.value,
              })
            }
            value={draft.defaultVariantId ?? ''}
          >
            {inspector.variantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-xs">
          <span className="type-label text-text-secondary">Default Size</span>
          <select
            aria-label="Default size"
            className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
            onChange={(event) =>
              onChange({
                ...draft,
                defaultSizeCode: event.target.value,
              })
            }
            value={draft.defaultSizeCode ?? ''}
          >
            {inspector.availableSizes.map((size) => (
              <option key={size.code} value={size.code}>
                {size.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-xs">
          <span className="type-label text-text-secondary">Default Color</span>
          <select
            aria-label="Default color"
            className="rounded-control border border-border-strong bg-surface-overlay px-md py-sm text-body"
            onChange={(event) =>
              onChange({
                ...draft,
                defaultColorId: event.target.value,
              })
            }
            value={draft.defaultColorId ?? ''}
          >
            {inspector.availableColors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.label}
              </option>
            ))}
          </select>
        </label>

        {inspector.validationIssues.length > 0 ? (
          <div className="space-y-xs">
            {inspector.validationIssues.map((issue) => (
              <p key={issue} className="type-body text-destructive">
                {issue}
              </p>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-sm">
          <Button disabled={!hasUnsavedChanges} onClick={onDiscard} variant="quiet">
            Discard Changes
          </Button>
          <Button disabled={saveDisabled} onClick={onSave} variant="primary">
            Save Curation
          </Button>
        </div>
      </div>
    </Panel>
  );
}
