import { asyncHandler } from '../../utils/http.js';
import { listRecent } from '../../repos/audit.repo.js';

export const getAudit = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json({ entries: await listRecent(limit) });
});
