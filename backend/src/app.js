import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import publicRouter from './routes/public.js';
import adminRouter from './routes/admin.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', true);

  // The two frontends are allowed origins. Both talk to this one backend
  // but only ever to their own route group.
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', dbMode: env.dbMode, time: new Date().toISOString() })
  );

  // Two clearly separated API layers sharing one database.
  app.use('/api/public', publicRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
