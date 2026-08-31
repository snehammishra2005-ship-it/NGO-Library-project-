import { asyncHandler, badRequest } from '../../utils/http.js';
import { issueBook, returnBook, listOpenLoans } from '../../repos/borrow.repo.js';
import { record } from '../../repos/audit.repo.js';

export const getOpenLoans = asyncHandler(async (_req, res) => {
  res.json({ loans: await listOpenLoans() });
});

export const logIssue = asyncHandler(async (req, res) => {
  const { bookId, memberId, dueOn } = req.body || {};
  if (!bookId) throw badRequest('bookId is required');
  const log = await issueBook({ bookId, memberId, staffId: req.user.sub, dueOn });
  await record({ staffId: req.user.sub, action: 'ISSUE', entity: 'BOOK', entityId: bookId, details: `member ${memberId || 'walk-in'}` });
  res.status(201).json({ log });
});

export const logReturn = asyncHandler(async (req, res) => {
  const { logId, fineAmount } = req.body || {};
  if (!logId) throw badRequest('logId is required');
  const result = await returnBook({ logId, fineAmount });
  await record({ staffId: req.user.sub, action: 'RETURN', entity: 'BORROW_LOG', entityId: logId, details: fineAmount ? `fine ${fineAmount}` : 'no fine' });
  res.json({ result });
});
