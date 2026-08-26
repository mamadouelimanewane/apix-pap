import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  define: {
    global: 'globalThis',
    process: {
      env: {}
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/leaflet')) return 'maps';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules')) return 'vendors';
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
  }
})
