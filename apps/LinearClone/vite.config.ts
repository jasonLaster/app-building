import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: false,
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
})
