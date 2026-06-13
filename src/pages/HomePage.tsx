import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { content } from '../constants/content';

export default function HomePage() {
  const [tracking, setTracking] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const shipments = useAppStore((s) => s.shipments);

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = tracking.trim();
    if (!trimmed) {
      setError(content.home.errorEmpty);
      return;
    }
    const found = shipments.find((s) => s.trackingNumber.toLowerCase() === trimmed.toLowerCase());
    if (!found) {
      setError(content.home.errorNotFound);
      return;
    }
    navigate(`/track/${found.trackingNumber}`);
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 p-8 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {content.home.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">
          {content.home.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
          {content.home.subhead}
        </p>

        <form
          onSubmit={handleTrack}
          className="mt-6 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
          aria-label={content.home.trackFormAria}
        >
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder={content.home.trackPlaceholder}
            className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/60 backdrop-blur focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            {content.home.trackButton}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-rose-100">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <Link
            to="/dispatcher?create=1"
            className="rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {content.home.createShipment}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">{content.home.workspacesTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {content.home.workspacesSubtitle}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.home.workspaceCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
            >
              <div className="text-sm font-semibold text-brand-700 group-hover:text-brand-900">
                {card.title} →
              </div>
              <p className="mt-1 text-sm text-slate-600">{card.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">{shipments.length}</div>
          <div className="text-sm text-slate-500">{content.home.statActive}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {shipments.filter((s) => s.status === 'delivered').length}
          </div>
          <div className="text-sm text-slate-500">{content.home.statDelivered}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {shipments.filter((s) => s.status === 'delayed' || s.status === 'failed').length}
          </div>
          <div className="text-sm text-slate-500">{content.home.statAttention}</div>
        </div>
      </section>
    </div>
  );
}
