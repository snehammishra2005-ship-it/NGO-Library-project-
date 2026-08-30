// ---------------------------------------------------------------------
//  Reports (admin app) — most borrowed books, revenue from fees/fines,
//  active vs inactive members. Returned as data the controller can also
//  serialize to CSV for export.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db } from '../data/store.js';
import { query } from '../config/db.js';

export async function mostBorrowed(limit = 10) {
  if (isMock) {
    const counts = new Map();
    for (const l of db.borrowLog) counts.set(l.book_id, (counts.get(l.book_id) || 0) + 1);
    return [...counts.entries()]
      .map(([bookId, times]) => ({ book_id: bookId, title: db.books.find((b) => b.book_id === bookId)?.title || '—', times_borrowed: times }))
      .sort((a, b) => b.times_borrowed - a.times_borrowed)
      .slice(0, limit);
  }
  const { rows } = await query(
    `SELECT * FROM (
       SELECT b.book_id, b.title, COUNT(*) AS times_borrowed
       FROM borrow_log l JOIN books b ON b.book_id = l.book_id
       GROUP BY b.book_id, b.title ORDER BY COUNT(*) DESC
     ) WHERE ROWNUM <= :lim`, { lim: limit }
  );
  return rows.map((r) => ({ book_id: r.BOOK_ID, title: r.TITLE, times_borrowed: r.TIMES_BORROWED }));
}

export async function revenueSummary() {
  if (isMock) {
    const paid = db.invoices.filter((i) => i.payment_status === 'PAID');
    const by = (type) => paid.filter((i) => i.type === type).reduce((s, i) => s + Number(i.amount), 0);
    const outstanding = db.invoices.filter((i) => i.payment_status === 'UNPAID').reduce((s, i) => s + Number(i.amount), 0);
    return {
      membershipFees: by('MEMBERSHIP_FEE'), fines: by('FINE'), other: by('OTHER'),
      totalCollected: paid.reduce((s, i) => s + Number(i.amount), 0), outstanding,
    };
  }
  const { rows } = await query(
    `SELECT
       NVL(SUM(CASE WHEN type='MEMBERSHIP_FEE' AND payment_status='PAID' THEN amount END),0) membership_fees,
       NVL(SUM(CASE WHEN type='FINE' AND payment_status='PAID' THEN amount END),0) fines,
       NVL(SUM(CASE WHEN type='OTHER' AND payment_status='PAID' THEN amount END),0) other,
       NVL(SUM(CASE WHEN payment_status='PAID' THEN amount END),0) total_collected,
       NVL(SUM(CASE WHEN payment_status='UNPAID' THEN amount END),0) outstanding
     FROM invoices`
  );
  const r = rows[0];
  return {
    membershipFees: r.MEMBERSHIP_FEES, fines: r.FINES, other: r.OTHER,
    totalCollected: r.TOTAL_COLLECTED, outstanding: r.OUTSTANDING,
  };
}

export async function membershipBreakdown() {
  if (isMock) {
    const counts = {};
    for (const m of db.members) counts[m.membership_status] = (counts[m.membership_status] || 0) + 1;
    return counts;
  }
  const { rows } = await query(
    `SELECT membership_status, COUNT(*) AS cnt FROM members GROUP BY membership_status`
  );
  return Object.fromEntries(rows.map((r) => [r.MEMBERSHIP_STATUS, r.CNT]));
}
