import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import BookCard from '../components/BookCard.jsx';

const steps = [
  { n: '01', title: 'Search', body: 'Find a title, author, or genre in our online catalogue.' },
  { n: '02', title: 'Check availability', body: 'See at a glance whether a copy is on the shelf right now.' },
  { n: '03', title: 'Visit the library', body: 'Come in to read or borrow it — all lending happens in person.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.listBooks({ sort: 'newest' }).then((d) => setFeatured(d.books.slice(0, 8))).catch(() => {});
    api.getGenres().then((d) => setGenres(d.genres)).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-100 bg-paper-pure">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.25em] text-ink-400">
              Est. 1974 · Fort District
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-ink-900 sm:text-5xl lg:text-6xl">
              Find your next read before you leave the house.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              Browse our shelves online and see what’s available right now. When
              you find something you love, come read it with us — borrowing
              always happens in person.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex max-w-lg gap-2">
              <input
                className="input flex-1"
                placeholder="Search by title, author, or ISBN…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search the catalogue"
              />
              <button type="submit" className="btn-primary">Search</button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {genres.slice(0, 6).map((g) => (
                <Link
                  key={g}
                  to={`/catalog?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600 hover:border-ink-800 hover:text-ink-900"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Stacked cover motif */}
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((b, i) => (
                <Link
                  key={b.book_id}
                  to={`/book/${b.book_id}`}
                  className={'card aspect-[3/4] w-40 overflow-hidden ' + (i % 2 ? 'translate-y-6' : '')}
                >
                  <div className="h-full w-full bg-ink-900">
                    {/* reuse BookCard cover via BookCover indirectly */}
                    <div className="flex h-full w-full flex-col justify-end p-3"
                      style={{ background: `linear-gradient(${i * 40}deg, #2E2E2E, #0A0A0A)` }}>
                      <p className="font-serif text-sm leading-tight text-paper-pure line-clamp-3">{b.title}</p>
                      <p className="mt-1 text-[11px] text-paper-pure/60">{b.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="rule-under font-serif text-3xl text-ink-900">New arrivals</h2>
            <p className="mt-4 text-ink-500">Fresh on the shelves this season.</p>
          </div>
          <Link to="/catalog" className="hidden text-sm text-ink-600 hover:text-ink-900 sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((b) => <BookCard key={b.book_id} book={b} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink-100 bg-paper-pure">
        <div className="container-x py-16">
          <h2 className="rule-under font-serif text-3xl text-ink-900">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="font-serif text-3xl text-ink-300">{s.n}</span>
                <div>
                  <h3 className="text-lg text-ink-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genre browse */}
      <section className="container-x py-16">
        <h2 className="rule-under font-serif text-3xl text-ink-900">Browse by genre</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {genres.map((g) => (
            <Link
              key={g}
              to={`/catalog?genre=${encodeURIComponent(g)}`}
              className="card group flex items-center justify-between p-5 transition-colors hover:bg-ink-900"
            >
              <span className="font-serif text-lg text-ink-900 group-hover:text-paper-pure">{g}</span>
              <span className="text-ink-300 group-hover:text-paper-pure">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
