import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
    },
    define: {
      // This maps the server-side API_KEY to the client-side process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents 'process is not defined' error in browser
      'process.env': {},
    },
  };
});