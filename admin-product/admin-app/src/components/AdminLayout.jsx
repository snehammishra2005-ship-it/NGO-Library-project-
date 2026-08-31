import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Nav items; `admin` = visible to ADMIN role only (front-desk sees a
// reduced menu matching their permissions).
const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/borrowing', label: 'Borrowing' },
  { to: '/members', label: 'Members' },
  { to: '/books', label: 'Books', admin: true },
  { to: '/invoices', label: 'Invoices', admin: true },
  { to: '/maintenance', label: 'Maintenance', admin: true },
  { to: '/staff', label: 'Staff', admin: true },
  { to: '/reports', label: 'Reports', admin: true },
  { to: '/audit', label: 'Audit log', admin: true },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = nav.filter((n) => !n.admin || isAdmin);

  const linkClass = ({ isActive }) =>
    'block rounded-md px-3 py-2 text-sm transition-colors ' +
    (isActive ? 'bg-white text-ink-900 font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white');

  const SidebarInner = () => (
    <>
      <div className="mb-6">
        <p className="text-sm font-semibold text-white">Library Console</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/40">
          {isAdmin ? 'Administrator' : 'Front desk'}
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={linkClass}>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <p className="text-sm text-white">{user?.name}</p>
        <p className="text-xs text-white/40">{user?.email}</p>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="mt-3 text-xs text-white/70 underline-offset-2 hover:text-white hover:underline">
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-surface-rail p-4 md:flex">
        <SidebarInner />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-ink-200 bg-surface-rail px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-white">Library Console</span>
          <button onClick={() => setOpen((o) => !o)} className="text-white" aria-label="Menu">
            <div className="space-y-1"><span className="block h-0.5 w-5 bg-white" /><span className="block h-0.5 w-5 bg-white" /><span className="block h-0.5 w-5 bg-white" /></div>
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-1 bg-surface-rail p-4 md:hidden">
            <SidebarInner />
          </div>
        )}

        <main className="min-w-0 flex-1 p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
