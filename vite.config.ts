import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  // Using process.cwd() directly as it is global in Node.js environment
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Base URL set to relative './' to work in any subdirectory
    base: './',
    define: {
      // Inject API Key securely
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: '0.0.0.0', // Exposes the server to the network
      // Allow any host to access (simplifies setup for custom domains)
      allowedHosts: true,
      // CRITICAL FIX for HTTPS/Proxy:
      // Forces the browser to connect via HTTPS (WSS) on port 443, 
      // instead of trying HTTP on port 3039 (which fails or is blocked).
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      }
    }
  };
});