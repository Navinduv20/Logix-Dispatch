import { useState } from 'react';
import type { Shipment } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Props {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function RescheduleModal({ shipment, open, onClose }: Props) {
  const reschedule = useAppStore((s) => s.rescheduleShipment);

  const [date, setDate] = useState<string>(toLocalInput(shipment.scheduledDelivery));
  const [instructions, setInstructions] = useState<string>(shipment.specialInstructions ?? '');

  if (!open) return null;

  function handleSave() {
    // Confirmation notifications are dispatched by the store on reschedule.
    reschedule(shipment.id, new Date(date).toISOString(), instructions);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Reschedule delivery</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Tracking {shipment.trackingNumber}, current ETA{' '}
          {new Date(shipment.estimatedDelivery).toLocaleString('en-GB')}.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">New delivery date and time</span>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Delivery instructions</span>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Optional: gate code, doorman, safe-drop spot..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
