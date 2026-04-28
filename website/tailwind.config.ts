import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          canvas: 'var(--color-surface-canvas)',
          panel: 'var(--color-surface-panel)',
          elevated: 'var(--color-surface-elevated)',
          overlay: 'var(--color-surface-overlay)',
          ghost: 'var(--color-surface-ghost)',
          strong: 'var(--color-surface-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
        },
        accent: 'var(--color-accent)',
        'accent-contrast': 'var(--color-accent-contrast)',
        destructive: 'var(--color-destructive)',
        focus: 'var(--color-focus)',
      },
      fontFamily: {
        ui: ['var(--font-family-ui)'],
        display: ['var(--font-family-display)'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      fontSize: {
        label: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        heading: ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        display: ['56px', { lineHeight: '1.05', fontWeight: '600' }],
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
      },
      borderRadius: {
        shell: 'var(--radius-shell)',
        panel: 'var(--radius-panel)',
        control: 'var(--radius-control)',
        badge: 'var(--radius-badge)',
        overlay: 'var(--radius-overlay)',
      },
      boxShadow: {
        shell: 'var(--shadow-shell)',
        panel: 'var(--shadow-panel)',
        overlay: 'var(--shadow-overlay)',
        float: 'var(--shadow-float)',
      },
      minHeight: {
        control: 'var(--control-min-height)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        standard: 'var(--motion-standard)',
        slow: 'var(--motion-slow)',
        shell: 'var(--motion-shell-enter)',
        overlay: 'var(--motion-overlay-enter)',
      },
    },
  },
  plugins: [],
};

export default config;
