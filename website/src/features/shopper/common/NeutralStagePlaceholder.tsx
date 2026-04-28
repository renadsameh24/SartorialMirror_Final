import { Badge, Panel } from '@/components/primitives';

type NeutralStagePlaceholderProps = {
  body: string;
  label: string;
  title: string;
};

export function NeutralStagePlaceholder({
  body,
  label,
  title,
}: NeutralStagePlaceholderProps) {
  return (
    <Panel className="shopper-stage-placeholder min-h-[22rem]" tone="strong">
      <div className="flex h-full min-h-[18rem] flex-col justify-between gap-xl">
        <div className="flex items-start justify-between gap-md">
          <Badge className="backdrop-blur-sm" variant="muted">
            {label}
          </Badge>
          <div
            aria-hidden="true"
            className="h-14 w-14 rounded-full border border-border-subtle bg-[radial-gradient(circle,rgba(231,217,188,0.14),rgba(231,217,188,0.02)_58%,transparent_70%)]"
          />
        </div>
        <div className="space-y-md">
          <h2 className="type-display font-display max-w-2xl text-[clamp(2.5rem,4vw,4.5rem)]">
            {title}
          </h2>
          <p className="type-body max-w-2xl text-text-secondary">{body}</p>
        </div>
      </div>
    </Panel>
  );
}
