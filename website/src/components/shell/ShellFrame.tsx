import type { ComponentPropsWithoutRef } from 'react';

type ShellFrameProps = ComponentPropsWithoutRef<'div'>;

export function ShellFrame({ children, className, ...props }: ShellFrameProps) {
  return (
    <div
      className={['shell-frame', className].filter(Boolean).join(' ')}
      data-slot="shell-frame"
      {...props}
    >
      {children}
    </div>
  );
}
