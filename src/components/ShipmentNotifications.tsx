import { useState } from 'react';
import type { AppNotification } from '../types';
import { useAppStore } from '../store/useAppStore';
import { ChannelChip, DeliveryStatusChip, EmailPreviewModal } from './NotificationCenter';

export default function ShipmentNotifications({ shipmentId }: { shipmentId: string }) {
  const notifications = useAppStore((s) =>
    s.notifications.filter((n) => n.shipmentId === shipmentId)
  );
  const [preview, setPreview] = useState<AppNotification | null>(null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Notifications sent</h2>
      <p className="mt-1 text-xs text-slate-500">
        Email and SMS updates dispatched to the recipient for this shipment.
      </p>

      {notifications.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Nothing sent yet for this shipment. Status changes and reschedules will appear here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {[...notifications].reverse().map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setPreview(n)}
                className="flex w-full items-start gap-3 py-3 text-left hover:bg-slate-50"
              >
                <ChannelChip channel={n.channel} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {n.subject}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    To {n.to} ·{' '}
                    {new Date(n.sentAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
                <DeliveryStatusChip status={n.status} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {preview && <EmailPreviewModal notification={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
