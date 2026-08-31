import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Books() {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const load = (q = '') => {
    setLoading(true);
    api.listBooks({ q, sort: 'title' }).then((d) => setBooks(d.books)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const adjust = async (book, delta) => {
    const next = book.available_copies + delta;
    if (next < 0 || next > book.total_copies) return;
    try {
      const { book: updated } = await api.updateBook(book.book_id, { available_copies: next });
      setBooks((bs) => bs.map((b) => (b.book_id === updated.book_id ? updated : b)));
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (book) => {
    try {
      await api.deleteBook(book.book_id);
      setBooks((bs) => bs.filter((b) => b.book_id !== book.book_id));
      setConfirmId(null);
      toast.show(`Deleted “${book.title}”`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Books</h1>
          <p className="mt-1 text-sm text-ink-500">{books.length} titles</p>
        </div>
        <Link to="/books/new" className="btn-primary">+ Add book</Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(term.trim()); }} className="mt-4 flex gap-2">
        <input className="input w-72" placeholder="Search titles…" value={term} onChange={(e) => setTerm(e.target.value)} />
        <button className="btn-outline">Search</button>
      </form>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[720px]">
            <thead><tr><th>Title</th><th>Genre</th><th>Shelf</th><th>Availability</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : books.map((b) => (
                <tr key={b.book_id}>
                  <td><p className="font-medium text-ink-900">{b.title}</p><p className="text-xs text-ink-400">{b.author}</p></td>
                  <td className="text-ink-600">{b.genre || '—'}</td>
                  <td className="text-ink-600">{b.shelf_location || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjust(b, -1)} disabled={b.available_copies === 0}
                        className="grid h-6 w-6 place-items-center rounded border border-ink-300 text-ink-700 hover:bg-ink-900 hover:text-white disabled:opacity-30">−</button>
                      <span className="w-12 text-center tabular-nums text-ink-800">{b.available_copies}/{b.total_copies}</span>
                      <button onClick={() => adjust(b, +1)} disabled={b.available_copies >= b.total_copies}
                        className="grid h-6 w-6 place-items-center rounded border border-ink-300 text-ink-700 hover:bg-ink-900 hover:text-white disabled:opacity-30">+</button>
                      <span className={'ml-1 inline-block h-2 w-2 rounded-full ' + (b.available_copies > 0 ? 'bg-ink-900' : 'border border-ink-400')} />
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/books/${b.book_id}/edit`} className="btn-ghost px-2.5 py-1.5 text-xs">Edit</Link>
                      {confirmId === b.book_id ? (
                        <>
                          <button onClick={() => remove(b)} className="rounded bg-ink-900 px-2.5 py-1.5 text-xs text-white">Confirm</button>
                          <button onClick={() => setConfirmId(null)} className="btn-ghost px-2 py-1.5 text-xs">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmId(b.book_id)} className="btn-ghost px-2.5 py-1.5 text-xs">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-400">Use − / + to adjust available copies. Availability status updates automatically.</p>
    </div>
  );
}
