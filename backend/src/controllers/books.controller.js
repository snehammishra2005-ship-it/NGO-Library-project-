import { asyncHandler, notFound } from '../utils/http.js';
import { listBooks, getBook, bumpSearchCount, listGenres } from '../repos/books.repo.js';

// GET /api/books?q=&genre=&availability=available|checked_out&sort=title|author|newest
export const getBooks = asyncHandler(async (req, res) => {
  const { q, genre, availability, sort } = req.query;
  const books = await listBooks({ q, genre, availability, sort });
  res.json({ count: books.length, books });
});

// GET /api/books/genres — distinct genres for the filter UI
export const getGenres = asyncHandler(async (_req, res) => {
  res.json({ genres: await listGenres() });
});

// GET /api/books/:id — detail + live availability. Counts a search hit.
export const getBookById = asyncHandler(async (req, res) => {
  const book = await getBook(req.params.id);
  if (!book) throw notFound('Book not found');
  await bumpSearchCount(req.params.id);
  res.json({ book });
});
