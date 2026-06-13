import type { ShipmentStatus } from '../types';
import { statusLabels } from '../constants/content';

const COLORS: Record<ShipmentStatus, string> = {
  pending: 'bg-slate-200 text-slate-700',
  assigned: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-amber-100 text-amber-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
  delayed: 'bg-orange-100 text-orange-800',
};

interface Props {
  status: ShipmentStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
