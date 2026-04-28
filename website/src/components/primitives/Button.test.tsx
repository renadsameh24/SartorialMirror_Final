import { render, screen } from '@testing-library/react';

import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';

describe('Button primitives', () => {
  it('renders all button variants with shared focus behavior', () => {
    render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="quiet">Quiet</Button>
        <Button variant="destructive">Destructive</Button>
      </div>,
    );

    expect(screen.getByRole('button', { name: /primary/i })).toHaveClass(
      'focus-ring',
    );
    expect(screen.getByRole('button', { name: /secondary/i })).toHaveClass(
      'focus-ring',
    );
    expect(screen.getByRole('button', { name: /quiet/i })).toHaveClass(
      'focus-ring',
    );
    expect(screen.getByRole('button', { name: /destructive/i })).toHaveClass(
      'focus-ring',
    );
  });

  it('preserves native button semantics for disabled and pressed states', () => {
    render(
      <div>
        <Button aria-pressed>Pressed</Button>
        <Button disabled>Disabled</Button>
        <IconButton aria-label="Quiet icon" variant="quiet">
          I
        </IconButton>
      </div>,
    );

    expect(screen.getByRole('button', { name: /pressed/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /quiet icon/i })).toHaveClass(
      'focus-ring',
    );
  });
});
