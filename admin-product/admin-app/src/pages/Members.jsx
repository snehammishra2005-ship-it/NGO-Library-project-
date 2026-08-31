import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Pill from '../components/Pill.jsx';
import { date } from '../utils/format.js';

const STATUSES = ['ACTIVE', 'PENDING', 'EXPIRED', 'SUSPENDED'];

export default function Members() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', membership_status: 'ACTIVE' });

  const load = () => {
    setLoading(true);
    api.listMembers({ q: term, status }).then((d) => setMembers(d.members)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [status]); // eslint-disable-line

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.addMember(form);
      toast.show('Member registered');
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', membership_status: 'ACTIVE' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Members</h1>
          <p className="mt-1 text-sm text-ink-500">{members.length} members</p>
        </div>
        {isAdmin && <button onClick={() => setShowAdd((s) => !s)} className="btn-primary">+ Register member</button>}
      </div>

      {isAdmin && showAdd && (
        <form onSubmit={add} className="card mt-4 grid gap-3 p-5 sm:grid-cols-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.membership_status} onChange={(e) => setForm({ ...form, membership_status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-4 flex gap-2">
            <button className="btn-primary">Save member</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2">
          <input className="input w-64" placeholder="Search name or email…" value={term} onChange={(e) => setTerm(e.target.value)} />
          <button className="btn-outline">Search</button>
        </form>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[720px]">
            <thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Expiry</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-ink-400">No members found.</td></tr>
              ) : members.map((m) => (
                <tr key={m.member_id}>
                  <td><Link to={`/members/${m.member_id}`} className="font-medium text-ink-900 hover:underline">{m.name}</Link></td>
                  <td className="text-ink-600">{m.email}<br /><span className="text-xs text-ink-400">{m.phone || '—'}</span></td>
                  <td><Pill value={m.membership_status} /></td>
                  <td className="text-ink-500">{date(m.membership_expiry)}</td>
                  <td className="text-right"><Link to={`/members/${m.member_id}`} className="btn-ghost px-3 py-1.5 text-xs">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
