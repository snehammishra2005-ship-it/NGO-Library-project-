import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { date, dateInput } from '../utils/format.js';

export default function Borrowing() {
  const toast = useToast();
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState({ bookId: '', memberId: '', dueOn: dateInput(new Date(Date.now() + 14 * 864e5)) });
  const [returning, setReturning] = useState({}); // logId -> fine string

  const load = () => {
    setLoading(true);
    Promise.all([api.openLoans(), api.listBooks({ availability: 'available', sort: 'title' }), api.listMembers()])
      .then(([l, b, m]) => { setLoans(l.loans); setBooks(b.books); setMembers(m.members); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submitIssue = async (e) => {
    e.preventDefault();
    if (!issue.bookId) return toast.error('Pick a book to issue');
    try {
      await api.issue({ bookId: Number(issue.bookId), memberId: issue.memberId ? Number(issue.memberId) : null, dueOn: issue.dueOn || undefined });
      toast.show('Book issued');
      setIssue({ ...issue, bookId: '', memberId: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const submitReturn = async (log) => {
    try {
      await api.return({ logId: log.log_id, fineAmount: Number(returning[log.log_id] || 0) });
      toast.show('Return logged');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Borrowing</h1>
      <p className="mt-1 text-sm text-ink-500">Issue and return physical books at the desk.</p>

      {/* Issue form */}
      <section className="card mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Issue a book</h2>
        <form onSubmit={submitIssue} className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Book (available copies)</label>
            <select className="input" value={issue.bookId} onChange={(e) => setIssue({ ...issue, bookId: e.target.value })}>
              <option value="">Select a book…</option>
              {books.map((b) => <option key={b.book_id} value={b.book_id}>{b.title} — {b.author} ({b.available_copies} left)</option>)}
            </select>
          </div>
          <div>
            <label className="label">Member (optional)</label>
            <select className="input" value={issue.memberId} onChange={(e) => setIssue({ ...issue, memberId: e.target.value })}>
              <option value="">Walk-in</option>
              {members.map((m) => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={issue.dueOn} onChange={(e) => setIssue({ ...issue, dueOn: e.target.value })} />
          </div>
          <div className="sm:col-span-4">
            <button className="btn-primary">Issue book</button>
          </div>
        </form>
      </section>

      {/* Open loans */}
      <section className="card mt-5 overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-900">Open loans ({loans.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[760px]">
            <thead>
              <tr><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Status</th><th>Fine (₹)</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-ink-400">No open loans.</td></tr>
              ) : loans.map((l) => (
                <tr key={l.log_id}>
                  <td className="text-ink-900">{l.book_title}</td>
                  <td className="text-ink-600">{l.member_name}</td>
                  <td className="text-ink-500">{date(l.issued_on)}</td>
                  <td className="text-ink-500">{date(l.due_on)}</td>
                  <td>
                    {l.overdue_days > 0
                      ? <span className="pill border-ink-800 bg-white text-ink-900">{l.overdue_days}d overdue</span>
                      : <span className="pill border-ink-300 bg-white text-ink-500">on time</span>}
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      className="input w-24 py-1"
                      placeholder={String(l.suggested_fine || 0)}
                      value={returning[l.log_id] ?? ''}
                      onChange={(e) => setReturning({ ...returning, [l.log_id]: e.target.value })}
                    />
                  </td>
                  <td className="text-right">
                    <button onClick={() => submitReturn(l)} className="btn-outline px-3 py-1.5 text-xs">Log return</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
