import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/parquet-visualizer/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['parquet-wasm'],
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0, // Don't inline any assets, especially WASM files
  },
  assetsInclude: ['**/*.wasm'],
})
