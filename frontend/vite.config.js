import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
      },
      '/health': {
        target: 'https://svc-01k90mssgc72nm6tfmc9yj04b9.01k8xj26nrcvrzs58n1fdp7wwg.lmapp.run',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
