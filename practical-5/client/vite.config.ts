import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The Practical 4 API has no CORS yet (that arrives in Practical 6), so the dev
    // server forwards /api/* to it and the browser only ever talks to one origin.
    proxy: {
      '/api': { target: 'http://localhost:5000', rewrite: (p) => p.replace(/^\/api/, '') },
    },
  },
});
