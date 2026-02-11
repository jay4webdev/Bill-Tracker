import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This is critical to map the process.env.API_KEY used in the code
      // to the environment variable injected by Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});