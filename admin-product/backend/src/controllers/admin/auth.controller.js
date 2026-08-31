import bcrypt from 'bcryptjs';
import { asyncHandler, badRequest, unauthorized } from '../../utils/http.js';
import { signToken } from '../../utils/jwt.js';
import { findStaffByEmail } from '../../repos/auth.repo.js';
import { record } from '../../repos/audit.repo.js';

// Staff login. Scope 'staff' + role claim. Guarded by rate limiting.
export const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw badRequest('Email and password are required');
  const staff = await findStaffByEmail(email);
  if (!staff || !bcrypt.compareSync(password, staff.password_hash)) {
    throw unauthorized('Invalid email or password');
  }
  await record({ staffId: staff.staff_id, action: 'LOGIN', entity: 'STAFF', entityId: staff.staff_id });
  const token = signToken({
    sub: staff.staff_id, scope: 'staff', role: staff.role, name: staff.name, email: staff.email,
  });
  res.json({
    token,
    user: { id: staff.staff_id, name: staff.name, email: staff.email, role: staff.role, scope: 'staff' },
  });
});

export const staffMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
