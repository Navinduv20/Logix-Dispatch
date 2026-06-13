import type { StatusEvent } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  events: StatusEvent[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeliveryHistoryTimeline({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-5">
      {sorted.map((ev, i) => (
        <li key={`${ev.timestamp}-${i}`} className="relative">
          <span className="absolute -left-[29px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-500 shadow" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ev.status} />
            <span className="text-xs text-slate-500">{formatDate(ev.timestamp)}</span>
          </div>
          {ev.note && <p className="mt-1 text-sm text-slate-700">{ev.note}</p>}
        </li>
      ))}
    </ol>
  );
}
