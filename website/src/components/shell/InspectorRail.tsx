import type { ComponentPropsWithoutRef } from 'react';

type InspectorRailProps = ComponentPropsWithoutRef<'aside'>;

export function InspectorRail({
  children,
  className,
  ...props
}: InspectorRailProps) {
  return (
    <aside
      className={['inspector-rail', className].filter(Boolean).join(' ')}
      data-slot="inspector-rail"
      {...props}
    >
      {children}
    </aside>
  );
}
