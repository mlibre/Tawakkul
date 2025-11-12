import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js', 
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
