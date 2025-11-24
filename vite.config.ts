import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so the geminiService works without changing the code
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Prevent crash if other libraries try to access process.env
      'process.env': process.env, 
    },
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
    }
  };
});