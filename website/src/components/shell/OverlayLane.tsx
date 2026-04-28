import type { ComponentPropsWithoutRef } from 'react';

type OverlayLaneProps = ComponentPropsWithoutRef<'div'> & {
  position: 'top' | 'bottom';
};

export function OverlayLane({
  children,
  className,
  position,
  ...props
}: OverlayLaneProps) {
  return (
    <div
      className={[
        'overlay-lane',
        position === 'top' ? 'overlay-lane-top' : 'overlay-lane-bottom',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-position={position}
      data-slot="overlay-lane"
      {...props}
    >
      {children}
    </div>
  );
}
