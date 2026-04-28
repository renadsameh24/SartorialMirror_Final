import { AdminSummaryCard } from '@/features/admin/dashboard/AdminSummaryCard';
import type { DashboardSummaryCard } from '@/features/admin/readModels/dashboard';

type CatalogSummaryPanelProps = {
  active?: boolean;
  onOpen: () => void;
  onSelect: () => void;
  summary: DashboardSummaryCard;
};

export function CatalogSummaryPanel({
  active = false,
  onOpen,
  onSelect,
  summary,
}: CatalogSummaryPanelProps) {
  return (
    <AdminSummaryCard
      actionLabel={summary.actionLabel}
      active={active}
      facts={summary.facts}
      onAction={() => {
        onSelect();
        onOpen();
      }}
      status={summary.status}
      support={summary.support}
      title={summary.title}
    />
  );
}
