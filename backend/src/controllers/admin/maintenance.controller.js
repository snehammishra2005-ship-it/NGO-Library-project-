import { asyncHandler, badRequest } from '../../utils/http.js';
import { listMaintenance, createMaintenance, deleteMaintenance } from '../../repos/maintenance.repo.js';
import { record } from '../../repos/audit.repo.js';

const CATS = ['BOOK_DAMAGE', 'BOOK_LOST', 'EQUIPMENT', 'FACILITY', 'OTHER'];

export const getMaintenance = asyncHandler(async (req, res) => {
  res.json({ records: await listMaintenance({ category: req.query.category }) });
});

export const addMaintenance = asyncHandler(async (req, res) => {
  const { description, category } = req.body || {};
  if (!description || !String(description).trim()) throw badRequest('Description is required');
  if (category && !CATS.includes(category)) throw badRequest('Invalid category');
  const rec = await createMaintenance(req.body, req.user.sub);
  await record({ staffId: req.user.sub, action: 'CREATE', entity: 'MAINTENANCE', entityId: rec.record_id, details: category || 'OTHER' });
  res.status(201).json({ record: rec });
});

export const removeMaintenance = asyncHandler(async (req, res) => {
  await deleteMaintenance(req.params.id);
  await record({ staffId: req.user.sub, action: 'DELETE', entity: 'MAINTENANCE', entityId: req.params.id });
  res.json({ deleted: true });
});
