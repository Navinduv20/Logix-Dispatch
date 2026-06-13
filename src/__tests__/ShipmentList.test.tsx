import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShipmentList from '../components/ShipmentList';
import type { Shipment } from '../types';

function makeShipment(id: string, tracking: string, status: Shipment['status'] = 'pending'): Shipment {
  return {
    id,
    trackingNumber: tracking,
    customerId: 'c1',
    status,
    origin: 'Hub',
    destination: 'Somewhere, Colombo',
    destinationCoords: { lat: 6.9, lng: 79.85 },
    scheduledDelivery: new Date(Date.now() + 3600_000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3600_000).toISOString(),
    priority: 'standard',
    weight: 1,
    history: [],
  };
}

describe('ShipmentList', () => {
  it('renders one TrackingCard per shipment', () => {
    const items = [
      makeShipment('a', 'LGX-AAA001'),
      makeShipment('b', 'LGX-AAA002', 'in_transit'),
      makeShipment('c', 'LGX-AAA003', 'delivered'),
    ];
    render(
      <MemoryRouter>
        <ShipmentList shipments={items} />
      </MemoryRouter>
    );
    expect(screen.getByText('LGX-AAA001')).toBeInTheDocument();
    expect(screen.getByText('LGX-AAA002')).toBeInTheDocument();
    expect(screen.getByText('LGX-AAA003')).toBeInTheDocument();
  });

  it('shows the supplied empty message when the list is empty', () => {
    render(
      <MemoryRouter>
        <ShipmentList shipments={[]} emptyMessage="No completed deliveries yet." />
      </MemoryRouter>
    );
    expect(screen.getByText(/no completed deliveries yet/i)).toBeInTheDocument();
  });

  it('falls back to a default empty message when none is provided', () => {
    render(
      <MemoryRouter>
        <ShipmentList shipments={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/no shipments to show/i)).toBeInTheDocument();
  });
});
