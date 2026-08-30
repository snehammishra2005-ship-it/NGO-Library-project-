import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try { await login(form); navigate(from, { replace: true }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface-rail px-6">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <p className="text-lg font-semibold text-white">Library Console</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">Staff access only</p>
        </div>
        <div className="rounded-lg bg-surface p-7 shadow-xl">
          <h1 className="text-lg font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Enter your staff credentials.</p>

          {error && (
            <div className="mt-4 rounded-md border border-ink-900 bg-surface-sunken px-3 py-2 text-sm text-ink-900">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required className="input" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-white/40">
          Admin: admin@library.test · admin123 &nbsp;|&nbsp; Front-desk: staff@library.test · staff123
        </p>
      </div>
    </div>
  );
}
