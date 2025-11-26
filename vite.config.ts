import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  // The third argument '' ensures we load all variables.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Base URL is critical for subdirectory hosting
    base: '/suporte-fightarcade/',
    define: {
      // FIX 1: Point to VITE_GEMINI_API_KEY because that is what is in your .env file
      // FIX 2: We use specific assignment. We REMOVED 'process.env': {} to avoid overwriting this key.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
    }
  };
});