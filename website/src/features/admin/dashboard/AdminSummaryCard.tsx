import { Badge, Button, Divider, Panel, PanelHeader } from '@/components/primitives';

type AdminSummaryCardProps = {
  actionLabel: string;
  active?: boolean;
  facts: string[];
  onAction: () => void;
  status: string;
  support: string;
  title: string;
};

export function AdminSummaryCard({
  actionLabel,
  active = false,
  facts,
  onAction,
  status,
  support,
  title,
}: AdminSummaryCardProps) {
  return (
    <Panel tone={active ? 'strong' : 'default'}>
      <div className="space-y-lg">
        <PanelHeader
          action={<Badge variant={active ? 'accent' : 'operational'}>{title}</Badge>}
          support={support}
          title={title}
        />
        <Divider />
        <div className="space-y-sm">
          <p className="type-label text-text-primary">{status}</p>
          <div className="space-y-xs">
            {facts.map((fact) => (
              <p key={fact} className="type-body text-text-secondary">
                {fact}
              </p>
            ))}
          </div>
        </div>
        <Button className="w-full justify-start" onClick={onAction} variant="quiet">
          {actionLabel}
        </Button>
      </div>
    </Panel>
  );
}
