import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isReader = !!user;

  const navClass = ({ isActive }) =>
    'text-sm transition-colors ' +
    (isActive ? 'text-ink-900 font-medium' : 'text-ink-500 hover:text-ink-900');

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-xl font-semibold tracking-tight text-ink-900">
          The Reading Room
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isReader ? (
            <>
              <NavLink to="/account" className={navClass}>My Shelf</NavLink>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-outline px-4 py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost px-4 py-2">Sign in</Link>
              <Link to="/signup" className="btn-primary px-5 py-2">Join</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-ink-800"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-ink-800" />
            <span className="block h-0.5 w-6 bg-ink-800" />
            <span className="block h-0.5 w-6 bg-ink-800" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-paper md:hidden">
          <div className="container-x flex flex-col gap-3 py-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={navClass}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isReader ? (
                <>
                  <NavLink to="/account" onClick={() => setOpen(false)} className={navClass}>My Shelf</NavLink>
                  <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="btn-outline">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline">Sign in</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary">Join</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
