import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationToast from '../components/NotificationToast';
import { useAppStore } from '../store/useAppStore';

describe('NotificationToast', () => {
  beforeEach(() => {
    useAppStore.setState({ notifications: [] });
  });

  it('does not render anything when there are no notifications', () => {
    const { container } = render(<NotificationToast />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a notification pushed into the store', () => {
    render(<NotificationToast />);
    act(() => {
      useAppStore.getState().pushNotification({
        channel: 'email',
        to: 'navindu@example.com',
        subject: 'Out for delivery',
        body: 'Your parcel is on its way.',
      });
    });
    expect(screen.getByText('Out for delivery')).toBeInTheDocument();
    expect(screen.getByText(/your parcel is on its way/i)).toBeInTheDocument();
  });

  it('dismisses a notification when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationToast />);
    act(() => {
      useAppStore.getState().pushNotification({
        channel: 'sms',
        to: '+94711112233',
        subject: 'Delivered',
        body: 'Thanks for choosing Logix.',
      });
    });
    expect(screen.getByText('Delivered')).toBeInTheDocument();

    const close = screen.getByRole('button', { name: /dismiss notification/i });
    await user.click(close);

    expect(screen.queryByText('Delivered')).not.toBeInTheDocument();
  });
});
