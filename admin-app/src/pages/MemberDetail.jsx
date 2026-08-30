import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Pill from '../components/Pill.jsx';
import { money, date, dateInput } from '../utils/format.js';

const STATUSES = ['ACTIVE', 'PENDING', 'EXPIRED', 'SUSPENDED'];

export default function MemberDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(null);

  const load = () => api.getMember(id).then((d) => { setData(d); setEdit(null); }).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const startEdit = () => setEdit({
    name: data.member.name, email: data.member.email, phone: data.member.phone || '',
    membership_status: data.member.membership_status,
    membership_start: dateInput(data.member.membership_start),
    membership_expiry: dateInput(data.member.membership_expiry),
  });

  const save = async (e) => {
    e.preventDefault();
    try { await api.updateMember(id, edit); toast.show('Member updated'); load(); }
    catch (e) { toast.error(e.message); }
  };

  if (!data) return <p className="text-ink-400">Loading…</p>;
  const m = data.member;

  return (
    <div>
      <Link to="/members" className="text-sm text-ink-500 hover:text-ink-900">← Members</Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{m.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-ink-500">
            <span>{m.email}</span><span>·</span><span>{m.phone || 'no phone'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Pill value={m.membership_status} />
          {isAdmin && !edit && <button onClick={startEdit} className="btn-outline">Edit</button>}
        </div>
      </div>

      {isAdmin && edit && (
        <form onSubmit={save} className="card mt-4 grid gap-3 p-5 sm:grid-cols-3">
          <div><label className="label">Name</label><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
          <div><label className="label">Status</label>
            <select className="input" value={edit.membership_status} onChange={(e) => setEdit({ ...edit, membership_status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Start</label><input type="date" className="input" value={edit.membership_start} onChange={(e) => setEdit({ ...edit, membership_start: e.target.value })} /></div>
          <div><label className="label">Expiry</label><input type="date" className="input" value={edit.membership_expiry} onChange={(e) => setEdit({ ...edit, membership_expiry: e.target.value })} /></div>
          <div className="sm:col-span-3 flex gap-2"><button className="btn-primary">Save</button><button type="button" onClick={() => setEdit(null)} className="btn-ghost">Cancel</button></div>
        </form>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Borrowing history</h2>
          {data.loans.length === 0 ? <p className="mt-3 text-sm text-ink-400">No loans on record.</p> : (
            <ul className="mt-3 divide-y divide-ink-100 text-sm">
              {data.loans.map((l) => (
                <li key={l.log_id} className="flex items-center justify-between py-2.5">
                  <div><p className="text-ink-900">{l.book_title}</p><p className="text-xs text-ink-400">Issued {date(l.issued_on)} · due {date(l.due_on)}</p></div>
                  <span className="text-xs text-ink-500">{l.returned_on ? `returned ${date(l.returned_on)}` : 'on loan'}{l.fine_amount ? ` · fine ${money(l.fine_amount)}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Invoices</h2>
          {data.invoices.length === 0 ? <p className="mt-3 text-sm text-ink-400">No invoices.</p> : (
            <ul className="mt-3 divide-y divide-ink-100 text-sm">
              {data.invoices.map((i) => (
                <li key={i.invoice_id} className="flex items-center justify-between py-2.5">
                  <div><p className="text-ink-900">{money(i.amount)} · {i.type.replace(/_/g, ' ').toLowerCase()}</p><p className="text-xs text-ink-400">{date(i.issued_on)}</p></div>
                  <Pill value={i.payment_status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
