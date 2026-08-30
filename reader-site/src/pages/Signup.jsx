import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await signup(form);
      navigate('/account', { replace: true });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-serif text-3xl text-ink-900">Become a member</h1>
          <p className="mt-2 text-sm text-ink-500">
            Create a free account to save books and get notified when a checked-out title returns.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-ink-800 bg-paper-pure px-4 py-3 text-sm text-ink-900">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" required className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone <span className="text-ink-300">(optional)</span></label>
              <input id="phone" className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} className="input"
                value={form.password} onChange={set('password')} />
              <p className="mt-1 text-xs text-ink-400">At least 6 characters.</p>
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already a member? <Link to="/login" className="text-ink-900 underline underline-offset-2">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
