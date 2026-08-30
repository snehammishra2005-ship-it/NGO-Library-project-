import { ApiError } from '../utils/http.js';

// 404 for unmatched routes.
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error responder. Known ApiErrors pass their status/message through;
// anything else is logged and returned as a generic 500.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
