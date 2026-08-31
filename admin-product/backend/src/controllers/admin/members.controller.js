import { asyncHandler, badRequest, notFound } from '../../utils/http.js';
import { listMembers, getMember, createMember, updateMember, getMemberHistory } from '../../repos/members.repo.js';
import { record } from '../../repos/audit.repo.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getMembers = asyncHandler(async (req, res) => {
  res.json({ members: await listMembers({ q: req.query.q, status: req.query.status }) });
});

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await getMember(req.params.id);
  if (!member) throw notFound('Member not found');
  const history = await getMemberHistory(req.params.id);
  res.json({ member, ...history });
});

export const addMember = asyncHandler(async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !String(name).trim()) throw badRequest('Name is required');
  if (!email || !emailRe.test(email)) throw badRequest('A valid email is required');
  const member = await createMember(req.body);
  await record({ staffId: req.user.sub, action: 'CREATE', entity: 'MEMBER', entityId: member.member_id, details: member.name });
  res.status(201).json({ member });
});

export const editMember = asyncHandler(async (req, res) => {
  if (req.body?.email && !emailRe.test(req.body.email)) throw badRequest('A valid email is required');
  const member = await updateMember(req.params.id, req.body || {});
  if (!member) throw notFound('Member not found');
  await record({ staffId: req.user.sub, action: 'UPDATE', entity: 'MEMBER', entityId: member.member_id, details: member.name });
  res.json({ member });
});
