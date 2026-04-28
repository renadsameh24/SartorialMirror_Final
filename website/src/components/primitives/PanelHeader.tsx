import type { ReactNode } from 'react';

type PanelHeaderProps = {
  action?: ReactNode;
  support?: ReactNode;
  title: ReactNode;
};

export function PanelHeader({ action, support, title }: PanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-md">
      <div className="space-y-xs">
        <div className="text-[1.05rem] font-semibold leading-tight text-text-primary">
          {title}
        </div>
        {support ? (
          <div className="type-body text-text-secondary">{support}</div>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-sm">{action}</div> : null}
    </div>
  );
}
