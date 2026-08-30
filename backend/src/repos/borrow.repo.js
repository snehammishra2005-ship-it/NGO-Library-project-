// ---------------------------------------------------------------------
//  Borrow log repository — physical issue/return recorded by STAFF.
//  Issuing decrements available_copies; returning increments it and can
//  record a fine. A trigger (oracle) / deriveStatus (mock) keeps status.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso, deriveStatus } from '../data/store.js';
import { query } from '../config/db.js';
import { badRequest, notFound } from '../utils/http.js';

const FINE_PER_DAY = 5; // ₹ per day overdue (used as default suggestion)

const low = (row) => {
  const o = {}; for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]; return o;
};

export async function issueBook({ bookId, memberId, staffId, dueOn }) {
  if (isMock) {
    const book = db.books.find((b) => b.book_id === Number(bookId));
    if (!book) throw notFound('Book not found');
    if (book.available_copies <= 0) throw badRequest('No copies available to issue');
    book.available_copies -= 1;
    book.status = deriveStatus(book.available_copies);
    const row = {
      log_id: nextId('log'), book_id: book.book_id,
      member_id: memberId ? Number(memberId) : null,
      issued_on: nowIso(),
      due_on: dueOn ? new Date(dueOn).toISOString() : new Date(Date.now() + 14 * 864e5).toISOString(),
      returned_on: null, fine_amount: 0,
      handled_by_staff_id: Number(staffId),
    };
    db.borrowLog.push(row);
    return row;
  }

  const upd = await query(
    `UPDATE books SET available_copies = available_copies - 1
     WHERE book_id = :id AND available_copies > 0`,
    { id: Number(bookId) }
  );
  if (!upd.rowsAffected) throw badRequest('No copies available to issue');
  const oracledb = (await import('oracledb')).default;
  const { outBinds } = await query(
    `INSERT INTO borrow_log (book_id, member_id, due_on, handled_by_staff_id)
     VALUES (:bookId, :memberId, :dueOn, :staffId) RETURNING log_id INTO :id`,
    {
      bookId: Number(bookId), memberId: memberId ? Number(memberId) : null,
      dueOn: dueOn ? new Date(dueOn) : new Date(Date.now() + 14 * 864e5),
      staffId: Number(staffId),
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return { log_id: outBinds.id[0], book_id: Number(bookId) };
}

export async function returnBook({ logId, fineAmount }) {
  if (isMock) {
    const log = db.borrowLog.find((l) => l.log_id === Number(logId));
    if (!log) throw notFound('Loan not found');
    if (log.returned_on) throw badRequest('This loan is already returned');
    log.returned_on = nowIso();
    log.fine_amount = Number(fineAmount || 0);
    const book = db.books.find((b) => b.book_id === log.book_id);
    if (book) {
      book.available_copies = Math.min(book.total_copies, book.available_copies + 1);
      book.status = deriveStatus(book.available_copies);
    }
    return log;
  }

  const { rows } = await query(
    `SELECT book_id, returned_on FROM borrow_log WHERE log_id = :id`, { id: Number(logId) }
  );
  if (!rows[0]) throw notFound('Loan not found');
  if (rows[0].RETURNED_ON) throw badRequest('This loan is already returned');
  await query(
    `UPDATE borrow_log SET returned_on = SYSTIMESTAMP, fine_amount = :fine WHERE log_id = :id`,
    { fine: Number(fineAmount || 0), id: Number(logId) }
  );
  await query(
    `UPDATE books SET available_copies = LEAST(total_copies, available_copies + 1)
     WHERE book_id = :bid`, { bid: rows[0].BOOK_ID }
  );
  return { log_id: Number(logId), returned: true };
}

// Open loans (not yet returned), newest first, with overdue + suggested fine.
export async function listOpenLoans() {
  const withDerived = (l, bookTitle, memberName) => {
    const due = l.due_on ? new Date(l.due_on) : null;
    const overdueDays = due ? Math.max(0, Math.floor((Date.now() - due.getTime()) / 864e5)) : 0;
    return {
      ...l, book_title: bookTitle, member_name: memberName,
      overdue_days: overdueDays, suggested_fine: overdueDays * FINE_PER_DAY,
    };
  };
  if (isMock) {
    return db.borrowLog
      .filter((l) => !l.returned_on)
      .sort((a, b) => new Date(b.issued_on) - new Date(a.issued_on))
      .map((l) => {
        const book = db.books.find((b) => b.book_id === l.book_id);
        const member = db.members.find((m) => m.member_id === l.member_id);
        return withDerived(l, book?.title || '—', member?.name || 'Walk-in');
      });
  }
  const { rows } = await query(
    `SELECT l.log_id, l.book_id, l.member_id, l.issued_on, l.due_on,
            b.title AS book_title, NVL(m.name, 'Walk-in') AS member_name
     FROM borrow_log l
     JOIN books b ON b.book_id = l.book_id
     LEFT JOIN members m ON m.member_id = l.member_id
     WHERE l.returned_on IS NULL
     ORDER BY l.issued_on DESC`
  );
  return rows.map((r) => {
    const l = low(r);
    return withDerived(l, l.book_title, l.member_name);
  });
}

export { FINE_PER_DAY };
