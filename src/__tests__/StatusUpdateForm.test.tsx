import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusUpdateForm from '../components/StatusUpdateForm';
import { useAppStore } from '../store/useAppStore';

describe('StatusUpdateForm', () => {
  beforeEach(() => {
    // Reset notifications so we can assert on the side-effect cleanly
    useAppStore.setState({ notifications: [] });
  });

  it('records a status change and appends a history entry', async () => {
    const user = userEvent.setup();
    const shipment = useAppStore.getState().getShipmentById('s2')!;
    const before = shipment.history.length;

    render(<StatusUpdateForm shipment={shipment} />);

    await user.selectOptions(screen.getByRole('combobox'), 'delivered');
    await user.type(screen.getByPlaceholderText(/handed to reception/i), 'Left with neighbour');
    await user.click(screen.getByRole('button', { name: /record update/i }));

    const after = useAppStore.getState().getShipmentById('s2')!;
    expect(after.status).toBe('delivered');
    expect(after.history.length).toBe(before + 1);
    expect(after.history.at(-1)?.note).toBe('Left with neighbour');
  });

  it('fires a customer notification on the delivered transition', async () => {
    const user = userEvent.setup();
    const shipment = useAppStore.getState().getShipmentById('s4')!;

    render(<StatusUpdateForm shipment={shipment} />);
    await user.selectOptions(screen.getByRole('combobox'), 'delivered');
    await user.click(screen.getByRole('button', { name: /record update/i }));

    const notifications = useAppStore.getState().notifications;
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications.at(-1)?.subject.toLowerCase()).toContain('delivered');
  });
});
