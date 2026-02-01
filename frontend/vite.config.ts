import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages subdirectory
  base: '/eConnectOneV1/',
  
  plugins: [
    react()
  ],
  server: {
    proxy: {
      '/api': {
        // Use Render backend if VITE_USE_RAILWAY=true, otherwise use local
        target: process.env.VITE_USE_RAILWAY === 'true' 
          ? 'https://econnectonev1.onrender.com'          
          : 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})