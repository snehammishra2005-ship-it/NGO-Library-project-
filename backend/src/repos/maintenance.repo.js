// ---------------------------------------------------------------------
//  Maintenance records (admin app) — damaged/lost books AND general
//  upkeep (equipment, facility). Either book_id or asset_name identifies
//  the subject.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';
import { notFound } from '../utils/http.js';

const low = (row) => {
  const o = {}; for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]; return o;
};

export async function listMaintenance({ category } = {}) {
  if (isMock) {
    let rows = [...db.maintenance];
    if (category) rows = rows.filter((r) => r.category === category);
    return rows
      .sort((a, b) => new Date(b.logged_on) - new Date(a.logged_on))
      .map((r) => ({ ...r, book_title: r.book_id ? db.books.find((b) => b.book_id === r.book_id)?.title : null }));
  }
  const where = [], binds = {};
  if (category) { where.push(`mr.category = :category`); binds.category = category; }
  const { rows } = await query(
    `SELECT mr.record_id, mr.book_id, mr.asset_name, mr.category, mr.description,
            mr.cost, mr.logged_on, b.title AS book_title
     FROM maintenance_records mr LEFT JOIN books b ON b.book_id = mr.book_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY mr.logged_on DESC`, binds
  );
  return rows.map(low);
}

export async function createMaintenance(data, staffId) {
  if (isMock) {
    const row = {
      record_id: nextId('record'),
      book_id: data.book_id ? Number(data.book_id) : null,
      asset_name: data.asset_name || null,
      category: data.category || 'OTHER',
      description: data.description, cost: Number(data.cost || 0),
      logged_on: nowIso(), logged_by_staff_id: Number(staffId),
    };
    db.maintenance.push(row);
    return { ...row, book_title: row.book_id ? db.books.find((b) => b.book_id === row.book_id)?.title : null };
  }
  const oracledb = (await import('oracledb')).default;
  const { outBinds } = await query(
    `INSERT INTO maintenance_records (book_id, asset_name, category, description, cost, logged_by_staff_id)
     VALUES (:bookId, :asset, :category, :description, :cost, :staffId) RETURNING record_id INTO :id`,
    {
      bookId: data.book_id ? Number(data.book_id) : null, asset: data.asset_name || null,
      category: data.category || 'OTHER', description: data.description, cost: Number(data.cost || 0),
      staffId: Number(staffId),
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return { record_id: outBinds.id[0] };
}

export async function deleteMaintenance(id) {
  if (isMock) {
    const i = db.maintenance.findIndex((r) => r.record_id === Number(id));
    if (i === -1) throw notFound('Record not found');
    db.maintenance.splice(i, 1);
    return true;
  }
  const { rowsAffected } = await query(`DELETE FROM maintenance_records WHERE record_id = :id`, { id: Number(id) });
  if (!rowsAffected) throw notFound('Record not found');
  return true;
}
