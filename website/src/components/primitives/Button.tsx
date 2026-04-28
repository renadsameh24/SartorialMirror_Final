import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { focusRing } from '@/components/primitives/focusRing';

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
type ButtonSize = 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent text-text-inverse shadow-[0_18px_34px_rgba(0,0,0,0.16)] hover:border-accent hover:brightness-105',
  secondary:
    'border-border-strong bg-surface-overlay text-text-primary hover:border-border-strong hover:bg-surface-strong',
  quiet:
    'border-border-subtle bg-transparent text-text-secondary hover:border-border-strong hover:bg-surface-ghost hover:text-text-primary',
  destructive:
    'border-destructive bg-destructive text-text-inverse hover:brightness-105',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'gap-sm px-[var(--control-pad-inline)] py-sm',
  lg: 'gap-md px-[calc(var(--control-pad-inline)+8px)] py-md',
};

export function Button({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        focusRing(),
        'inline-flex min-h-control items-center justify-center rounded-control border text-label shadow-panel transition-[background-color,border-color,color,box-shadow,transform] duration-standard disabled:cursor-not-allowed disabled:opacity-60',
        sizeClasses[size],
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
