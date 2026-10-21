import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Practical clients live in ../practical-*/client, outside this folder.
    fs: { allow: ['..'] },
  },
});
