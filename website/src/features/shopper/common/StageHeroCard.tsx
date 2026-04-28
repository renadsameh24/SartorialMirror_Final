import type { ComponentProps, ReactNode } from 'react';

import { Button, Panel } from '@/components/primitives';

type StageHeroCardProps = {
  action?: ReactNode;
  body: string;
  displayTitle?: boolean;
  eyebrow?: string;
  title: string;
};

export function StageHeroCard({
  action,
  body,
  displayTitle = false,
  eyebrow,
  title,
}: StageHeroCardProps) {
  return (
    <Panel className="shopper-hero-card max-w-3xl" tone="subtle">
      <div className="space-y-lg">
        {eyebrow ? (
          <p className="shopper-kicker">{eyebrow}</p>
        ) : null}
        <div className="space-y-md">
          <h2
            className={[
              displayTitle ? 'type-display font-display' : 'type-heading',
              'max-w-2xl text-balance',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {title}
          </h2>
          <p className="type-body max-w-2xl text-text-secondary">{body}</p>
        </div>
        {action ? <div className="flex flex-wrap items-center gap-sm">{action}</div> : null}
      </div>
    </Panel>
  );
}

export function StageHeroButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button size="lg" variant="primary" {...props}>
      {children}
    </Button>
  );
}
