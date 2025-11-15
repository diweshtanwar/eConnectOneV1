import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages subdirectory
  base: '/eConnectOneV1/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'eConnectOne Portal',
        short_name: 'eConnectOne',
        description: 'Complete support portal for ticket management and CSP services',
        theme_color: '#1976d2',
        background_color: '#1976d2',
        display: 'standalone',
        scope: '/eConnectOneV1/',
        start_url: '/eConnectOneV1/',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})