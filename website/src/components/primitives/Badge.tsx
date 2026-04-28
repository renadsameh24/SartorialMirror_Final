import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'muted'
  | 'destructive'
  | 'operational';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-surface-ghost text-text-primary',
  accent: 'border-accent bg-surface-ghost text-accent',
  muted: 'border-border-subtle bg-surface-ghost text-text-secondary',
  destructive: 'border-destructive bg-surface-ghost text-destructive',
  operational: 'border-border-strong bg-surface-overlay text-text-primary',
};

export function Badge({
  children,
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-badge border px-[12px] py-[6px] text-[0.8rem] font-semibold leading-none',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-variant={variant}
      {...props}
    >
      {children}
    </span>
  );
}
