import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite Configuration
 * 
 * This configuration includes:
 * - React plugin for JSX/TSX support
 * - Path alias (@) for cleaner imports
 * - Code splitting for optimal caching
 * - Test configuration for Vitest
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map @ to src directory for cleaner imports
      // Example: import { Service } from '@/services/Service'
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'stacks-vendor': ['@stacks/connect', '@stacks/network', '@stacks/transactions'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Polyfill for Node.js global in browser
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
