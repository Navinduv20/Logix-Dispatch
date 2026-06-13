import { Link } from 'react-router-dom';
import type { Shipment } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  shipment: Shipment;
  driverName?: string;
  customerName?: string;
  compact?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackingCard({ shipment, driverName, customerName, compact }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tracking number
          </div>
          <div className="truncate font-mono text-base font-semibold text-slate-900">
            {shipment.trackingNumber}
          </div>
          {customerName && !compact && (
            <div className="mt-1 text-sm text-slate-600">For {customerName}</div>
          )}
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-500">Destination</div>
          <div className="truncate text-slate-800">{shipment.destination}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">ETA</div>
          <div className="text-slate-800">{formatDate(shipment.estimatedDelivery)}</div>
        </div>
        {!compact && (
          <>
            <div>
              <div className="text-xs text-slate-500">Priority</div>
              <div className="capitalize text-slate-800">{shipment.priority}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Driver</div>
              <div className="text-slate-800">{driverName ?? 'Unassigned'}</div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          to={`/track/${shipment.trackingNumber}`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View tracking
        </Link>
        <span className="text-xs text-slate-500">{shipment.weight} kg</span>
      </div>
    </article>
  );
}
