import { useState } from 'react';
import type { Shipment, ShipmentStatus } from '../types';
import { useAppStore } from '../store/useAppStore';

const OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: 'in_transit', label: 'Mark in transit' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Delivery failed' },
  { value: 'delayed', label: 'Delay reported' },
];

interface Props {
  shipment: Shipment;
}

export default function StatusUpdateForm({ shipment }: Props) {
  const update = useAppStore((s) => s.updateShipmentStatus);
  const [status, setStatus] = useState<ShipmentStatus>('out_for_delivery');
  const [note, setNote] = useState('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    update(shipment.id, status, note || undefined);
    setNote('');
    setSubmittedAt(new Date().toLocaleTimeString('en-GB'));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-900">Update status</h3>
      <p className="mt-1 text-xs text-slate-500">
        Changes are timestamped and trigger customer notifications automatically.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-slate-700">New status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Note (optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Handed to reception"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Record update
        </button>
        {submittedAt && (
          <span className="text-xs text-slate-500">Last update at {submittedAt}</span>
        )}
      </div>
    </form>
  );
}
