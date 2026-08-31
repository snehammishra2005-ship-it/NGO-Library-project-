import { asyncHandler, badRequest, notFound } from '../../utils/http.js';
import { listBooks, createBook, updateBook, deleteBook, getBook } from '../../repos/books.repo.js';
import { record } from '../../repos/audit.repo.js';

// Staff read the catalog through the admin API (never the public one).
export const getBooks = asyncHandler(async (req, res) => {
  const { q, genre, availability, sort } = req.query;
  const books = await listBooks({ q, genre, availability, sort });
  res.json({ count: books.length, books });
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await getBook(req.params.id);
  if (!book) throw notFound('Book not found');
  res.json({ book });
});

function validateBook(data, { partial = false } = {}) {
  const errors = [];
  if (!partial || data.title !== undefined)
    if (!data.title || !String(data.title).trim()) errors.push('Title is required');
  if (!partial || data.author !== undefined)
    if (!data.author || !String(data.author).trim()) errors.push('Author is required');
  const total = data.total_copies, avail = data.available_copies;
  if (total !== undefined && (isNaN(total) || Number(total) < 0)) errors.push('Total copies must be a non-negative number');
  if (avail !== undefined && (isNaN(avail) || Number(avail) < 0)) errors.push('Available copies must be a non-negative number');
  if (total !== undefined && avail !== undefined && Number(avail) > Number(total))
    errors.push('Available copies cannot exceed total copies');
  return errors;
}

export const addBook = asyncHandler(async (req, res) => {
  const errors = validateBook(req.body || {});
  if (errors.length) throw badRequest(errors.join('. '));
  const book = await createBook(req.body);
  await record({ staffId: req.user.sub, action: 'CREATE', entity: 'BOOK', entityId: book.book_id, details: book.title });
  res.status(201).json({ book });
});

export const editBook = asyncHandler(async (req, res) => {
  const existing = await getBook(req.params.id);
  if (!existing) throw notFound('Book not found');
  const errors = validateBook(req.body || {}, { partial: true });
  if (errors.length) throw badRequest(errors.join('. '));
  const book = await updateBook(req.params.id, req.body);
  await record({ staffId: req.user.sub, action: 'UPDATE', entity: 'BOOK', entityId: book.book_id, details: book.title });
  res.json({ book });
});

export const removeBook = asyncHandler(async (req, res) => {
  const existing = await getBook(req.params.id);
  if (!existing) throw notFound('Book not found');
  await deleteBook(req.params.id);
  await record({ staffId: req.user.sub, action: 'DELETE', entity: 'BOOK', entityId: req.params.id, details: existing.title });
  res.json({ deleted: true });
});
