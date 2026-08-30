import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-sunken px-6 text-center">
      <div>
        <p className="text-5xl font-semibold text-ink-900">404</p>
        <p className="mt-3 text-ink-500">That console page doesn’t exist.</p>
        <Link to="/" className="btn-primary mt-6">Back to dashboard</Link>
      </div>
    </div>
  );
}
