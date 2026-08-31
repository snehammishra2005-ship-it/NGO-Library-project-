// ---------------------------------------------------------------------
//  Audit log — records who changed what and when in the admin app.
//  Fire-and-forget: a logging failure must never break the real action.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso } from '../data/store.js';
import { query } from '../config/db.js';

export async function record({ staffId, action, entity, entityId, details }) {
  try {
    if (isMock) {
      db.auditLog.push({
        audit_id: nextId('audit'),
        staff_id: staffId ?? null,
        action, entity, entity_id: entityId != null ? String(entityId) : null,
        details: details || null, at: nowIso(),
      });
      return;
    }
    await query(
      `INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
       VALUES (:staffId, :action, :entity, :entityId, :details)`,
      {
        staffId: staffId ?? null, action, entity,
        entityId: entityId != null ? String(entityId) : null, details: details || null,
      }
    );
  } catch (e) {
    console.error('[audit] failed to record:', e.message);
  }
}

export async function listRecent(limit = 50) {
  if (isMock) {
    return [...db.auditLog]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, limit)
      .map((r) => {
        const staff = db.staff.find((s) => s.staff_id === r.staff_id);
        return { ...r, staff_name: staff ? staff.name : 'System' };
      });
  }
  const { rows } = await query(
    `SELECT * FROM (
       SELECT a.audit_id, a.action, a.entity, a.entity_id, a.details, a.at,
              NVL(s.name, 'System') AS staff_name
       FROM audit_log a LEFT JOIN staff s ON s.staff_id = a.staff_id
       ORDER BY a.at DESC
     ) WHERE ROWNUM <= :lim`,
    { lim: limit }
  );
  return rows.map((r) => {
    const o = {}; for (const k of Object.keys(r)) o[k.toLowerCase()] = r[k]; return o;
  });
}
