import { Badge, Panel, PanelHeader } from '@/components/primitives';
import type { CatalogCurationSummaryReadModel } from '@/features/admin/readModels/catalog';

type CatalogSummaryStripProps = {
  summary: CatalogCurationSummaryReadModel;
};

export function CatalogSummaryStrip({
  summary,
}: CatalogSummaryStripProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant="operational">{summary.status}</Badge>}
          support={summary.support}
          title={summary.title}
        />
        <div className="flex flex-wrap gap-sm">
          {summary.facts.map((fact) => (
            <Badge key={fact} variant="muted">
              {fact}
            </Badge>
          ))}
        </div>
      </div>
    </Panel>
  );
}
