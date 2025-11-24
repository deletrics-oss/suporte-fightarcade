import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This string replacement ensures that wherever the code says process.env.API_KEY,
      // it gets replaced by the actual string value of your key.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    server: {
      port: 3039,
      strictPort: true,
      host: true, // Exposes the server to the network (0.0.0.0)
    }
  };
});