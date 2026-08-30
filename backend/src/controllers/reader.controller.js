import { asyncHandler, badRequest } from '../utils/http.js';
import {
  listWishlist, addToWishlist, removeFromWishlist,
  listNotifyRequests, addNotifyRequest, removeNotifyRequest,
} from '../repos/reader.repo.js';

// All handlers use req.user.sub (the reader_id) from the JWT.

export const getWishlist = asyncHandler(async (req, res) => {
  res.json({ books: await listWishlist(req.user.sub) });
});

export const postWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.body || {};
  if (!bookId) throw badRequest('bookId is required');
  await addToWishlist(req.user.sub, bookId);
  res.status(201).json({ added: true });
});

export const deleteWishlist = asyncHandler(async (req, res) => {
  await removeFromWishlist(req.user.sub, req.params.bookId);
  res.json({ removed: true });
});

export const getNotify = asyncHandler(async (req, res) => {
  res.json({ books: await listNotifyRequests(req.user.sub) });
});

export const postNotify = asyncHandler(async (req, res) => {
  const { bookId } = req.body || {};
  if (!bookId) throw badRequest('bookId is required');
  await addNotifyRequest(req.user.sub, bookId);
  res.status(201).json({ requested: true });
});

export const deleteNotify = asyncHandler(async (req, res) => {
  await removeNotifyRequest(req.user.sub, req.params.bookId);
  res.json({ removed: true });
});
