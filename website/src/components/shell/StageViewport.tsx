import type { ComponentPropsWithoutRef } from 'react';

type StageViewportProps = ComponentPropsWithoutRef<'section'>;

export function StageViewport({
  children,
  className,
  ...props
}: StageViewportProps) {
  return (
    <section
      className={['stage-viewport', className].filter(Boolean).join(' ')}
      data-slot="stage-viewport"
      {...props}
    >
      {children}
    </section>
  );
}
