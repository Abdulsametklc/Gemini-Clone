import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gemini_clone/',
  build: {
    chunkSizeWarningLimit: 1000 // uyarı sınırını 1 MB yapar
  }
})
