import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Shipment } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

function defaultSchedule() {
  const d = new Date(Date.now() + 24 * 3600_000);
  d.setMinutes(0, 0, 0);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

export default function CreateShipmentModal({ open, onClose }: Props) {
  const customers = useAppStore((s) => s.customers);
  const drivers = useAppStore((s) => s.drivers);
  const createShipment = useAppStore((s) => s.createShipment);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [destination, setDestination] = useState('');
  const [priority, setPriority] = useState<'standard' | 'express'>('standard');
  const [weight, setWeight] = useState('1');
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [instructions, setInstructions] = useState('');
  const [driverId, setDriverId] = useState('');
  const [created, setCreated] = useState<Shipment | null>(null);

  if (!open) return null;

  const customer = customers.find((c) => c.id === customerId);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const shipment = createShipment({
      customerId,
      destination,
      priority,
      weight: Math.max(0.1, Number.parseFloat(weight) || 1),
      scheduledDelivery: new Date(schedule).toISOString(),
      specialInstructions: instructions,
      driverId: driverId || undefined,
    });
    if (shipment) setCreated(shipment);
  }

  function handleClose() {
    setCreated(null);
    setDestination('');
    setInstructions('');
    setDriverId('');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create shipment"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {created ? 'Shipment created' : 'Create shipment'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {created ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Tracking number
              </div>
              <div className="font-mono text-2xl font-semibold text-emerald-900">
                {created.trackingNumber}
              </div>
              <p className="mt-1 text-sm text-emerald-800">
                {created.driverId ? 'Assigned and ready for pickup.' : 'In the queue, awaiting a driver.'}{' '}
                The customer has been notified.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
              <Link
                to={`/track/${created.trackingNumber}`}
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                View tracking
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Customer</span>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Destination address</span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={customer?.address ?? 'Delivery address'}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Leave blank to use the customer's address on file.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'standard' | 'express')}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Weight (kg)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Scheduled delivery</span>
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Assign driver (optional)</span>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Leave unassigned</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.vehicle}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Special instructions</span>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Optional: gate code, fragile contents, call on arrival..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Create shipment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
