import bcrypt from 'bcryptjs';
import { asyncHandler, badRequest, unauthorized, conflict } from '../utils/http.js';
import { signToken } from '../utils/jwt.js';
import { findMemberByEmail, createMember } from '../repos/auth.repo.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public reader accounts. Scope 'reader' — can only reach /api/public/reader/*.
export const readerSignup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !password) throw badRequest('Name, email and password are required');
  if (!emailRe.test(email)) throw badRequest('Please enter a valid email address');
  if (String(password).length < 6) throw badRequest('Password must be at least 6 characters');

  const existing = await findMemberByEmail(email);
  if (existing && existing.password_hash) throw conflict('An account with this email already exists');

  const passwordHash = bcrypt.hashSync(password, 10);
  const member = await createMember({ name, email, phone, passwordHash });
  res.status(201).json({ token: token(member), user: publicMember(member) });
});

export const readerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw badRequest('Email and password are required');
  const member = await findMemberByEmail(email);
  if (!member || !member.password_hash || !bcrypt.compareSync(password, member.password_hash)) {
    throw unauthorized('Invalid email or password');
  }
  res.json({ token: token(member), user: publicMember(member) });
});

export const readerMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

function token(m) {
  return signToken({ sub: m.member_id, scope: 'reader', name: m.name, email: m.email });
}
function publicMember(m) {
  return { id: m.member_id, name: m.name, email: m.email, phone: m.phone, scope: 'reader' };
}
