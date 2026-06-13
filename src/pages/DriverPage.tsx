import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import StatusUpdateForm from '../components/StatusUpdateForm';
import type { Shipment } from '../types';

const STOP_PRIORITY: Record<Shipment['status'], number> = {
  out_for_delivery: 0,
  in_transit: 1,
  assigned: 2,
  delayed: 3,
  pending: 4,
  failed: 5,
  delivered: 6,
};

export default function DriverPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const driver = useAppStore((s) => (driverId ? s.getDriverById(driverId) : undefined));
  const stops = useAppStore((s) => (driverId ? s.getShipmentsByDriver(driverId) : []));
  const drivers = useAppStore((s) => s.drivers);
  const customers = useAppStore((s) => s.customers);

  const ordered = useMemo(() => {
    return [...stops].sort((a, b) => {
      const pa = STOP_PRIORITY[a.status];
      const pb = STOP_PRIORITY[b.status];
      if (pa !== pb) return pa - pb;
      return new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime();
    });
  }, [stops]);

  const [selectedId, setSelectedId] = useState<string | null>(
    () => ordered.find((s) => s.status !== 'delivered' && s.status !== 'failed')?.id ?? null
  );
  const selected = ordered.find((s) => s.id === selectedId) ?? ordered[0];

  if (!driver) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Driver not found</h1>
        <p className="mt-2 text-sm text-slate-600">Pick a driver from the list below.</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {drivers.map((d) => (
            <li key={d.id}>
              <Link
                to={`/driver/${d.id}`}
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const activeStops = ordered.filter((s) => s.status !== 'delivered' && s.status !== 'failed');
  const doneStops = ordered.filter((s) => s.status === 'delivered' || s.status === 'failed');

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{driver.name}</h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {driver.vehicle} · <span className="capitalize">{driver.status.replace('_', ' ')}</span>
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            {drivers.map((d) => (
              <Link
                key={d.id}
                to={`/driver/${d.id}`}
                className={`rounded-md px-2 py-1 font-medium ${
                  d.id === driver.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.name.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LiveMap
            drivers={[driver]}
            shipments={activeStops}
            showRoute
            height="380px"
          />
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Today's route</h2>
            <p className="mt-1 text-xs text-slate-500">
              Optimised by ETA and priority. Tap a stop to see details.
            </p>
            <ol className="mt-3 space-y-2">
              {activeStops.map((s, i) => {
                const c = customers.find((cu) => cu.id === s.customerId);
                const isSelected = s.id === selected?.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                            {i + 1}
                          </span>
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {s.trackingNumber}
                          </span>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-2 text-xs text-slate-600">{s.destination}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {c?.name} · ETA{' '}
                        {new Date(s.estimatedDelivery).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </button>
                  </li>
                );
              })}
              {activeStops.length === 0 && (
                <li className="py-4 text-center text-xs text-slate-500">
                  No active stops. You are done for the day.
                </li>
              )}
            </ol>
            {doneStops.length > 0 && (
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-slate-600">
                  Completed ({doneStops.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {doneStops.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-slate-600">
                      <span className="font-mono">{s.trackingNumber}</span>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Stop details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Tracking</dt>
                <dd className="font-mono text-slate-800">{selected.trackingNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Recipient</dt>
                <dd className="text-slate-800">
                  {customers.find((c) => c.id === selected.customerId)?.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Address</dt>
                <dd className="text-slate-800">{selected.destination}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="text-slate-800">
                  {customers.find((c) => c.id === selected.customerId)?.phone}
                </dd>
              </div>
              {selected.specialInstructions && (
                <div>
                  <dt className="text-xs text-slate-500">Instructions</dt>
                  <dd className="rounded-md bg-amber-50 p-2 text-sm text-amber-900">
                    {selected.specialInstructions}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <StatusUpdateForm shipment={selected} />
        </div>
      )}
    </div>
  );
}
