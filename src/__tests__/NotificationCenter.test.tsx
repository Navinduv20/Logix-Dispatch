import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationCenter from '../components/NotificationCenter';
import { useAppStore } from '../store/useAppStore';

function pushSample() {
  useAppStore.getState().pushNotification({
    channel: 'email',
    to: 'priya.fernando@example.com',
    subject: 'Out for delivery',
    body: 'Your parcel is on its way.',
    trackingNumber: 'LGX-100001',
  });
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    useAppStore.setState({ notifications: [] });
  });

  it('shows an unread badge when notifications arrive', () => {
    render(<NotificationCenter />);
    act(() => pushSample());
    expect(
      screen.getByRole('button', { name: /notifications, 1 unread/i })
    ).toBeInTheDocument();
  });

  it('lists notifications in the panel and marks them read on open', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    act(() => pushSample());

    await user.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByText('Out for delivery')).toBeInTheDocument();

    await user.click(screen.getByText('Out for delivery'));
    // Opening a notification marks it read and shows the email preview
    expect(screen.getByRole('dialog', { name: /notification preview/i })).toBeInTheDocument();
    expect(useAppStore.getState().notifications[0].read).toBe(true);
  });

  it('marks every notification read via the mark-all action', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    act(() => {
      pushSample();
      pushSample();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await user.click(screen.getByRole('button', { name: /mark all read/i }));

    expect(useAppStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it('shows an empty state when nothing has been sent', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByText(/no notifications sent yet/i)).toBeInTheDocument();
  });
});
