import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Vercel exposes runtime env vars to the build, but Vite only exposes env vars
  // to the client bundle when they are "VITE_"-prefixed. This maps your existing
  // `TASKFLOW_FRONTENT_URL` to a client-visible `VITE_API_BASE_URL`.
  const apiBaseUrl = env.VITE_API_BASE_URL || env.TASKFLOW_FRONTENT_URL || '';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
  };
});
