import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CreateShipmentModal from '../components/CreateShipmentModal';
import { useAppStore } from '../store/useAppStore';
import { shipments } from '../data/mockData';

describe('CreateShipmentModal', () => {
  beforeEach(() => {
    useAppStore.setState({ notifications: [], shipments: [...shipments] });
  });

  function renderModal(open = true) {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <CreateShipmentModal open={open} onClose={onClose} />
      </MemoryRouter>
    );
    return { onClose };
  }

  it('renders nothing when closed', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('creates a shipment and shows the new tracking number', async () => {
    const user = userEvent.setup();
    renderModal();
    const before = useAppStore.getState().shipments.length;

    await user.selectOptions(screen.getByLabelText('Customer'), 'c4');
    await user.click(screen.getByRole('button', { name: /create shipment/i }));

    const after = useAppStore.getState().shipments;
    expect(after).toHaveLength(before + 1);
    const created = after.at(-1)!;
    expect(created.customerId).toBe('c4');

    // Success panel shows the tracking number and a link to it
    expect(screen.getByText('Shipment created')).toBeInTheDocument();
    expect(screen.getByText(created.trackingNumber)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view tracking/i })).toHaveAttribute(
      'href',
      `/track/${created.trackingNumber}`
    );
  });

  it('assigns the chosen driver at creation', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.selectOptions(screen.getByLabelText(/assign driver/i), 'd3');
    await user.click(screen.getByRole('button', { name: /create shipment/i }));

    const created = useAppStore.getState().shipments.at(-1)!;
    expect(created.driverId).toBe('d3');
    expect(created.status).toBe('assigned');
  });
});
