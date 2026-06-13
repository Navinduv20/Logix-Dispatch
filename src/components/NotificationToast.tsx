import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function NotificationToast() {
  const notifications = useAppStore((s) => s.notifications);
  const dismiss = useAppStore((s) => s.dismissNotification);
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    const latest = notifications.slice(-3).map((n) => n.id);
    setVisible(latest);
    const timers = latest.map((id) =>
      setTimeout(() => {
        setVisible((prev) => prev.filter((v) => v !== id));
      }, 7000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const items = notifications.filter((n) => visible.includes(n.id));
  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {items.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          role="status"
        >
          <div className="flex items-start gap-3 p-3">
            <div
              className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-semibold ${
                n.channel === 'email'
                  ? 'bg-blue-50 text-blue-700'
                  : n.channel === 'sms'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n.channel === 'email' ? '@' : n.channel === 'sms' ? 'SMS' : 'IN'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">
                {n.subject}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.body}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                Sent to {n.to} via {n.channel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(n.id)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
