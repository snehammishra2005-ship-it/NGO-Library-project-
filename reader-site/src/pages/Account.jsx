import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AvailabilityBadge from '../components/AvailabilityBadge.jsx';

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [notify, setNotify] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.getWishlist(), api.getNotify()])
      .then(([w, n]) => { setWishlist(w.books); setNotify(n.books); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const removeWish = async (id) => {
    try { await api.removeWishlist(id); setWishlist((w) => w.filter((b) => b.book_id !== id)); toast.show('Removed from your shelf'); }
    catch (e) { toast.error(e.message); }
  };
  const removeNotify = async (id) => {
    try { await api.removeNotify(id); setNotify((n) => n.filter((b) => b.book_id !== id)); toast.show('Notification cancelled'); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="container-x py-12">
      <header className="mb-10">
        <h1 className="rule-under font-serif text-4xl text-ink-900">My Shelf</h1>
        <p className="mt-4 text-ink-500">Welcome back, {user?.name}.</p>
      </header>

      {loading ? (
        <p className="text-ink-400">Loading your shelf…</p>
      ) : (
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Wishlist */}
          <section>
            <h2 className="font-serif text-2xl text-ink-900">Saved books</h2>
            <p className="mt-1 text-sm text-ink-500">Titles you want to read.</p>
            <div className="mt-5 space-y-3">
              {wishlist.length === 0 && (
                <div className="card p-6 text-sm text-ink-500">
                  Nothing saved yet. <Link to="/catalog" className="text-ink-900 underline">Browse the catalogue →</Link>
                </div>
              )}
              {wishlist.map((b) => (
                <div key={b.book_id} className="card flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link to={`/book/${b.book_id}`} className="font-serif text-lg text-ink-900 hover:underline">
                      {b.title}
                    </Link>
                    <p className="text-sm text-ink-500">{b.author}</p>
                    <div className="mt-2"><AvailabilityBadge status={b.status} availableCopies={b.available_copies} size="sm" /></div>
                  </div>
                  <button onClick={() => removeWish(b.book_id)} className="btn-ghost shrink-0 px-3 text-xs">Remove</button>
                </div>
              ))}
            </div>
          </section>

          {/* Notify me */}
          <section>
            <h2 className="font-serif text-2xl text-ink-900">Notify me</h2>
            <p className="mt-1 text-sm text-ink-500">We’ll flag these when a copy returns.</p>
            <div className="mt-5 space-y-3">
              {notify.length === 0 && (
                <div className="card p-6 text-sm text-ink-500">
                  No pending notifications. Ask to be notified from any checked-out book’s page.
                </div>
              )}
              {notify.map((b) => (
                <div key={b.book_id} className="card flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link to={`/book/${b.book_id}`} className="font-serif text-lg text-ink-900 hover:underline">
                      {b.title}
                    </Link>
                    <p className="text-sm text-ink-500">{b.author}</p>
                    <div className="mt-2"><AvailabilityBadge status={b.status} availableCopies={b.available_copies} size="sm" /></div>
                  </div>
                  <button onClick={() => removeNotify(b.book_id)} className="btn-ghost shrink-0 px-3 text-xs">Cancel</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
