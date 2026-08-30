import { asyncHandler } from '../../utils/http.js';
import { getDashboard } from '../../repos/dashboard.repo.js';
import { listRecent } from '../../repos/audit.repo.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const data = await getDashboard();
  data.recentActivity = await listRecent(8);
  res.json(data);
});
