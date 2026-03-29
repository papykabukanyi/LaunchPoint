import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  root: 'src',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    // Proxy all API calls to the Express backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3300',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router']
        }
      }
    }
  }
})
