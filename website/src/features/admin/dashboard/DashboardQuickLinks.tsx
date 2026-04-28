import { Button, Panel, PanelHeader } from '@/components/primitives';
import type { AdminSection } from '@/types/admin';

type DashboardQuickLinksProps = {
  onOpenSection: (section: AdminSection) => void;
};

const QUICK_LINKS: Array<{ label: string; section: AdminSection }> = [
  { label: 'Open Catalog', section: 'catalog' },
  { label: 'Open Calibration', section: 'calibration' },
  { label: 'Open Logs', section: 'logs' },
];

export function DashboardQuickLinks({
  onOpenSection,
}: DashboardQuickLinksProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          support="Jump directly into the local operational sections."
          title="Quick Links"
        />
        <div className="flex flex-wrap gap-sm">
          {QUICK_LINKS.map((link) => (
            <Button
              key={link.section}
              onClick={() => onOpenSection(link.section)}
              variant="secondary"
            >
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
