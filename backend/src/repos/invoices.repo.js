// ---------------------------------------------------------------------
//  Invoices repository (admin app) — membership fees, fines, other.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';
import { notFound } from '../utils/http.js';

const low = (row) => {
  const o = {}; for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]; return o;
};

export async function listInvoices({ status, memberId } = {}) {
  if (isMock) {
    let rows = [...db.invoices];
    if (status) rows = rows.filter((i) => i.payment_status === status);
    if (memberId) rows = rows.filter((i) => i.member_id === Number(memberId));
    return rows
      .sort((a, b) => new Date(b.issued_on) - new Date(a.issued_on))
      .map((i) => ({ ...i, member_name: db.members.find((m) => m.member_id === i.member_id)?.name || '—' }));
  }
  const where = [], binds = {};
  if (status) { where.push(`i.payment_status = :status`); binds.status = status; }
  if (memberId) { where.push(`i.member_id = :mid`); binds.mid = Number(memberId); }
  const { rows } = await query(
    `SELECT i.invoice_id, i.member_id, i.type, i.amount, i.issued_on, i.payment_status,
            i.notes, m.name AS member_name
     FROM invoices i JOIN members m ON m.member_id = i.member_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY i.issued_on DESC`, binds
  );
  return rows.map(low);
}

export async function getInvoice(id) {
  if (isMock) {
    const i = db.invoices.find((x) => x.invoice_id === Number(id));
    if (!i) return null;
    const member = db.members.find((m) => m.member_id === i.member_id);
    const staff = db.staff.find((s) => s.staff_id === i.generated_by_staff_id);
    return { ...i, member_name: member?.name || '—', member_email: member?.email || null,
      generated_by: staff?.name || '—' };
  }
  const { rows } = await query(
    `SELECT i.*, m.name AS member_name, m.email AS member_email, s.name AS generated_by
     FROM invoices i JOIN members m ON m.member_id = i.member_id
     LEFT JOIN staff s ON s.staff_id = i.generated_by_staff_id
     WHERE i.invoice_id = :id`, { id: Number(id) }
  );
  return rows[0] ? low(rows[0]) : null;
}

export async function createInvoice(data, staffId) {
  if (isMock) {
    const row = {
      invoice_id: nextId('invoice'), member_id: Number(data.member_id),
      type: data.type, amount: Number(data.amount), issued_on: nowIso(),
      payment_status: data.payment_status || 'UNPAID', notes: data.notes || null,
      generated_by_staff_id: Number(staffId),
    };
    db.invoices.push(row);
    return getInvoice(row.invoice_id);
  }
  const oracledb = (await import('oracledb')).default;
  const { outBinds } = await query(
    `INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id)
     VALUES (:mid, :type, :amount, :status, :notes, :staffId) RETURNING invoice_id INTO :id`,
    {
      mid: Number(data.member_id), type: data.type, amount: Number(data.amount),
      status: data.payment_status || 'UNPAID', notes: data.notes || null, staffId: Number(staffId),
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return getInvoice(outBinds.id[0]);
}

export async function setPaymentStatus(id, status) {
  if (isMock) {
    const i = db.invoices.find((x) => x.invoice_id === Number(id));
    if (!i) throw notFound('Invoice not found');
    i.payment_status = status;
    return getInvoice(id);
  }
  const { rowsAffected } = await query(
    `UPDATE invoices SET payment_status = :status WHERE invoice_id = :id`,
    { status, id: Number(id) }
  );
  if (!rowsAffected) throw notFound('Invoice not found');
  return getInvoice(id);
}
