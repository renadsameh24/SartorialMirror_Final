import { AdminSummaryCard } from '@/features/admin/dashboard/AdminSummaryCard';
import type { DashboardSummaryCard } from '@/features/admin/readModels/dashboard';

type CalibrationSummaryPanelProps = {
  active?: boolean;
  onOpen: () => void;
  onSelect: () => void;
  summary: DashboardSummaryCard;
};

export function CalibrationSummaryPanel({
  active = false,
  onOpen,
  onSelect,
  summary,
}: CalibrationSummaryPanelProps) {
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
