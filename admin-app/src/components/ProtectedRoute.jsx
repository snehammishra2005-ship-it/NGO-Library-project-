import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards staff routes. adminOnly => also require ADMIN role.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-400">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && user.role !== 'ADMIN') {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <p className="text-2xl font-semibold text-ink-900">Restricted</p>
          <p className="mt-2 text-ink-500">This section is available to Admin accounts only.</p>
        </div>
      </div>
    );
  }
  return children;
}
