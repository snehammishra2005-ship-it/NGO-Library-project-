import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDb, closeDb } from './config/db.js';

async function main() {
  await initDb();
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[server] Library API listening on http://localhost:${env.port}`);
    console.log(`[server] Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = async () => {
    console.log('\n[server] shutting down…');
    server.close();
    await closeDb();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
