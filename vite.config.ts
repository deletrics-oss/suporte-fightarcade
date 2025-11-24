import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3039,
    strictPort: true,
    host: true, // Exposes the server to the network (0.0.0.0)
  }
});