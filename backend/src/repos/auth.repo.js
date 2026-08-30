// ---------------------------------------------------------------------
//  Auth repository — staff lookups (admin app) and member lookups +
//  self-signup (public reader accounts).
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';

const low = (row) => {
  const o = {};
  for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k];
  return o;
};

// ---- staff (admin app) ----------------------------------------------
export async function findStaffByEmail(email) {
  const e = email.toLowerCase();
  if (isMock) return db.staff.find((s) => s.email === e && s.is_active === 'Y') || null;
  const { rows } = await query(
    `SELECT staff_id, name, email, password_hash, role, is_active
     FROM staff WHERE email = :e AND is_active = 'Y'`,
    { e }
  );
  return rows[0] ? low(rows[0]) : null;
}

// ---- members (public reader accounts) -------------------------------
export async function findMemberByEmail(email) {
  const e = email.toLowerCase();
  if (isMock) return db.members.find((m) => m.email === e) || null;
  const { rows } = await query(
    `SELECT member_id, name, email, phone, password_hash, membership_status
     FROM members WHERE email = :e`,
    { e }
  );
  return rows[0] ? low(rows[0]) : null;
}

// Self-service signup creates a PENDING member with an online password.
export async function createMember({ name, email, phone, passwordHash }) {
  const e = email.toLowerCase();
  if (isMock) {
    const row = {
      member_id: nextId('member'), name, email: e, phone: phone || null,
      password_hash: passwordHash, membership_status: 'PENDING',
      membership_start: null, membership_expiry: null, joined_on: nowIso(),
    };
    db.members.push(row);
    return row;
  }
  const oracledb = (await import('oracledb')).default;
  await query(
    `INSERT INTO members (name, email, phone, password_hash, membership_status)
     VALUES (:name, :email, :phone, :ph, 'PENDING') RETURNING member_id INTO :id`,
    {
      name, email: e, phone: phone || null, ph: passwordHash,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return findMemberByEmail(e);
}
