// ---------------------------------------------------------------------
//  Reader-account features (public site): wishlist + notify-me. Keyed on
//  member_id. These touch ONLY the signed-in reader's own rows — never
//  staff, invoice, or membership-management data.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';

const low = (row) => {
  const o = {};
  for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k];
  return o;
};

// ---- wishlist --------------------------------------------------------
export async function listWishlist(memberId) {
  if (isMock) {
    const ids = db.wishlist.filter((w) => w.member_id === Number(memberId)).map((w) => w.book_id);
    return db.books
      .filter((b) => ids.includes(b.book_id))
      .map(({ search_count, ...b }) => b); // eslint-disable-line no-unused-vars
  }
  const { rows } = await query(
    `SELECT b.book_id, b.title, b.author, b.genre, b.cover_image_url,
            b.status, b.available_copies
     FROM wishlist w JOIN books b ON b.book_id = w.book_id
     WHERE w.member_id = :mid ORDER BY w.added_on DESC`,
    { mid: Number(memberId) }
  );
  return rows.map(low);
}

export async function addToWishlist(memberId, bookId) {
  if (isMock) {
    const exists = db.wishlist.some((w) => w.member_id === Number(memberId) && w.book_id === Number(bookId));
    if (!exists) db.wishlist.push({ member_id: Number(memberId), book_id: Number(bookId), added_on: nowIso() });
    return;
  }
  await query(
    `MERGE INTO wishlist w
     USING (SELECT :mid AS member_id, :bid AS book_id FROM dual) s
     ON (w.member_id = s.member_id AND w.book_id = s.book_id)
     WHEN NOT MATCHED THEN INSERT (member_id, book_id) VALUES (s.member_id, s.book_id)`,
    { mid: Number(memberId), bid: Number(bookId) }
  );
}

export async function removeFromWishlist(memberId, bookId) {
  if (isMock) {
    db.wishlist = db.wishlist.filter((w) => !(w.member_id === Number(memberId) && w.book_id === Number(bookId)));
    return;
  }
  await query(`DELETE FROM wishlist WHERE member_id = :mid AND book_id = :bid`,
    { mid: Number(memberId), bid: Number(bookId) });
}

// ---- notify-me -------------------------------------------------------
export async function listNotifyRequests(memberId) {
  if (isMock) {
    const ids = db.notifyRequests
      .filter((n) => n.member_id === Number(memberId) && !n.notified_on)
      .map((n) => n.book_id);
    return db.books
      .filter((b) => ids.includes(b.book_id))
      .map(({ search_count, ...b }) => b); // eslint-disable-line no-unused-vars
  }
  const { rows } = await query(
    `SELECT b.book_id, b.title, b.author, b.status, b.available_copies
     FROM notify_requests n JOIN books b ON b.book_id = n.book_id
     WHERE n.member_id = :mid AND n.notified_on IS NULL
     ORDER BY n.requested_on DESC`,
    { mid: Number(memberId) }
  );
  return rows.map(low);
}

export async function addNotifyRequest(memberId, bookId) {
  if (isMock) {
    const exists = db.notifyRequests.some(
      (n) => n.member_id === Number(memberId) && n.book_id === Number(bookId) && !n.notified_on
    );
    if (!exists) {
      db.notifyRequests.push({
        request_id: nextId('request'), member_id: Number(memberId),
        book_id: Number(bookId), requested_on: nowIso(), notified_on: null,
      });
    }
    return;
  }
  await query(
    `MERGE INTO notify_requests nr
     USING (SELECT :mid AS member_id, :bid AS book_id FROM dual) s
     ON (nr.member_id = s.member_id AND nr.book_id = s.book_id AND nr.notified_on IS NULL)
     WHEN NOT MATCHED THEN INSERT (member_id, book_id) VALUES (s.member_id, s.book_id)`,
    { mid: Number(memberId), bid: Number(bookId) }
  );
}

export async function removeNotifyRequest(memberId, bookId) {
  if (isMock) {
    db.notifyRequests = db.notifyRequests.filter(
      (n) => !(n.member_id === Number(memberId) && n.book_id === Number(bookId) && !n.notified_on)
    );
    return;
  }
  await query(
    `DELETE FROM notify_requests WHERE member_id = :mid AND book_id = :bid AND notified_on IS NULL`,
    { mid: Number(memberId), bid: Number(bookId) }
  );
}
