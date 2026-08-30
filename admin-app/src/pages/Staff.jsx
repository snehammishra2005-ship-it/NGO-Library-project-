import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Pill from '../components/Pill.jsx';
import { date } from '../utils/format.js';

export default function Staff() {
  const { user } = useAuth();
  const toast = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FRONT_DESK' });
  const [confirmId, setConfirmId] = useState(null);

  const load = () => { setLoading(true); api.listStaff().then((d) => setStaff(d.staff)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.addStaff(form);
      toast.show('Staff account created');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'FRONT_DESK' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const deactivate = async (id) => {
    try { await api.deleteStaff(id); toast.show('Staff deactivated'); setConfirmId(null); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Staff</h1>
          <p className="mt-1 text-sm text-ink-500">{staff.length} accounts</p>
        </div>
        <button onClick={() => setShowAdd((s) => !s)} className="btn-primary">+ Add staff</button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="card mt-4 grid gap-3 p-5 sm:grid-cols-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Password</label><input type="password" minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="FRONT_DESK">Front desk</option><option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-4 flex gap-2"><button className="btn-primary">Create account</button><button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button></div>
        </form>
      )}

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[640px]">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Added</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : staff.map((s) => (
                <tr key={s.staff_id}>
                  <td className="text-ink-900">{s.name} {s.staff_id === user.id && <span className="text-xs text-ink-400">(you)</span>}</td>
                  <td className="text-ink-600">{s.email}</td>
                  <td><Pill value={s.role} /></td>
                  <td className="text-ink-500">{s.is_active === 'Y' ? 'active' : 'inactive'}</td>
                  <td className="text-ink-500">{date(s.added_on)}</td>
                  <td className="text-right">
                    {s.staff_id !== user.id && s.is_active === 'Y' && (
                      confirmId === s.staff_id ? (
                        <span className="flex items-center justify-end gap-1">
                          <button onClick={() => deactivate(s.staff_id)} className="rounded bg-ink-900 px-2.5 py-1.5 text-xs text-white">Confirm</button>
                          <button onClick={() => setConfirmId(null)} className="btn-ghost px-2 py-1.5 text-xs">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmId(s.staff_id)} className="btn-ghost px-2.5 py-1.5 text-xs">Deactivate</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
