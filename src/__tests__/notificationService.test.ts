import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildEmailHtml, sendEmailNotification } from '../services/notificationService';

const notification = {
  to: 'priya.fernando@example.com',
  subject: 'Out for delivery',
  body: 'Your parcel is on its way.',
  trackingNumber: 'LGX-100001',
};

describe('buildEmailHtml', () => {
  it('renders subject, body, recipient and tracking number into the template', () => {
    const html = buildEmailHtml(notification);
    expect(html).toContain('Out for delivery');
    expect(html).toContain('Your parcel is on its way.');
    expect(html).toContain('priya.fernando@example.com');
    expect(html).toContain('LGX-100001');
  });

  it('omits the tracking block when there is no tracking number', () => {
    const html = buildEmailHtml({ ...notification, trackingNumber: undefined });
    expect(html).not.toContain('Tracking number');
  });
});

describe('sendEmailNotification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the delivery status reported by the server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'sent', id: 'abc' }), { status: 200 })
      )
    );
    await expect(sendEmailNotification(notification)).resolves.toBe('sent');
  });

  it('returns simulated when the server has no API key configured', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'simulated' }), { status: 200 })
      )
    );
    await expect(sendEmailNotification(notification)).resolves.toBe('simulated');
  });

  it('returns failed on a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"status":"failed"}', { status: 502 }))
    );
    await expect(sendEmailNotification(notification)).resolves.toBe('failed');
  });

  it('returns failed instead of throwing when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(sendEmailNotification(notification)).resolves.toBe('failed');
  });
});
