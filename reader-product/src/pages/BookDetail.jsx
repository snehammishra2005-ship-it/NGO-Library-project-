import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import BookCover from '../components/BookCover.jsx';
import AvailabilityBadge from '../components/AvailabilityBadge.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [onWishlist, setOnWishlist] = useState(false);
  const [onNotify, setOnNotify] = useState(false);
  const isReader = !!user;

  useEffect(() => {
    setBook(null); setError('');
    api.getBook(id).then((d) => setBook(d.book)).catch((e) => setError(e.message));
  }, [id]);

  // Reflect whether this book is already saved / requested.
  useEffect(() => {
    if (!isReader) return;
    api.getWishlist().then((d) => setOnWishlist(d.books.some((b) => b.book_id === Number(id)))).catch(() => {});
    api.getNotify().then((d) => setOnNotify(d.books.some((b) => b.book_id === Number(id)))).catch(() => {});
  }, [id, isReader]);

  const toggleWishlist = async () => {
    if (!isReader) return navigate('/login', { state: { from: `/book/${id}` } });
    try {
      if (onWishlist) { await api.removeWishlist(id); setOnWishlist(false); toast.show('Removed from your shelf'); }
      else { await api.addWishlist(id); setOnWishlist(true); toast.show('Saved to your shelf'); }
    } catch (e) { toast.error(e.message); }
  };

  const toggleNotify = async () => {
    if (!isReader) return navigate('/login', { state: { from: `/book/${id}` } });
    try {
      if (onNotify) { await api.removeNotify(id); setOnNotify(false); toast.show('Notification cancelled'); }
      else { await api.addNotify(id); setOnNotify(true); toast.show('We’ll flag this when a copy is back'); }
    } catch (e) { toast.error(e.message); }
  };

  if (error) {
    return (
      <div className="container-x grid min-h-[50vh] place-items-center text-center">
        <div>
          <p className="font-serif text-3xl text-ink-800">{error}</p>
          <Link to="/catalog" className="btn-outline mt-6">Back to catalogue</Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="container-x grid min-h-[50vh] place-items-center text-ink-400">Loading…</div>;
  }

  const available = book.available_copies > 0;

  return (
    <div className="container-x py-12">
      <Link to="/catalog" className="text-sm text-ink-500 hover:text-ink-900">← Back to catalogue</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="card aspect-[3/4] overflow-hidden bg-ink-900">
            <BookCover title={book.title} author={book.author} url={book.cover_image_url} />
          </div>
        </div>

        <div className="max-w-2xl">
          {book.genre && (
            <span className="text-xs uppercase tracking-[0.2em] text-ink-400">{book.genre}</span>
          )}
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink-900">{book.title}</h1>
          <p className="mt-2 text-lg text-ink-500">by {book.author}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <AvailabilityBadge status={book.status} availableCopies={book.available_copies} />
            <span className="text-sm text-ink-500">
              {book.available_copies} of {book.total_copies} {book.total_copies === 1 ? 'copy' : 'copies'} on shelf
            </span>
          </div>

          {book.description && (
            <p className="mt-6 leading-relaxed text-ink-700">{book.description}</p>
          )}

          <dl className="mt-8 grid max-w-md grid-cols-2 gap-y-3 text-sm">
            <dt className="text-ink-400">Shelf location</dt>
            <dd className="text-ink-800">{book.shelf_location || '—'}</dd>
            <dt className="text-ink-400">ISBN</dt>
            <dd className="text-ink-800">{book.isbn || '—'}</dd>
            <dt className="text-ink-400">Genre</dt>
            <dd className="text-ink-800">{book.genre || '—'}</dd>
          </dl>

          {/* Reader actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={toggleWishlist} className={onWishlist ? 'btn-primary' : 'btn-outline'}>
              {onWishlist ? '✓ On your shelf' : 'Save to my shelf'}
            </button>
            {!available && (
              <button onClick={toggleNotify} className={onNotify ? 'btn-primary' : 'btn-outline'}>
                {onNotify ? '✓ We’ll notify you' : 'Notify me when available'}
              </button>
            )}
          </div>

          <div className="mt-8 rounded-lg border border-ink-200 bg-paper-pure p-4 text-sm text-ink-600">
            {available
              ? 'This title is on the shelf now. Visit the library to read or borrow it — lending happens in person at the front desk.'
              : 'All copies are currently checked out. Save it or ask us to notify you when a copy returns.'}
          </div>
        </div>
      </div>
    </div>
  );
}
