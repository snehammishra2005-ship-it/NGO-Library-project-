// ---------------------------------------------------------------------
//  Admin dashboard — totals, checked-out, low-stock + overdue alerts,
//  unpaid invoices, and recent activity.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db } from '../data/store.js';
import { query } from '../config/db.js';
import { listOpenLoans } from './borrow.repo.js';

export async function getDashboard() {
  const openLoans = await listOpenLoans();
  const overdue = openLoans.filter((l) => l.overdue_days > 0);

  if (isMock) {
    const totalCopies = db.books.reduce((s, b) => s + b.total_copies, 0);
    const availableCopies = db.books.reduce((s, b) => s + b.available_copies, 0);
    const lowStock = db.books.filter((b) => b.available_copies <= 1)
      .map((b) => ({ book_id: b.book_id, title: b.title, available_copies: b.available_copies, total_copies: b.total_copies }));
    const unpaid = db.invoices.filter((i) => i.payment_status === 'UNPAID');
    const revenue = db.invoices.filter((i) => i.payment_status === 'PAID').reduce((s, i) => s + Number(i.amount), 0);

    return {
      totals: {
        totalBooks: db.books.length, totalCopies, availableCopies,
        checkedOutCopies: totalCopies - availableCopies,
        totalMembers: db.members.length, activeMembers: db.members.filter((m) => m.membership_status === 'ACTIVE').length,
      },
      openLoans: openLoans.length,
      overdue: overdue.slice(0, 8),
      lowStock: lowStock.slice(0, 8),
      unpaidInvoices: { count: unpaid.length, total: unpaid.reduce((s, i) => s + Number(i.amount), 0) },
      revenueCollected: revenue,
      recentlyAdded: [...db.books].sort((a, b) => new Date(b.added_on) - new Date(a.added_on)).slice(0, 5)
        .map(({ book_id, title, author, status }) => ({ book_id, title, author, status })),
    };
  }

  const [{ rows: t }, { rows: mem }, { rows: low }, { rows: unpaidR }, { rows: revR }, { rows: recent }] =
    await Promise.all([
      query(`SELECT COUNT(*) total_books, NVL(SUM(total_copies),0) total_copies,
                    NVL(SUM(available_copies),0) available_copies FROM books`),
      query(`SELECT COUNT(*) total_members,
                    SUM(CASE WHEN membership_status='ACTIVE' THEN 1 ELSE 0 END) active_members FROM members`),
      query(`SELECT book_id, title, available_copies, total_copies FROM books
             WHERE available_copies <= 1 ORDER BY available_copies FETCH FIRST 8 ROWS ONLY`),
      query(`SELECT COUNT(*) cnt, NVL(SUM(amount),0) total FROM invoices WHERE payment_status='UNPAID'`),
      query(`SELECT NVL(SUM(amount),0) revenue FROM invoices WHERE payment_status='PAID'`),
      query(`SELECT * FROM (SELECT book_id, title, author, status FROM books ORDER BY added_on DESC)
             WHERE ROWNUM <= 5`),
    ]);
  const row = t[0];
  const lc = (r) => { const o = {}; for (const k of Object.keys(r)) o[k.toLowerCase()] = r[k]; return o; };
  return {
    totals: {
      totalBooks: row.TOTAL_BOOKS, totalCopies: row.TOTAL_COPIES, availableCopies: row.AVAILABLE_COPIES,
      checkedOutCopies: row.TOTAL_COPIES - row.AVAILABLE_COPIES,
      totalMembers: mem[0].TOTAL_MEMBERS, activeMembers: mem[0].ACTIVE_MEMBERS,
    },
    openLoans: openLoans.length,
    overdue: overdue.slice(0, 8),
    lowStock: low.map(lc),
    unpaidInvoices: { count: unpaidR[0].CNT, total: unpaidR[0].TOTAL },
    revenueCollected: revR[0].REVENUE,
    recentlyAdded: recent.map(lc),
  };
}
