import type { ComponentPropsWithoutRef } from 'react';

type PanelTone = 'default' | 'subtle' | 'strong';

type PanelProps = ComponentPropsWithoutRef<'section'> & {
  tone?: PanelTone;
};

const toneClasses: Record<PanelTone, string> = {
  default: 'border-border bg-surface-panel shadow-panel',
  subtle: 'border-border-subtle bg-surface-overlay shadow-overlay',
  strong: 'border-border-strong bg-surface-strong shadow-float',
};

export function Panel({
  children,
  className,
  tone = 'default',
  ...props
}: PanelProps) {
  return (
    <section
      className={['rounded-panel border p-xl', toneClasses[tone], className]
        .filter(Boolean)
        .join(' ')}
      data-tone={tone}
      {...props}
    >
      {children}
    </section>
  );
}
