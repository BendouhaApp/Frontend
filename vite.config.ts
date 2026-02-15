import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000/api'

  let backendOrigin = 'http://localhost:3000'
  try {
    backendOrigin = new URL(apiUrl).origin
  } catch {
    // Keep default backend origin
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
