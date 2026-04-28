import { AdminSummaryCard } from '@/features/admin/dashboard/AdminSummaryCard';
import type { DashboardSummaryCard } from '@/features/admin/readModels/dashboard';

type HealthSummaryPanelProps = {
  active?: boolean;
  onSelect: () => void;
  summary: DashboardSummaryCard;
};

export function HealthSummaryPanel({
  active = false,
  onSelect,
  summary,
}: HealthSummaryPanelProps) {
  return (
    <AdminSummaryCard
      actionLabel={summary.actionLabel}
      active={active}
      facts={summary.facts}
      onAction={onSelect}
      status={summary.status}
      support={summary.support}
      title={summary.title}
    />
  );
}
