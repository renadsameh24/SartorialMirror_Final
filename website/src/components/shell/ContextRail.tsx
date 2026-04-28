import type { ComponentPropsWithoutRef } from 'react';

type ContextRailProps = ComponentPropsWithoutRef<'aside'>;

export function ContextRail({
  children,
  className,
  ...props
}: ContextRailProps) {
  return (
    <aside
      className={['context-rail', className].filter(Boolean).join(' ')}
      data-slot="context-rail"
      {...props}
    >
      {children}
    </aside>
  );
}
