// Small helpers for consistent errors and async route wiring.

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (msg) => new ApiError(400, msg);
export const unauthorized = (msg = 'Not authenticated') => new ApiError(401, msg);
export const forbidden = (msg = 'Not allowed') => new ApiError(403, msg);
export const notFound = (msg = 'Not found') => new ApiError(404, msg);
export const conflict = (msg) => new ApiError(409, msg);

// Wrap async handlers so thrown/rejected errors reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
