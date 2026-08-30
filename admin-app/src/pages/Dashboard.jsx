import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { money, date } from '../utils/format.js';

function Stat({ label, value, sub }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold text-ink-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { api.dashboard().then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-ink-800">{err}</p>;
  if (!d) return <p className="text-ink-400">Loading…</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Overview of the collection and desk activity.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Titles" value={d.totals.totalBooks} sub={`${d.totals.totalCopies} copies`} />
        <Stat label="On loan" value={d.totals.checkedOutCopies} sub={`${d.openLoans} open loans`} />
        <Stat label="Members" value={d.totals.totalMembers} sub={`${d.totals.activeMembers} active`} />
        {isAdmin
          ? <Stat label="Revenue collected" value={money(d.revenueCollected)} sub={`${money(d.unpaidInvoices.total)} outstanding`} />
          : <Stat label="Overdue" value={d.overdue.length} sub="items past due" />}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Overdue alerts */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Overdue loans</h2>
          <div className="mt-3">
            {d.overdue.length === 0 ? (
              <p className="text-sm text-ink-400">Nothing overdue.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {d.overdue.map((l) => (
                  <li key={l.log_id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink-900">{l.book_title}</p>
                      <p className="text-xs text-ink-400">{l.member_name} · due {date(l.due_on)}</p>
                    </div>
                    <span className="pill border-ink-800 bg-white text-ink-900">{l.overdue_days}d over</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Low stock */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Low stock</h2>
          <div className="mt-3">
            {d.lowStock.length === 0 ? (
              <p className="text-sm text-ink-400">All titles well stocked.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {d.lowStock.map((b) => (
                  <li key={b.book_id} className="flex items-center justify-between py-2.5 text-sm">
                    <p className="truncate text-ink-900">{b.title}</p>
                    <span className="text-xs text-ink-500">{b.available_copies}/{b.total_copies} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Recent activity (audit) */}
      {d.recentActivity && (
        <section className="card mt-5 p-5">
          <h2 className="text-sm font-semibold text-ink-900">Recent activity</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {d.recentActivity.map((a) => (
              <li key={a.audit_id} className="flex items-center gap-3 text-ink-600">
                <span className="w-32 shrink-0 text-xs text-ink-400">{date(a.at)}</span>
                <span className="font-mono text-xs text-ink-500">{a.action}</span>
                <span className="truncate">{a.entity} {a.details ? `· ${a.details}` : ''}</span>
                <span className="ml-auto shrink-0 text-xs text-ink-400">{a.staff_name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
