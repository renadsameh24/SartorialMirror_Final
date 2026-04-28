import type { ComponentPropsWithoutRef } from 'react';

type AdminNavRailProps = ComponentPropsWithoutRef<'nav'>;

export function AdminNavRail({
  children,
  className,
  ...props
}: AdminNavRailProps) {
  return (
    <nav
      className={['admin-nav-rail', className].filter(Boolean).join(' ')}
      data-slot="admin-nav-rail"
      {...props}
    >
      {children}
    </nav>
  );
}
