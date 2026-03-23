import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'stacks-vendor': ['@stacks/connect', '@stacks/network', '@stacks/transactions'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
  },
})
