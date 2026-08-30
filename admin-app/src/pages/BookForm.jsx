import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const empty = {
  title: '', author: '', isbn: '', genre: '', description: '',
  cover_image_url: '', shelf_location: '', total_copies: 1, available_copies: 1,
};

export default function BookForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.getBook(id).then((d) => setForm({ ...empty, ...d.book })).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [id, isEdit]); // eslint-disable-line

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const es = [];
    if (!form.title.trim()) es.push('Title is required');
    if (!form.author.trim()) es.push('Author is required');
    const t = Number(form.total_copies), a = Number(form.available_copies);
    if (isNaN(t) || t < 0) es.push('Total copies must be 0 or more');
    if (isNaN(a) || a < 0) es.push('Available copies must be 0 or more');
    if (a > t) es.push('Available copies cannot exceed total copies');
    return es;
  };

  const submit = async (e) => {
    e.preventDefault();
    const es = validate();
    setErrors(es);
    if (es.length) return;
    setBusy(true);
    const payload = { ...form, total_copies: Number(form.total_copies), available_copies: Number(form.available_copies) };
    try {
      if (isEdit) { await api.updateBook(id, payload); toast.show('Book updated'); }
      else { await api.addBook(payload); toast.show('Book added'); }
      navigate('/books');
    } catch (e) { setErrors([e.message]); } finally { setBusy(false); }
  };

  if (loading) return <p className="text-ink-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">{isEdit ? 'Edit book' : 'Add a book'}</h1>

      {errors.length > 0 && (
        <div className="mt-4 rounded-md border border-ink-900 bg-white px-4 py-3 text-sm text-ink-900">
          <ul className="list-inside list-disc space-y-0.5">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={submit} className="card mt-4 grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Title *</label><input className="input" value={form.title} onChange={set('title')} /></div>
        <div><label className="label">Author *</label><input className="input" value={form.author} onChange={set('author')} /></div>
        <div><label className="label">Genre</label><input className="input" value={form.genre || ''} onChange={set('genre')} /></div>
        <div><label className="label">ISBN</label><input className="input" value={form.isbn || ''} onChange={set('isbn')} /></div>
        <div><label className="label">Shelf location</label><input className="input" value={form.shelf_location || ''} onChange={set('shelf_location')} /></div>
        <div><label className="label">Total copies</label><input type="number" min="0" className="input" value={form.total_copies} onChange={set('total_copies')} /></div>
        <div><label className="label">Available copies</label><input type="number" min="0" className="input" value={form.available_copies} onChange={set('available_copies')} /></div>
        <div className="sm:col-span-2"><label className="label">Cover image URL</label><input className="input" value={form.cover_image_url || ''} onChange={set('cover_image_url')} placeholder="https://… (optional)" /></div>
        <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-[110px] resize-y" value={form.description || ''} onChange={set('description')} /></div>
        <div className="sm:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add book'}</button>
          <button type="button" onClick={() => navigate('/books')} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
