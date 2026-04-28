import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { focusRing } from '@/components/primitives/focusRing';

type IconButtonVariant = 'secondary' | 'quiet' | 'destructive';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  secondary:
    'border-border-strong bg-surface-overlay text-text-primary hover:border-border-strong hover:bg-surface-strong',
  quiet:
    'border-transparent bg-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-ghost hover:text-text-primary',
  destructive:
    'border-destructive bg-destructive text-text-inverse hover:brightness-105',
};

export function IconButton({
  children,
  className,
  type = 'button',
  variant = 'secondary',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={[
        focusRing(),
        'inline-flex min-h-control min-w-[var(--control-min-height)] items-center justify-center rounded-control border text-label shadow-panel transition-colors duration-standard',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
