import type { AppNotification, NotificationDeliveryStatus } from '../types';

export interface EmailTemplateInput {
  subject: string;
  body: string;
  to: string;
  trackingNumber?: string;
}

/**
 * Branded HTML email shared by the real send (Resend) and the in-app preview,
 * so what the demo shows is exactly what lands in the inbox.
 */
export function buildEmailHtml({ subject, body, to, trackingNumber }: EmailTemplateInput): string {
  const trackingBlock = trackingNumber
    ? `<tr><td style="padding:16px 32px 0">
         <div style="background:#f0f7ff;border:1px solid #e0f0ff;border-radius:8px;padding:12px 16px">
           <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#1550b4">Tracking number</div>
           <div style="font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:600;color:#0d2f6b">${trackingNumber}</div>
           <a href="http://localhost:5173/track/${trackingNumber}" style="font-size:12px;color:#1f6feb">View live tracking →</a>
         </div>
       </td></tr>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f1f5f9;font-family:Inter,system-ui,-apple-system,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
          <tr><td style="background:#1f6feb;padding:20px 32px">
            <span style="display:inline-block;background:#ffffff;color:#1f6feb;font-weight:700;border-radius:8px;padding:6px 10px;font-size:14px">LX</span>
            <span style="color:#ffffff;font-size:16px;font-weight:600;margin-left:10px">Logix Dispatch</span>
          </td></tr>
          <tr><td style="padding:28px 32px 0">
            <h1 style="margin:0;font-size:20px;color:#0f172a">${subject}</h1>
          </td></tr>
          ${trackingBlock}
          <tr><td style="padding:16px 32px;font-size:14px;line-height:1.6;color:#334155">${body}</td></tr>
          <tr><td style="padding:0 32px 28px;font-size:12px;color:#94a3b8">
            You are receiving this because shipment notifications are enabled for ${to}.
            Manage preferences in the customer portal.
          </td></tr>
        </table>
        <div style="padding:16px;font-size:11px;color:#94a3b8">Logix Dispatch · COMP70006 demo · Email redirected to the verified demo inbox</div>
      </td></tr>
    </table>
  </body>
</html>`;
}

/**
 * Posts the email to the local notification server, which relays it through
 * Resend. Resolves to the delivery outcome; never throws, so the UI can show
 * a "failed" badge instead of crashing when the server is down.
 */
export async function sendEmailNotification(
  notification: Pick<AppNotification, 'to' | 'subject' | 'body' | 'trackingNumber'>
): Promise<NotificationDeliveryStatus> {
  try {
    const res = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: notification.to,
        subject: notification.subject,
        text: notification.body,
        html: buildEmailHtml(notification),
      }),
    });
    if (!res.ok) return 'failed';
    const data = (await res.json()) as { status?: NotificationDeliveryStatus };
    return data.status === 'sent' || data.status === 'simulated' ? data.status : 'failed';
  } catch {
    return 'failed';
  }
}
