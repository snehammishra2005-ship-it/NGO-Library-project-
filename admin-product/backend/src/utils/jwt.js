import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Tokens carry a `role` claim so one middleware can guard both audiences.
export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
