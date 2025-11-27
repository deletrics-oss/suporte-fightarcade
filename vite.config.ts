import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // 1. RELATIVE BASE: The "Silver Bullet" for subdirectory proxies.
    // using './' prevents the redirect loops caused by absolute paths.
    base: './', 
    
    define: {
      // Inject API Key securely
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: '0.0.0.0',
      cors: true, // Enable CORS
      allowedHosts: true, // Allow all hosts (chatbotfc.shop, IPs, etc)
      
      // 2. SSL/PROXY CONFIGURATION:
      // We only specify clientPort to ensure WSS (Secure WebSockets) works.
      // We do NOT set host/path manually to avoid conflicts.
      hmr: {
        clientPort: 443,
      }
    }
  };
});