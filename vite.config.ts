import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // CRITICAL FIX: Use relative base './' to prevent Redirect Loops and MIME type errors
    // when served behind Nginx/Cloudflare in a subdirectory.
    base: './', 
    
    define: {
      // Inject API Key securely
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: '0.0.0.0',
      // Allow the specific domain
      allowedHosts: ['chatbotfc.shop'], 
      
      // SSL/Proxy Configuration
      hmr: {
        clientPort: 443, // Forces WSS connection for SSL
      }
    }
  };
});