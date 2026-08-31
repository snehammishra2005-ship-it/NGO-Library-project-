// ---------------------------------------------------------------------
//  PUBLIC API  (mounted at /api/public)  — used only by the reader site.
//  Catalog is read-only. Reader accounts touch ONLY the signed-in
//  reader's own wishlist / notify rows. There is NO path from here to any
//  staff, member-management, invoice, borrowing, or admin functionality.
// ---------------------------------------------------------------------
import { Router } from 'express';
import { requireReader } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as books from '../controllers/books.controller.js';
import * as readerAuth from '../controllers/readerAuth.controller.js';
import * as reader from '../controllers/reader.controller.js';

const router = Router();

// ---- Catalog (read-only) --------------------------------------------
router.get('/books', books.getBooks);
router.get('/books/genres', books.getGenres);
router.get('/books/:id', books.getBookById);

// ---- Reader accounts -------------------------------------------------
router.post('/reader/signup', rateLimit({ max: 10 }), readerAuth.readerSignup);
router.post('/reader/login', rateLimit({ max: 10 }), readerAuth.readerLogin);
router.get('/reader/me', requireReader, readerAuth.readerMe);

// ---- Reader's own data (wishlist + notify) ---------------------------
router.get('/reader/wishlist', requireReader, reader.getWishlist);
router.post('/reader/wishlist', requireReader, reader.postWishlist);
router.delete('/reader/wishlist/:bookId', requireReader, reader.deleteWishlist);
router.get('/reader/notify', requireReader, reader.getNotify);
router.post('/reader/notify', requireReader, reader.postNotify);
router.delete('/reader/notify/:bookId', requireReader, reader.deleteNotify);

export default router;
