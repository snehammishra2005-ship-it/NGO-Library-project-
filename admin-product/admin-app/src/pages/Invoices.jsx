import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Pill from '../components/Pill.jsx';
import { money, date } from '../utils/format.js';

const TYPES = ['MEMBERSHIP_FEE', 'FINE', 'OTHER'];

export default function Invoices() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_id: '', type: 'MEMBERSHIP_FEE', amount: '', payment_status: 'UNPAID', notes: '' });

  const load = () => {
    setLoading(true);
    Promise.all([api.listInvoices({ status }), api.listMembers()])
      .then(([i, m]) => { setInvoices(i.invoices); setMembers(m.members); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [status]); // eslint-disable-line

  const add = async (e) => {
    e.preventDefault();
    if (!form.member_id) return toast.error('Choose a member');
    try {
      await api.addInvoice({ ...form, amount: Number(form.amount) });
      toast.show('Invoice created');
      setShowAdd(false);
      setForm({ member_id: '', type: 'MEMBERSHIP_FEE', amount: '', payment_status: 'UNPAID', notes: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const togglePaid = async (inv) => {
    try {
      await api.setInvoicePayment(inv.invoice_id, inv.payment_status === 'PAID' ? 'UNPAID' : 'PAID');
      toast.show('Payment status updated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Invoices &amp; receipts</h1>
          <p className="mt-1 text-sm text-ink-500">{invoices.length} invoices</p>
        </div>
        <button onClick={() => setShowAdd((s) => !s)} className="btn-primary">+ New invoice</button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="card mt-4 grid gap-3 p-5 sm:grid-cols-5">
          <div className="sm:col-span-2"><label className="label">Member</label>
            <select className="input" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}>
              <option value="">Select…</option>
              {members.map((m) => <option key={m.member_id} value={m.member_id}>{m.name}</option>)}
            </select>
          </div>
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div><label className="label">Amount (₹)</label><input type="number" min="0" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
              <option value="UNPAID">UNPAID</option><option value="PAID">PAID</option>
            </select>
          </div>
          <div className="sm:col-span-5"><label className="label">Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="sm:col-span-5 flex gap-2"><button className="btn-primary">Create</button><button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button></div>
        </form>
      )}

      <div className="mt-4">
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option><option value="UNPAID">Unpaid</option><option value="PAID">Paid</option>
        </select>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[760px]">
            <thead><tr><th>#</th><th>Member</th><th>Type</th><th>Amount</th><th>Issued</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-ink-400">No invoices.</td></tr>
              ) : invoices.map((i) => (
                <tr key={i.invoice_id}>
                  <td className="font-mono text-xs text-ink-400">#{i.invoice_id}</td>
                  <td className="text-ink-900">{i.member_name}</td>
                  <td className="text-ink-600">{i.type.replace(/_/g, ' ').toLowerCase()}</td>
                  <td className="tabular-nums text-ink-900">{money(i.amount)}</td>
                  <td className="text-ink-500">{date(i.issued_on)}</td>
                  <td><Pill value={i.payment_status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => togglePaid(i)} className="btn-ghost px-2.5 py-1.5 text-xs">
                        {i.payment_status === 'PAID' ? 'Mark unpaid' : 'Mark paid'}
                      </button>
                      <Link to={`/invoices/${i.invoice_id}`} className="btn-outline px-2.5 py-1.5 text-xs">Receipt</Link>
                    </div>
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
