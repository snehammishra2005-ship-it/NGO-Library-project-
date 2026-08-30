import { ApiError } from '../utils/http.js';

// Lightweight in-memory rate limiter (per IP). Enough to blunt brute-force
// on the admin login without pulling in an external dependency.
export function rateLimit({ windowMs = 60_000, max = 8 } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }
  return (req, _res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const rec = hits.get(ip);
    if (!rec || now > rec.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    rec.count += 1;
    if (rec.count > max) {
      return next(new ApiError(429, 'Too many attempts. Please wait a minute and try again.'));
    }
    next();
  };
}
