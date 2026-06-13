import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ShipmentList from '../components/ShipmentList';
import RescheduleModal from '../components/RescheduleModal';
import type { Shipment } from '../types';
import { content } from '../constants/content';

export default function CustomerPortalPage() {
  const customers = useAppStore((s) => s.customers);
  const shipments = useAppStore((s) => s.shipments);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? '');
  const [rescheduleTarget, setRescheduleTarget] = useState<Shipment | null>(null);

  const customer = customers.find((c) => c.id === selectedCustomerId);
  const myShipments = useMemo(
    () => shipments.filter((s) => s.customerId === selectedCustomerId),
    [shipments, selectedCustomerId]
  );

  const active = myShipments.filter((s) => s.status !== 'delivered');
  const history = myShipments.filter((s) => s.status === 'delivered');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{content.customerPortal.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {content.customerPortal.subtitle}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">{content.customerPortal.signedInAs}</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {customer && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900">{content.customerPortal.account}</h2>
            <div className="mt-2 text-sm text-slate-700">{customer.name}</div>
            <div className="text-xs text-slate-500">{customer.email}</div>
            <div className="text-xs text-slate-500">{customer.phone}</div>
            <div className="text-xs text-slate-500">{customer.address}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">{content.customerPortal.notifications}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-slate-700">{content.customerPortal.emailUpdates}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    customer.notifyByEmail
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {customer.notifyByEmail ? content.customerPortal.on : content.customerPortal.off}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-700">{content.customerPortal.smsAlerts}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    customer.notifyBySms
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {customer.notifyBySms ? content.customerPortal.on : content.customerPortal.off}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{content.customerPortal.activeDeliveries}</h2>
          <span className="text-xs text-slate-500">{content.customerPortal.shipmentCount(active.length)}</span>
        </div>
        <div className="mt-3 space-y-3">
          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              {content.customerPortal.noActive}
            </div>
          ) : (
            active.map((s) => (
              <article
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    {s.trackingNumber}
                  </div>
                  <div className="text-sm text-slate-700">{s.destination}</div>
                  <div className="text-xs text-slate-500">
                    {content.customerPortal.etaPrefix} {new Date(s.estimatedDelivery).toLocaleString('en-GB')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleTarget(s)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {content.customerPortal.reschedule}
                  </button>
                  <a
                    href={`/track/${s.trackingNumber}`}
                    className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                  >
                    {content.customerPortal.track}
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">{content.customerPortal.historyTitle}</h2>
        <div className="mt-3">
          <ShipmentList shipments={history} emptyMessage={content.customerPortal.historyEmpty} compact />
        </div>
      </section>

      {rescheduleTarget && (
        <RescheduleModal
          shipment={rescheduleTarget}
          open={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
        />
      )}
    </div>
  );
}
