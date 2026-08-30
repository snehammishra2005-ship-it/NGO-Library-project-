// ---------------------------------------------------------------------
//  Staff repository (admin app, ADMIN role only) — manage staff accounts.
//  Never returns password hashes.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';
import { notFound, conflict } from '../utils/http.js';

const PUBLIC = ['staff_id', 'name', 'email', 'role', 'is_active', 'added_on'];
const pick = (s) => Object.fromEntries(PUBLIC.map((k) => [k, s[k]]));
const low = (row) => {
  const o = {}; for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]; return o;
};

export async function listStaff() {
  if (isMock) return db.staff.sort((a, b) => a.name.localeCompare(b.name)).map(pick);
  const { rows } = await query(`SELECT ${PUBLIC.join(', ')} FROM staff ORDER BY name`);
  return rows.map(low);
}

export async function createStaff({ name, email, passwordHash, role }, addedByStaffId) {
  const e = email.toLowerCase();
  if (isMock) {
    if (db.staff.some((s) => s.email === e)) throw conflict('A staff account with this email already exists');
    const row = {
      staff_id: nextId('staff'), name, email: e, password_hash: passwordHash,
      role: role || 'FRONT_DESK', is_active: 'Y', added_on: nowIso(),
      added_by_staff_id: Number(addedByStaffId),
    };
    db.staff.push(row);
    return pick(row);
  }
  const existing = await query(`SELECT 1 FROM staff WHERE email = :e`, { e });
  if (existing.rows.length) throw conflict('A staff account with this email already exists');
  const oracledb = (await import('oracledb')).default;
  const { outBinds } = await query(
    `INSERT INTO staff (name, email, password_hash, role, added_by_staff_id)
     VALUES (:name, :email, :ph, :role, :addedBy) RETURNING staff_id INTO :id`,
    {
      name, email: e, ph: passwordHash, role: role || 'FRONT_DESK', addedBy: Number(addedByStaffId),
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  const { rows } = await query(`SELECT ${PUBLIC.join(', ')} FROM staff WHERE staff_id = :id`,
    { id: outBinds.id[0] });
  return low(rows[0]);
}

// Deactivate rather than hard-delete, to preserve audit/FK integrity.
export async function deactivateStaff(id, selfId) {
  if (Number(id) === Number(selfId)) throw conflict('You cannot deactivate your own account');
  if (isMock) {
    const s = db.staff.find((x) => x.staff_id === Number(id));
    if (!s) throw notFound('Staff not found');
    s.is_active = 'N';
    return pick(s);
  }
  const { rowsAffected } = await query(`UPDATE staff SET is_active = 'N' WHERE staff_id = :id`, { id: Number(id) });
  if (!rowsAffected) throw notFound('Staff not found');
  return { staff_id: Number(id), is_active: 'N' };
}
