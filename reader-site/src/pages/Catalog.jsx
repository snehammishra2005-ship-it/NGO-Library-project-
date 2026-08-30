import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BookCard from '../components/BookCard.jsx';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(params.get('q') || '');

  const q = params.get('q') || '';
  const genre = params.get('genre') || '';
  const availability = params.get('availability') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => { api.getGenres().then((d) => setGenres(d.genres)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    api.listBooks({ q, genre, availability, sort })
      .then((d) => setBooks(d.books))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [q, genre, availability, sort]);

  // Keep the search box in sync when navigating in with a ?q=
  useEffect(() => { setTerm(params.get('q') || ''); }, [params]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v); else next.delete(k);
    });
    setParams(next, { replace: true });
  };

  const submitSearch = (e) => { e.preventDefault(); update({ q: term.trim() }); };
  const clearAll = () => setParams({}, { replace: true });

  const hasFilters = q || genre || availability || sort !== 'newest';

  return (
    <div className="container-x py-12">
      <header className="mb-8">
        <h1 className="rule-under font-serif text-4xl text-ink-900">Catalogue</h1>
        <p className="mt-4 text-ink-500">
          {loading ? 'Searching…' : `${books.length} ${books.length === 1 ? 'book' : 'books'} found`}
          {genre && <> in <span className="text-ink-800">{genre}</span></>}
          {q && <> for “<span className="text-ink-800">{q}</span>”</>}
        </p>
      </header>

      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form onSubmit={submitSearch} className="flex w-full max-w-md gap-2">
          <input
            className="input"
            placeholder="Search title, author, ISBN…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button className="btn-primary shrink-0">Search</button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select className="input w-auto" value={genre} onChange={(e) => update({ genre: e.target.value })}>
            <option value="">All genres</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="input w-auto" value={availability} onChange={(e) => update({ availability: e.target.value })}>
            <option value="">Any availability</option>
            <option value="available">Available now</option>
            <option value="checked_out">Checked out</option>
          </select>
          <select className="input w-auto" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="title">Title A–Z</option>
            <option value="author">Author A–Z</option>
          </select>
          {hasFilters && (
            <button onClick={clearAll} className="btn-ghost px-3">Clear</button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-ink-100" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <p className="font-serif text-2xl text-ink-800">No books match your search</p>
          <p className="mt-2 text-ink-500">Try a different title, author, or clear the filters.</p>
          {hasFilters && <button onClick={clearAll} className="btn-outline mt-6">Clear filters</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => <BookCard key={b.book_id} book={b} />)}
        </div>
      )}
    </div>
  );
}
