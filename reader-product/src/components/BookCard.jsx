import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import AvailabilityBadge from './AvailabilityBadge.jsx';

export default function BookCard({ book }) {
  return (
    <Link
      to={`/book/${book.book_id}`}
      className="card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-ink-900">
        <BookCover
          title={book.title}
          author={book.author}
          url={book.cover_image_url}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {book.genre && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
            {book.genre}
          </span>
        )}
        <h3 className="font-serif text-lg leading-snug text-ink-900 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-ink-500">{book.author}</p>
        <div className="mt-auto pt-2">
          <AvailabilityBadge status={book.status} availableCopies={book.available_copies} size="sm" />
        </div>
      </div>
    </Link>
  );
}
