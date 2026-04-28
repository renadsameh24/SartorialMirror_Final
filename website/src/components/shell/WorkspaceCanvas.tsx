import type { ComponentPropsWithoutRef } from 'react';

type WorkspaceCanvasProps = ComponentPropsWithoutRef<'main'>;

export function WorkspaceCanvas({
  children,
  className,
  ...props
}: WorkspaceCanvasProps) {
  return (
    <main
      className={['workspace-canvas', className].filter(Boolean).join(' ')}
      data-slot="workspace-canvas"
      {...props}
    >
      {children}
    </main>
  );
}
