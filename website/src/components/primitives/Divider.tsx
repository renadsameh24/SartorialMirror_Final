import type { HTMLAttributes } from 'react';

type DividerOrientation = 'horizontal' | 'vertical';

type DividerProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: DividerOrientation;
};

export function Divider({
  className,
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <div
      aria-orientation={orientation}
      className={[
        orientation === 'horizontal'
          ? 'h-px w-full bg-border-subtle'
          : 'h-full w-px bg-border-subtle',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="separator"
      {...props}
    />
  );
}
