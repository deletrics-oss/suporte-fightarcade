import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current working directory (process.cwd()).
  // The third argument '' ensures we load all variables (like GEMINI_API_KEY) 
  // even if they don't start with VITE_.
  // Fix: Cast process to any to bypass missing type definition for cwd()
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Injects the API key directly into the code where process.env.API_KEY is used
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Polyfill process.env to an empty object to prevent "process is not defined" crashes
      // in third-party libraries or other parts of the code.
      'process.env': {},
    },
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
    }
  };
});