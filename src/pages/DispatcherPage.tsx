import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import CreateShipmentModal from '../components/CreateShipmentModal';
import type { ShipmentStatus } from '../types';

const FILTERS: { value: ShipmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'failed', label: 'Failed' },
];

export default function DispatcherPage() {
  const shipments = useAppStore((s) => s.shipments);
  const drivers = useAppStore((s) => s.drivers);
  const customers = useAppStore((s) => s.customers);
  const assignShipment = useAppStore((s) => s.assignShipment);

  const [filter, setFilter] = useState<ShipmentStatus | 'all'>('all');
  const [assigning, setAssigning] = useState<string | null>(null);

  // ?create=1 (e.g. from the Home page button) opens the form on arrival
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1');

  function closeCreate() {
    setCreateOpen(false);
    if (searchParams.has('create')) {
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }

  const filtered = useMemo(
    () => (filter === 'all' ? shipments : shipments.filter((s) => s.status === filter)),
    [shipments, filter]
  );

  const byDriver = useMemo(() => {
    const m = new Map<string, number>();
    shipments.forEach((s) => {
      if (s.driverId && s.status !== 'delivered' && s.status !== 'failed') {
        m.set(s.driverId, (m.get(s.driverId) ?? 0) + 1);
      }
    });
    return m;
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dispatcher console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Live fleet view with drag-free assignment and at-a-glance queue health.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New shipment
          </button>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filter === f.value
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LiveMap
            drivers={drivers}
            shipments={shipments.filter((s) => s.status !== 'delivered' && s.status !== 'failed')}
            height="520px"
          />
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Fleet</h2>
            <ul className="mt-3 space-y-2">
              {drivers.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.vehicle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium capitalize text-slate-700">
                      {d.status.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-slate-500">{byDriver.get(d.id) ?? 0} active</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Queue</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {filtered.map((s) => {
                const customer = customers.find((c) => c.id === s.customerId);
                const driver = drivers.find((d) => d.id === s.driverId);
                return (
                  <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {s.trackingNumber}
                        </span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">
                        {customer?.name} · {s.destination}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Driver: {driver?.name ?? 'Unassigned'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assigning === s.id ? (
                        <select
                          autoFocus
                          onBlur={() => setAssigning(null)}
                          onChange={(e) => {
                            if (e.target.value) {
                              assignShipment(s.id, e.target.value);
                              setAssigning(null);
                            }
                          }}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Pick driver
                          </option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssigning(s.id)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {s.driverId ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">
                No shipments match this filter.
              </p>
            )}
          </div>
        </aside>
      </div>

      <CreateShipmentModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}
