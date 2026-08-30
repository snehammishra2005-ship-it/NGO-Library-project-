// ---------------------------------------------------------------------
//  Members repository (admin app) — register/manage library members and
//  their membership status/expiry. Never exposes password hashes.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso, dateOnly } from '../data/store.js';
import { query } from '../config/db.js';

const PUBLIC = ['member_id', 'name', 'email', 'phone', 'membership_status',
  'membership_start', 'membership_expiry', 'joined_on'];

const pick = (m) => Object.fromEntries(PUBLIC.map((k) => [k, m[k]]));
const low = (row) => {
  const o = {}; for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]; return o;
};

export async function listMembers({ q, status } = {}) {
  if (isMock) {
    let rows = [...db.members];
    if (q) {
      const n = q.toLowerCase();
      rows = rows.filter((m) => m.name.toLowerCase().includes(n) || m.email.includes(n));
    }
    if (status) rows = rows.filter((m) => m.membership_status === status);
    return rows.sort((a, b) => a.name.localeCompare(b.name)).map(pick);
  }
  const where = [], binds = {};
  if (q) { where.push(`(LOWER(name) LIKE :q OR LOWER(email) LIKE :q)`); binds.q = `%${q.toLowerCase()}%`; }
  if (status) { where.push(`membership_status = :status`); binds.status = status; }
  const { rows } = await query(
    `SELECT ${PUBLIC.join(', ')} FROM members
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY name`, binds
  );
  return rows.map(low);
}

export async function getMember(id) {
  if (isMock) {
    const m = db.members.find((x) => x.member_id === Number(id));
    return m ? pick(m) : null;
  }
  const { rows } = await query(
    `SELECT ${PUBLIC.join(', ')} FROM members WHERE member_id = :id`, { id: Number(id) }
  );
  return rows[0] ? low(rows[0]) : null;
}

export async function createMember(data) {
  if (isMock) {
    const row = {
      member_id: nextId('member'), name: data.name, email: data.email.toLowerCase(),
      phone: data.phone || null, password_hash: null,
      membership_status: data.membership_status || 'ACTIVE',
      membership_start: data.membership_start || dateOnly(nowIso()),
      membership_expiry: data.membership_expiry || null, joined_on: nowIso(),
    };
    db.members.push(row);
    return pick(row);
  }
  const oracledb = (await import('oracledb')).default;
  const { outBinds } = await query(
    `INSERT INTO members (name, email, phone, membership_status, membership_start, membership_expiry)
     VALUES (:name, :email, :phone, :status, :start, :expiry) RETURNING member_id INTO :id`,
    {
      name: data.name, email: data.email.toLowerCase(), phone: data.phone || null,
      status: data.membership_status || 'ACTIVE',
      start: data.membership_start ? new Date(data.membership_start) : new Date(),
      expiry: data.membership_expiry ? new Date(data.membership_expiry) : null,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return getMember(outBinds.id[0]);
}

export async function updateMember(id, data) {
  const fields = ['name', 'email', 'phone', 'membership_status', 'membership_start', 'membership_expiry'];
  if (isMock) {
    const m = db.members.find((x) => x.member_id === Number(id));
    if (!m) return null;
    for (const f of fields) if (data[f] !== undefined) m[f] = data[f];
    if (m.email) m.email = m.email.toLowerCase();
    return pick(m);
  }
  const sets = [], binds = { id: Number(id) };
  for (const f of fields) {
    if (data[f] !== undefined) {
      sets.push(`${f} = :${f}`);
      binds[f] = (f.includes('membership_start') || f.includes('membership_expiry'))
        ? (data[f] ? new Date(data[f]) : null) : data[f];
    }
  }
  if (!sets.length) return getMember(id);
  const { rowsAffected } = await query(`UPDATE members SET ${sets.join(', ')} WHERE member_id = :id`, binds);
  return rowsAffected ? getMember(id) : null;
}

// Loan + invoice history for a member's detail view.
export async function getMemberHistory(id) {
  if (isMock) {
    const loans = db.borrowLog.filter((l) => l.member_id === Number(id)).map((l) => ({
      ...l, book_title: db.books.find((b) => b.book_id === l.book_id)?.title || '—',
    }));
    const invoices = db.invoices.filter((i) => i.member_id === Number(id));
    return { loans, invoices };
  }
  const [{ rows: loans }, { rows: invoices }] = await Promise.all([
    query(`SELECT l.log_id, l.issued_on, l.due_on, l.returned_on, l.fine_amount, b.title AS book_title
           FROM borrow_log l JOIN books b ON b.book_id = l.book_id
           WHERE l.member_id = :id ORDER BY l.issued_on DESC`, { id: Number(id) }),
    query(`SELECT invoice_id, type, amount, issued_on, payment_status, notes
           FROM invoices WHERE member_id = :id ORDER BY issued_on DESC`, { id: Number(id) }),
  ]);
  return { loans: loans.map(low), invoices: invoices.map(low) };
}
