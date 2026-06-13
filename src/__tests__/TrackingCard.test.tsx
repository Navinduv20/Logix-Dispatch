import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrackingCard from '../components/TrackingCard';
import type { Shipment } from '../types';

const shipment: Shipment = {
  id: 'test1',
  trackingNumber: 'LGX-999999',
  customerId: 'c1',
  status: 'in_transit',
  origin: 'Hub',
  destination: '42 Marine Drive, Colombo 03',
  destinationCoords: { lat: 6.9, lng: 79.85 },
  scheduledDelivery: new Date(Date.now() + 3600_000).toISOString(),
  estimatedDelivery: new Date(Date.now() + 1800_000).toISOString(),
  priority: 'express',
  weight: 2.3,
  history: [],
};

describe('TrackingCard', () => {
  it('shows tracking number, destination, and status', () => {
    render(
      <MemoryRouter>
        <TrackingCard shipment={shipment} customerName="Test Customer" driverName="Driver One" />
      </MemoryRouter>
    );

    expect(screen.getByText('LGX-999999')).toBeInTheDocument();
    expect(screen.getByText(/marine drive/i)).toBeInTheDocument();
    expect(screen.getByText(/in transit/i)).toBeInTheDocument();
    expect(screen.getByText(/driver one/i)).toBeInTheDocument();
  });

  it('renders a tracking link', () => {
    render(
      <MemoryRouter>
        <TrackingCard shipment={shipment} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /view tracking/i });
    expect(link).toHaveAttribute('href', '/track/LGX-999999');
  });
});
