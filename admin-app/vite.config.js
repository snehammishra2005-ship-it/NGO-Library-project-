import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin app runs on its own port and talks ONLY to /api/admin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/admin': 'http://localhost:4000',
    },
  },
});
