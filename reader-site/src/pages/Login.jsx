import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-serif text-3xl text-ink-900">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-500">Sign in to your reader account.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-ink-800 bg-paper-pure px-4 py-3 text-sm text-ink-900">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required className="input"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New here? <Link to="/signup" className="text-ink-900 underline underline-offset-2">Create an account</Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">
          Demo reader: aarav@reader.test · reader123
        </p>
      </div>
    </div>
  );
}
