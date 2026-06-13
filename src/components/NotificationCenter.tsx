import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AppNotification } from '../types';
import { useAppStore } from '../store/useAppStore';
import { buildEmailHtml } from '../services/notificationService';

const statusStyles: Record<string, string> = {
  sending: 'bg-amber-50 text-amber-700',
  sent: 'bg-emerald-50 text-emerald-700',
  simulated: 'bg-slate-100 text-slate-600',
  failed: 'bg-red-50 text-red-700',
};

const statusLabels: Record<string, string> = {
  sending: 'Sending…',
  sent: 'Sent',
  simulated: 'Simulated',
  failed: 'Failed',
};

export function DeliveryStatusChip({ status }: { status?: AppNotification['status'] }) {
  const key = status ?? 'sent';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        statusStyles[key]
      }`}
    >
      {statusLabels[key]}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: AppNotification['channel'] }) {
  return (
    <span
      className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[10px] font-semibold ${
        channel === 'email'
          ? 'bg-blue-50 text-blue-700'
          : channel === 'sms'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {channel === 'email' ? '@' : channel === 'sms' ? 'SMS' : 'IN'}
    </span>
  );
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EmailPreviewModal({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: () => void;
}) {
  // Portal to <body>: ancestors with backdrop-filter (the navbar) become the
  // containing block for fixed elements, which would misplace the overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Notification preview"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ChannelChip channel={notification.channel} />
              <h2 className="truncate text-base font-semibold text-slate-900">
                {notification.subject}
              </h2>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              To {notification.to} · {timeLabel(notification.sentAt)} ·{' '}
              <DeliveryStatusChip status={notification.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 text-slate-400 hover:text-slate-700"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
        {notification.channel === 'email' ? (
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={buildEmailHtml(notification)}
            className="h-[60vh] w-full bg-slate-100"
          />
        ) : (
          <div className="p-5">
            <div className="mx-auto max-w-xs rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
              {notification.body}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              SMS channel is simulated for the demo.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function NotificationCenter() {
  const notifications = useAppStore((s) => s.notifications);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const markRead = useAppStore((s) => s.markNotificationRead);

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<AppNotification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const ordered = [...notifications].reverse();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {ordered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No notifications sent yet. Update a shipment status to trigger one.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {ordered.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markRead(n.id);
                      setPreview(n);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                      n.read ? '' : 'bg-brand-50/40'
                    }`}
                  >
                    <ChannelChip channel={n.channel} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {n.subject}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        To {n.to} · {timeLabel(n.sentAt)}
                      </span>
                    </span>
                    <DeliveryStatusChip status={n.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview && (
        <EmailPreviewModal notification={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
