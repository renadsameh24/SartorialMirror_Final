import { render, screen } from '@testing-library/react';

import { Badge } from '@/components/primitives/Badge';
import { Divider } from '@/components/primitives/Divider';
import { Panel } from '@/components/primitives/Panel';
import { PanelHeader } from '@/components/primitives/PanelHeader';

describe('Surface primitives', () => {
  it('renders panel and panel header as generic structural surfaces', () => {
    render(
      <Panel aria-label="Example panel" tone="subtle">
        <PanelHeader support="Generic support" title="Generic title" />
      </Panel>,
    );

    expect(screen.getByLabelText(/example panel/i)).toHaveAttribute(
      'data-tone',
      'subtle',
    );
    expect(screen.getByText(/generic title/i)).toBeInTheDocument();
    expect(screen.getByText(/generic support/i)).toBeInTheDocument();
  });

  it('renders badge variants and divider orientations without domain semantics', () => {
    render(
      <div>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="muted">Muted</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="operational">Operational</Badge>
        <Divider data-testid="horizontal-divider" orientation="horizontal" />
        <Divider data-testid="vertical-divider" orientation="vertical" />
      </div>,
    );

    expect(screen.getByText(/neutral/i)).toHaveAttribute(
      'data-variant',
      'neutral',
    );
    expect(screen.getByText(/operational/i)).toHaveAttribute(
      'data-variant',
      'operational',
    );
    expect(screen.getByTestId('horizontal-divider')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
    expect(screen.getByTestId('vertical-divider')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });
});
