import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  return {
    base: env.VITE_PUBLIC_BASE_PATH,
    plugins: [react()],
  }
})
