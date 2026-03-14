import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../apps/shared'),
    },
  },
  build: {
    sourcemap: true,
    minify: false,
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
      },
    },
  },
})
