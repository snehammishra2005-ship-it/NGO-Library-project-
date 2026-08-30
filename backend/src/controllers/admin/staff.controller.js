import bcrypt from 'bcryptjs';
import { asyncHandler, badRequest } from '../../utils/http.js';
import { listStaff, createStaff, deactivateStaff } from '../../repos/staff.repo.js';
import { record } from '../../repos/audit.repo.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getStaff = asyncHandler(async (_req, res) => {
  res.json({ staff: await listStaff() });
});

export const addStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !String(name).trim()) throw badRequest('Name is required');
  if (!email || !emailRe.test(email)) throw badRequest('A valid email is required');
  if (!password || String(password).length < 6) throw badRequest('Password must be at least 6 characters');
  if (role && !['ADMIN', 'FRONT_DESK'].includes(role)) throw badRequest('Invalid role');
  const passwordHash = bcrypt.hashSync(password, 10);
  const staff = await createStaff({ name, email, passwordHash, role }, req.user.sub);
  await record({ staffId: req.user.sub, action: 'CREATE', entity: 'STAFF', entityId: staff.staff_id, details: `${staff.name} (${staff.role})` });
  res.status(201).json({ staff });
});

export const removeStaff = asyncHandler(async (req, res) => {
  const result = await deactivateStaff(req.params.id, req.user.sub);
  await record({ staffId: req.user.sub, action: 'DELETE', entity: 'STAFF', entityId: req.params.id });
  res.json({ staff: result });
});
