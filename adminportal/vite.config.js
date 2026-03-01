import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4100,
    proxy: {
      // Forward all /api requests to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Forward /uploads (images) to the backend to avoid cross-origin block
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

