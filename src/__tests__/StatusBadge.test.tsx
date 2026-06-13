import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders a human-readable label for each status', () => {
    render(<StatusBadge status="out_for_delivery" />);
    expect(screen.getByText(/out for delivery/i)).toBeInTheDocument();
  });

  it('maps delivered to emerald style', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('emerald');
  });
});
