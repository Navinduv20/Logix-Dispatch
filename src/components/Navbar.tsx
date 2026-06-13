import { NavLink } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { content } from '../constants/content';

const links = [
  { to: '/', label: content.nav.home },
  { to: '/portal', label: content.nav.customerPortal },
  { to: '/dispatcher', label: content.nav.dispatcher },
  { to: '/driver/d1', label: content.nav.driver },
  { to: '/manager', label: content.nav.manager },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
            {content.app.brandInitials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">{content.app.brand}</div>
            <div className="text-xs text-slate-500">{content.app.brandSubtitle}</div>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <NotificationCenter />
        </div>

        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 md:hidden"
          onChange={(e) => {
            if (e.target.value) window.location.href = e.target.value;
          }}
          defaultValue=""
          aria-label={content.nav.navigateAria}
        >
          <option value="" disabled>
            {content.nav.menu}
          </option>
          {links.map((l) => (
            <option key={l.to} value={l.to}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
