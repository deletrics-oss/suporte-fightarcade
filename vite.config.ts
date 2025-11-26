import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // 1. EXPLICIT BASE: Essential for serving under a subpath behind a proxy
    base: '/suporte-fightarcade/', 
    
    define: {
      // Inject API Key securely
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: '0.0.0.0', 
      allowedHosts: true, // Allow all hosts (including chatbotfc.shop)
      
      // 2. SSL/PROXY CONFIGURATION:
      // This tells the browser to connect to the WebSocket via the secure public domain
      hmr: {
        protocol: 'wss', // Force Secure WebSocket
        host: 'chatbotfc.shop', // The public domain
        clientPort: 443, // The public SSL port
        path: '/suporte-fightarcade/', // Match the base path context
      }
    }
  };
});