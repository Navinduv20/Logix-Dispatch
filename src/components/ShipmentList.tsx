import type { Shipment } from '../types';
import { useAppStore } from '../store/useAppStore';
import TrackingCard from './TrackingCard';
import { content } from '../constants/content';

interface Props {
  shipments: Shipment[];
  emptyMessage?: string;
  compact?: boolean;
}

export default function ShipmentList({ shipments, emptyMessage, compact }: Props) {
  const drivers = useAppStore((s) => s.drivers);
  const customers = useAppStore((s) => s.customers);

  if (shipments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {emptyMessage ?? content.shipmentList.empty}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
      {shipments.map((s) => {
        const driver = s.driverId ? drivers.find((d) => d.id === s.driverId) : undefined;
        const customer = customers.find((c) => c.id === s.customerId);
        return (
          <TrackingCard
            key={s.id}
            shipment={s}
            driverName={driver?.name}
            customerName={customer?.name}
            compact={compact}
          />
        );
      })}
    </div>
  );
}
