import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../utils/format.js';

export default function Reports() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => { api.reports().then(setData).catch((e) => toast.error(e.message)); }, []); // eslint-disable-line

  const downloadCsv = async () => {
    try {
      const res = await api.reportCsv();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'most-borrowed.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error(e.message); }
  };

  if (!data) return <p className="text-ink-400">Loading…</p>;
  const { revenue, members } = data;
  const maxBorrow = Math.max(1, ...data.mostBorrowed.map((b) => b.times_borrowed));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Reports</h1>
          <p className="mt-1 text-sm text-ink-500">Collection and revenue summaries.</p>
        </div>
        <button onClick={downloadCsv} className="btn-outline">Export most-borrowed (CSV)</button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Revenue */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Revenue</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">Membership fees</dt><dd className="tabular-nums text-ink-900">{money(revenue.membershipFees)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Fines</dt><dd className="tabular-nums text-ink-900">{money(revenue.fines)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Other</dt><dd className="tabular-nums text-ink-900">{money(revenue.other)}</dd></div>
            <div className="flex justify-between border-t border-ink-100 pt-2 font-semibold"><dt className="text-ink-900">Total collected</dt><dd className="tabular-nums text-ink-900">{money(revenue.totalCollected)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Outstanding</dt><dd className="tabular-nums text-ink-600">{money(revenue.outstanding)}</dd></div>
          </dl>
        </section>

        {/* Membership breakdown */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Members by status</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {Object.entries(members).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <dt className="capitalize text-ink-500">{status.toLowerCase()}</dt>
                <dd className="tabular-nums text-ink-900">{count}</dd>
              </div>
            ))}
            {Object.keys(members).length === 0 && <p className="text-ink-400">No members.</p>}
          </dl>
        </section>
      </div>

      {/* Most borrowed */}
      <section className="card mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Most borrowed</h2>
        <div className="mt-4 space-y-2">
          {data.mostBorrowed.length === 0 ? <p className="text-sm text-ink-400">No borrowing recorded yet.</p> : (
            data.mostBorrowed.map((b) => (
              <div key={b.book_id} className="flex items-center gap-3 text-sm">
                <span className="w-48 shrink-0 truncate text-ink-800">{b.title}</span>
                <div className="h-3 flex-1 rounded-sm bg-ink-100">
                  <div className="h-3 rounded-sm bg-ink-900" style={{ width: `${(b.times_borrowed / maxBorrow) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right tabular-nums text-ink-500">{b.times_borrowed}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
