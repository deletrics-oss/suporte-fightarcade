import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  // The third argument '' ensures we load all variables.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Base URL set to relative './' to prevent ERR_TOO_MANY_REDIRECTS on subdirectories
    base: './',
    define: {
      // FIX: Point to VITE_GEMINI_API_KEY as per .env file
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
      // Allow specific domains to access the dev server to prevent Invalid Host Header errors
      allowedHosts: [
        'chatbotfc.shop', 
        '.chatbotfc.shop', 
        '72.60.246.250', 
        'localhost'
      ]
    }
  };
});