// ---------------------------------------------------------------------
//  Generates database/seed.sql from the canonical seedData, with real
//  bcrypt password hashes baked in. Run: node src/scripts/generateSeedSql.js
// ---------------------------------------------------------------------
import bcrypt from 'bcryptjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  seedStaff, seedMembers, seedBooks, seedBorrowLog,
  seedNotifyRequests, seedWishlist, seedInvoices, seedMaintenance,
} from '../data/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../../../database/seed.sql');
const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const rounds = 10;
const L = [];

L.push('-- =====================================================================');
L.push('--  Seed data for the Library schema. GENERATED FILE — do not edit by hand.');
L.push('--  Regenerate with: node backend/src/scripts/generateSeedSql.js');
L.push('--  Staff: admin@library.test/admin123, staff@library.test/staff123');
L.push('--  Members with online login use password: reader123');
L.push('-- =====================================================================');
L.push('');

L.push('-- Staff');
seedStaff.forEach((s, i) => {
  const hash = bcrypt.hashSync(s.password, rounds);
  const addedBy = i === 0 ? 'NULL' : `(SELECT staff_id FROM staff WHERE email = ${q(seedStaff[0].email)})`;
  L.push(`INSERT INTO staff (name, email, password_hash, role, added_by_staff_id) VALUES (${q(s.name)}, ${q(s.email.toLowerCase())}, ${q(hash)}, ${q(s.role)}, ${addedBy});`);
});
L.push('');

L.push('-- Members (password_hash NULL = walk-in, no online login)');
seedMembers.forEach((m) => {
  const hash = m.password ? q(bcrypt.hashSync(m.password, rounds)) : 'NULL';
  const start = m.months !== 0 ? `TRUNC(SYSDATE) ${m.months > 0 ? '-' : '+'} ${Math.abs(m.months) * 30 + 30}` : 'NULL';
  const expiry = m.months !== 0 ? `TRUNC(SYSDATE) ${m.months >= 0 ? '+' : '-'} ${Math.abs(m.months) * 30}` : 'NULL';
  L.push(`INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES (${q(m.name)}, ${q(m.email.toLowerCase())}, ${q(m.phone)}, ${hash}, ${q(m.membership_status)}, ${start}, ${expiry});`);
});
L.push('');

L.push('-- Books (status set automatically by trg_books_status)');
seedBooks.forEach((b) => {
  L.push(`INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES (${q(b.title)}, ${q(b.author)}, ${q(b.isbn)}, ${q(b.genre)}, ${q(b.description)}, ${q(b.shelf_location)}, ${b.total_copies}, ${b.available_copies});`);
});
L.push('');

const bookByIsbn = (isbn) => `(SELECT book_id FROM books WHERE isbn = ${q(isbn)})`;
const memberByEmail = (email) => `(SELECT member_id FROM members WHERE email = ${q(email.toLowerCase())})`;
const adminId = `(SELECT staff_id FROM staff WHERE email = ${q(seedStaff[0].email)})`;

L.push('-- Borrow log (open loans)');
seedBorrowLog.forEach((l) => {
  const m = seedMembers[l.memberIndex];
  L.push(`INSERT INTO borrow_log (book_id, member_id, issued_on, due_on, handled_by_staff_id) VALUES (${bookByIsbn(l.isbn)}, ${memberByEmail(m.email)}, SYSTIMESTAMP - ${l.daysAgo}, SYSTIMESTAMP - ${l.daysAgo - l.dueInDays}, ${adminId});`);
});
L.push('');

L.push('-- Notify-me requests');
seedNotifyRequests.forEach((n) => {
  const m = seedMembers[n.memberIndex];
  L.push(`INSERT INTO notify_requests (book_id, member_id) VALUES (${bookByIsbn(n.isbn)}, ${memberByEmail(m.email)});`);
});
L.push('');

L.push('-- Wishlist');
seedWishlist.forEach((w) => {
  const m = seedMembers[w.memberIndex];
  L.push(`INSERT INTO wishlist (member_id, book_id) VALUES (${memberByEmail(m.email)}, ${bookByIsbn(w.isbn)});`);
});
L.push('');

L.push('-- Invoices');
seedInvoices.forEach((inv) => {
  const m = seedMembers[inv.memberIndex];
  L.push(`INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id) VALUES (${memberByEmail(m.email)}, ${q(inv.type)}, ${inv.amount}, ${q(inv.payment_status)}, ${q(inv.notes)}, ${adminId});`);
});
L.push('');

L.push('-- Maintenance records');
seedMaintenance.forEach((r) => {
  const book = r.isbn ? bookByIsbn(r.isbn) : 'NULL';
  L.push(`INSERT INTO maintenance_records (book_id, asset_name, category, description, cost, logged_by_staff_id) VALUES (${book}, ${q(r.asset_name)}, ${q(r.category)}, ${q(r.description)}, ${r.cost}, ${adminId});`);
});
L.push('');
L.push('COMMIT;');
L.push('');

writeFileSync(outPath, L.join('\n'), 'utf8');
console.log(`Wrote ${outPath} (${L.length} lines)`);
