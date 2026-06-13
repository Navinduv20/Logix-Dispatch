import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { content } from '../constants/content';
import type { PerformanceReportRow, ShipmentStatus } from '../types';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending: '#94a3b8',
  assigned: '#3b82f6',
  in_transit: '#6366f1',
  out_for_delivery: '#f59e0b',
  delivered: '#10b981',
  failed: '#ef4444',
  delayed: '#f97316',
};

// Deterministic mock KPIs per driver so the demo always shows a realistic report
const FUEL_MULTIPLIER = 420; // LKR per completed delivery, rough regional figure for Colombo
const DURATION_MEAN = 42; // minutes average per stop

export default function ManagerReportsPage() {
  const shipments = useAppStore((s) => s.shipments);
  const drivers = useAppStore((s) => s.drivers);

  const statusBreakdown = useMemo(() => {
    const counts: Record<ShipmentStatus, number> = {
      pending: 0,
      assigned: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      failed: 0,
      delayed: 0,
    };
    shipments.forEach((s) => {
      counts[s.status] += 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({
        status: status as ShipmentStatus,
        label: status.replace(/_/g, ' '),
        value,
        color: STATUS_COLORS[status as ShipmentStatus],
      }));
  }, [shipments]);

  const driverRows: PerformanceReportRow[] = useMemo(() => {
    return drivers.map((d) => {
      const mine = shipments.filter((s) => s.driverId === d.id);
      const completed = mine.filter((s) => s.status === 'delivered').length;
      const failed = mine.filter((s) => s.status === 'failed').length;
      const total = mine.length || 1;
      const onTimeRate = Math.max(0, Math.min(1, (completed - failed * 0.5) / total));
      const averageDurationMin = DURATION_MEAN + (d.id.charCodeAt(1) % 6);
      const fuelCost = (completed + 1) * FUEL_MULTIPLIER;
      return {
        driverId: d.id,
        driverName: d.name,
        deliveriesCompleted: completed,
        onTimeRate,
        averageDurationMin,
        fuelCost,
      };
    });
  }, [drivers, shipments]);

  // Mocked 7-day trend so stakeholders can see the shape of the week
  const weekTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      onTime: 82 + Math.round(Math.sin(i + 1) * 6 + (i % 2) * 3),
      delayed: 6 + (i % 3) * 2,
    }));
  }, []);

  const totals = useMemo(() => {
    return {
      delivered: driverRows.reduce((sum, r) => sum + r.deliveriesCompleted, 0),
      avgOnTime:
        driverRows.length === 0
          ? 0
          : driverRows.reduce((sum, r) => sum + r.onTimeRate, 0) / driverRows.length,
      fuelCost: driverRows.reduce((sum, r) => sum + r.fuelCost, 0),
    };
  }, [driverRows]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{content.manager.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {content.manager.subtitle}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <KPI label={content.manager.kpiDelivered} value={totals.delivered.toString()} trend="+12%" />
        <KPI
          label={content.manager.kpiOnTime}
          value={`${Math.round(totals.avgOnTime * 100)}%`}
          trend="+3.1 pts"
        />
        <KPI
          label={content.manager.kpiFuel}
          value={totals.fuelCost.toLocaleString('en-GB')}
          trend="-2.4%"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">{content.manager.onTimeChartTitle}</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekTrend} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[60, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="onTime"
                  name={content.manager.seriesOnTime}
                  stroke="#1f6feb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="delayed"
                  name={content.manager.seriesDelayed}
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{content.manager.statusMixTitle}</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((s) => (
                    <Cell key={s.status} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{content.manager.driverPerformanceTitle}</h2>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driverRows} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="driverName" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="deliveriesCompleted" name={content.manager.seriesDeliveries} fill="#1f6feb" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="averageDurationMin"
                name={content.manager.seriesAvgDuration}
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">{content.manager.table.driver}</th>
                <th className="py-2 pr-4">{content.manager.table.completed}</th>
                <th className="py-2 pr-4">{content.manager.table.onTime}</th>
                <th className="py-2 pr-4">{content.manager.table.avgDuration}</th>
                <th className="py-2">{content.manager.table.fuel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {driverRows.map((r) => (
                <tr key={r.driverId}>
                  <td className="py-2 pr-4 text-slate-900">{r.driverName}</td>
                  <td className="py-2 pr-4 text-slate-700">{r.deliveriesCompleted}</td>
                  <td className="py-2 pr-4 text-slate-700">{Math.round(r.onTimeRate * 100)}%</td>
                  <td className="py-2 pr-4 text-slate-700">{r.averageDurationMin} min</td>
                  <td className="py-2 text-slate-700">{r.fuelCost.toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KPI({ label, value, trend }: { label: string; value: string; trend: string }) {
  const positive = trend.trim().startsWith('+');
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div
          className={`text-xs font-semibold ${
            positive ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {trend}
        </div>
      </div>
    </div>
  );
}
