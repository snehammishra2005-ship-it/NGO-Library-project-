import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { money, date } from '../utils/format.js';

const CATS = ['BOOK_DAMAGE', 'BOOK_LOST', 'EQUIPMENT', 'FACILITY', 'OTHER'];
const catLabel = (c) => c.replace(/_/g, ' ').toLowerCase();

export default function Maintenance() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'BOOK_DAMAGE', book_id: '', asset_name: '', description: '', cost: '' });

  const load = () => {
    setLoading(true);
    Promise.all([api.listMaintenance({ category }), api.listBooks({ sort: 'title' })])
      .then(([r, b]) => { setRecords(r.records); setBooks(b.books); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [category]); // eslint-disable-line

  const isBookCat = form.category === 'BOOK_DAMAGE' || form.category === 'BOOK_LOST';

  const add = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Description is required');
    const payload = {
      category: form.category, description: form.description, cost: Number(form.cost || 0),
      book_id: isBookCat && form.book_id ? Number(form.book_id) : null,
      asset_name: !isBookCat ? form.asset_name : null,
    };
    try {
      await api.addMaintenance(payload);
      toast.show('Record logged');
      setShowAdd(false);
      setForm({ category: 'BOOK_DAMAGE', book_id: '', asset_name: '', description: '', cost: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    try { await api.deleteMaintenance(id); setRecords((r) => r.filter((x) => x.record_id !== id)); toast.show('Record removed'); }
    catch (e) { toast.error(e.message); }
  };

  const total = records.reduce((s, r) => s + Number(r.cost || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Maintenance</h1>
          <p className="mt-1 text-sm text-ink-500">{records.length} records · {money(total)} total cost</p>
        </div>
        <button onClick={() => setShowAdd((s) => !s)} className="btn-primary">+ Log record</button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="card mt-4 grid gap-3 p-5 sm:grid-cols-4">
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATS.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </div>
          {isBookCat ? (
            <div className="sm:col-span-2"><label className="label">Book</label>
              <select className="input" value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })}>
                <option value="">Select a book…</option>
                {books.map((b) => <option key={b.book_id} value={b.book_id}>{b.title}</option>)}
              </select>
            </div>
          ) : (
            <div className="sm:col-span-2"><label className="label">Item / asset</label>
              <input className="input" value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="e.g. Reading room printer" />
            </div>
          )}
          <div><label className="label">Cost (₹)</label><input type="number" min="0" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
          <div className="sm:col-span-4"><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="sm:col-span-4 flex gap-2"><button className="btn-primary">Save</button><button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button></div>
        </form>
      )}

      <div className="mt-4">
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATS.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
        </select>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[720px]">
            <thead><tr><th>Subject</th><th>Category</th><th>Description</th><th>Cost</th><th>Logged</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-ink-400">Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-ink-400">No records.</td></tr>
              ) : records.map((r) => (
                <tr key={r.record_id}>
                  <td className="text-ink-900">{r.book_title || r.asset_name || '—'}</td>
                  <td className="text-ink-600">{catLabel(r.category)}</td>
                  <td className="max-w-xs truncate text-ink-600">{r.description}</td>
                  <td className="tabular-nums text-ink-900">{money(r.cost)}</td>
                  <td className="text-ink-500">{date(r.logged_on)}</td>
                  <td className="text-right"><button onClick={() => remove(r.record_id)} className="btn-ghost px-2.5 py-1.5 text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
