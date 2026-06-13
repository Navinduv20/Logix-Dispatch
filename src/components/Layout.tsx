import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 text-xs text-slate-500">
          Logix Dispatch.
        </div>
      </footer>
    </div>
  );
}
