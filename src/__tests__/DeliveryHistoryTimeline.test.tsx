import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeliveryHistoryTimeline from '../components/DeliveryHistoryTimeline';
import type { StatusEvent } from '../types';

const events: StatusEvent[] = [
  { status: 'pending', timestamp: '2026-04-01T08:00:00Z', note: 'Order received' },
  { status: 'assigned', timestamp: '2026-04-01T09:00:00Z', note: 'Assigned to Nuwan' },
  { status: 'in_transit', timestamp: '2026-04-01T10:00:00Z', note: 'Left hub' },
  { status: 'delivered', timestamp: '2026-04-01T12:30:00Z', note: 'Signed for' },
];

describe('DeliveryHistoryTimeline', () => {
  it('renders one row per status event', () => {
    render(<DeliveryHistoryTimeline events={events} />);
    expect(screen.getByText(/order received/i)).toBeInTheDocument();
    expect(screen.getByText(/assigned to nuwan/i)).toBeInTheDocument();
    expect(screen.getByText(/left hub/i)).toBeInTheDocument();
    expect(screen.getByText(/signed for/i)).toBeInTheDocument();
  });

  it('shows newest event first', () => {
    const { container } = render(<DeliveryHistoryTimeline events={events} />);
    const notes = Array.from(container.querySelectorAll('li p')).map((n) => n.textContent ?? '');
    expect(notes[0]).toMatch(/signed for/i);
    expect(notes.at(-1)).toMatch(/order received/i);
  });

  it('renders nothing visible when given an empty list', () => {
    const { container } = render(<DeliveryHistoryTimeline events={[]} />);
    expect(container.querySelectorAll('li').length).toBe(0);
  });
});
