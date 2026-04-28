import type { ComponentPropsWithoutRef } from 'react';

type ShellBandProps = ComponentPropsWithoutRef<'header'>;

export function ShellBand({ children, className, ...props }: ShellBandProps) {
  return (
    <header
      className={['shell-band', className].filter(Boolean).join(' ')}
      data-slot="shell-band"
      {...props}
    >
      {children}
    </header>
  );
}
