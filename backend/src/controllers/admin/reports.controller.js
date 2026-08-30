import { asyncHandler } from '../../utils/http.js';
import { mostBorrowed, revenueSummary, membershipBreakdown } from '../../repos/reports.repo.js';

// Turn an array of flat objects into CSV text.
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export const reportsSummary = asyncHandler(async (_req, res) => {
  const [borrowed, revenue, members] = await Promise.all([
    mostBorrowed(10), revenueSummary(), membershipBreakdown(),
  ]);
  res.json({ mostBorrowed: borrowed, revenue, members });
});

// GET /api/admin/reports/most-borrowed.csv  → downloadable export
export const mostBorrowedCsv = asyncHandler(async (_req, res) => {
  const rows = await mostBorrowed(50);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="most-borrowed.csv"');
  res.send(toCsv(rows));
});
