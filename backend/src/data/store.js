// ---------------------------------------------------------------------
//  In-memory data store used when DB_MODE=mock. Mirrors the Oracle schema
//  closely enough that the repositories behave identically. State lives
//  only in memory — restart the server to reset it.
// ---------------------------------------------------------------------
import bcrypt from 'bcryptjs';
import {
  seedStaff, seedMembers, seedBooks, seedBorrowLog,
  seedNotifyRequests, seedWishlist, seedInvoices, seedMaintenance,
} from './seedData.js';

const db = {
  staff: [],
  members: [],
  books: [],
  borrowLog: [],
  invoices: [],
  maintenance: [],
  notifyRequests: [],
  wishlist: [],
  auditLog: [],
  seq: { staff: 1, member: 1, book: 1, log: 1, invoice: 1, record: 1, request: 1, audit: 1 },
};

const nextId = (key) => db.seq[key]++;
const nowIso = () => new Date().toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 864e5).toISOString();
const dateOnly = (iso) => (iso ? iso.slice(0, 10) : null);

function deriveStatus(availableCopies) {
  return availableCopies > 0 ? 'AVAILABLE' : 'CHECKED_OUT';
}

let initialized = false;

export function initStore() {
  if (initialized) return;
  const rounds = 8;

  // Staff
  seedStaff.forEach((s, i) => {
    db.staff.push({
      staff_id: nextId('staff'),
      name: s.name,
      email: s.email.toLowerCase(),
      password_hash: bcrypt.hashSync(s.password, rounds),
      role: s.role,
      is_active: 'Y',
      added_on: nowIso(),
      added_by_staff_id: i === 0 ? null : 1,
    });
  });

  // Members
  for (const m of seedMembers) {
    const start = m.months > 0 ? daysFromNow(-30) : m.months < 0 ? daysFromNow(m.months * 30 - 30) : null;
    const expiry = m.months !== 0 ? daysFromNow(m.months * 30) : null;
    db.members.push({
      member_id: nextId('member'),
      name: m.name,
      email: m.email.toLowerCase(),
      phone: m.phone || null,
      password_hash: m.password ? bcrypt.hashSync(m.password, rounds) : null,
      membership_status: m.membership_status,
      membership_start: dateOnly(start),
      membership_expiry: dateOnly(expiry),
      joined_on: nowIso(),
    });
  }

  // Books
  for (const b of seedBooks) {
    db.books.push({
      book_id: nextId('book'),
      title: b.title, author: b.author, isbn: b.isbn || null,
      genre: b.genre || null, description: b.description || null,
      cover_image_url: b.cover_image_url || null, shelf_location: b.shelf_location || null,
      total_copies: b.total_copies, available_copies: b.available_copies,
      status: deriveStatus(b.available_copies), search_count: 0, added_on: nowIso(),
    });
  }

  const bookByIsbn = (isbn) => db.books.find((b) => b.isbn === isbn);

  // Borrow log (open loans)
  for (const l of seedBorrowLog) {
    const book = bookByIsbn(l.isbn);
    const member = db.members[l.memberIndex];
    if (!book) continue;
    db.borrowLog.push({
      log_id: nextId('log'),
      book_id: book.book_id,
      member_id: member ? member.member_id : null,
      issued_on: daysFromNow(-l.daysAgo),
      due_on: daysFromNow(-l.daysAgo + l.dueInDays),
      returned_on: null,
      fine_amount: 0,
      handled_by_staff_id: db.staff[0].staff_id,
    });
  }

  // Notify + wishlist
  for (const n of seedNotifyRequests) {
    const book = bookByIsbn(n.isbn);
    const member = db.members[n.memberIndex];
    if (!book || !member) continue;
    db.notifyRequests.push({
      request_id: nextId('request'), book_id: book.book_id,
      member_id: member.member_id, requested_on: nowIso(), notified_on: null,
    });
  }
  for (const w of seedWishlist) {
    const book = bookByIsbn(w.isbn);
    const member = db.members[w.memberIndex];
    if (!book || !member) continue;
    db.wishlist.push({ member_id: member.member_id, book_id: book.book_id, added_on: nowIso() });
  }

  // Invoices
  for (const inv of seedInvoices) {
    const member = db.members[inv.memberIndex];
    if (!member) continue;
    db.invoices.push({
      invoice_id: nextId('invoice'), member_id: member.member_id,
      type: inv.type, amount: inv.amount, issued_on: nowIso(),
      payment_status: inv.payment_status, notes: inv.notes || null,
      generated_by_staff_id: db.staff[0].staff_id,
    });
  }

  // Maintenance
  for (const r of seedMaintenance) {
    const book = r.isbn ? bookByIsbn(r.isbn) : null;
    db.maintenance.push({
      record_id: nextId('record'),
      book_id: book ? book.book_id : null,
      asset_name: r.asset_name || null,
      category: r.category, description: r.description, cost: r.cost,
      logged_on: nowIso(), logged_by_staff_id: db.staff[0].staff_id,
    });
  }

  initialized = true;
}

export { db, nextId, nowIso, deriveStatus, daysFromNow, dateOnly };
