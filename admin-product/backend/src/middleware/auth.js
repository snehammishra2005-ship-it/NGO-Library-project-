import { verifyToken } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../utils/http.js';

// Tokens carry `scope` ('reader' | 'staff'); staff tokens also carry
// `role` ('ADMIN' | 'FRONT_DESK'). This keeps the two audiences separate.
function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Reader (public site self-service account). Own data only.
export function requireReader(req, _res, next) {
  const u = readToken(req);
  if (!u || u.scope !== 'reader') return next(unauthorized());
  req.user = u;
  next();
}

// Any authenticated staff member (ADMIN or FRONT_DESK).
export function requireStaff(req, _res, next) {
  const u = readToken(req);
  if (!u || u.scope !== 'staff') return next(unauthorized());
  req.user = u;
  next();
}

// Staff with the ADMIN role — for sensitive/destructive actions.
export function requireAdmin(req, _res, next) {
  const u = readToken(req);
  if (!u || u.scope !== 'staff') return next(unauthorized());
  if (u.role !== 'ADMIN') return next(forbidden('Admin role required'));
  req.user = u;
  next();
}
