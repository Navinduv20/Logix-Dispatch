import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import StatusBadge from '../components/StatusBadge';
import LiveMap from '../components/LiveMap';
import DeliveryHistoryTimeline from '../components/DeliveryHistoryTimeline';
import RescheduleModal from '../components/RescheduleModal';
import ShipmentNotifications from '../components/ShipmentNotifications';

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const shipment = useAppStore((s) => (id ? s.getShipmentByTracking(id) : undefined));
  const customer = useAppStore((s) =>
    shipment ? s.getCustomerById(shipment.customerId) : undefined
  );
  const driver = useAppStore((s) =>
    shipment?.driverId ? s.getDriverById(shipment.driverId) : undefined
  );

  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const etaLabel = useMemo(() => {
    if (!shipment) return '';
    return new Date(shipment.estimatedDelivery).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [shipment]);

  if (!shipment) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Shipment not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Try one of the demo tracking numbers: LGX-100001 to LGX-100008.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tracking number
            </div>
            <h1 className="font-mono text-2xl font-semibold text-slate-900">
              {shipment.trackingNumber}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={shipment.status} />
              <span className="text-sm text-slate-600">ETA {etaLabel}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRescheduleOpen(true)}
              className="rounded-md border border-brand-500 bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Reschedule
            </button>
          </div>
        </div>

        <LiveMap
          drivers={driver ? [driver] : []}
          shipments={[shipment]}
          showRoute={!!driver}
          height="360px"
        />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Delivery history</h2>
          <p className="mt-1 text-xs text-slate-500">
            Every status change is logged for compliance and customer-service review.
          </p>
          <div className="mt-4">
            <DeliveryHistoryTimeline events={shipment.history} />
          </div>
        </div>

        <ShipmentNotifications shipmentId={shipment.id} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Shipment details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Origin</dt>
              <dd className="text-right text-slate-800">{shipment.origin}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Destination</dt>
              <dd className="text-right text-slate-800">{shipment.destination}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Priority</dt>
              <dd className="capitalize text-slate-800">{shipment.priority}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Weight</dt>
              <dd className="text-slate-800">{shipment.weight} kg</dd>
            </div>
            {shipment.specialInstructions && (
              <div className="pt-2">
                <dt className="text-slate-500">Instructions</dt>
                <dd className="mt-1 rounded-md bg-slate-50 p-2 text-slate-700">
                  {shipment.specialInstructions}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {customer && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Recipient</h2>
            <div className="mt-2 text-sm text-slate-800">{customer.name}</div>
            <div className="text-xs text-slate-500">{customer.email}</div>
            <div className="text-xs text-slate-500">{customer.phone}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-medium uppercase tracking-wide">
              {customer.notifyByEmail && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">Email on</span>
              )}
              {customer.notifyBySms && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                  SMS on
                </span>
              )}
            </div>
          </div>
        )}

        {driver && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Driver</h2>
            <div className="mt-2 text-sm text-slate-800">{driver.name}</div>
            <div className="text-xs text-slate-500">{driver.vehicle}</div>
            <div className="text-xs text-slate-500">{driver.phone}</div>
          </div>
        )}
      </aside>

      <RescheduleModal
        shipment={shipment}
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
      />
    </div>
  );
}
