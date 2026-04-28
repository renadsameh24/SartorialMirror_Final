import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';
import type { AdminSection } from '@/types/admin';

const SECTION_ITEMS: Array<{
  description: string;
  id: AdminSection;
  label: string;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Local device summary and admin navigation.',
  },
  {
    id: 'catalog',
    label: 'Catalog',
    description: 'Local garment curation and snapshot controls.',
  },
  {
    id: 'calibration',
    label: 'Calibration',
    description: 'Staff calibration status, prerequisites, and controls.',
  },
  {
    id: 'logs',
    label: 'Logs',
    description: 'Recent local operational warnings and errors.',
  },
];

type AdminSectionNavProps = {
  activeSection: AdminSection;
  disabled?: boolean;
  onSelect?: (section: AdminSection) => void;
};

export function AdminSectionNav({
  activeSection,
  disabled = false,
  onSelect,
}: AdminSectionNavProps) {
  return (
    <Panel tone="default">
      <div className="space-y-lg">
        <PanelHeader
          action={
            <Badge variant={disabled ? 'muted' : 'operational'}>
              {disabled ? 'Locked' : 'Sections'}
            </Badge>
          }
          support="Operational sections stay separate from the shopper flow."
          title="Admin Surface"
        />
        <Divider />

        <div className="space-y-sm" role="list" aria-label="Admin sections">
          {SECTION_ITEMS.map((section) => {
            const active = section.id === activeSection;

            return (
              <Button
                key={section.id}
                aria-current={active ? 'page' : undefined}
                className={[
                  'w-full justify-start rounded-panel border px-lg py-md text-left',
                  active && !disabled ? 'border-accent text-accent' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={disabled}
                onClick={() => onSelect?.(section.id)}
                variant={active && !disabled ? 'secondary' : 'quiet'}
              >
                <span className="flex flex-col items-start gap-xs">
                  <span className="type-label">{section.label}</span>
                  <span className="type-body text-text-secondary">
                    {section.description}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
