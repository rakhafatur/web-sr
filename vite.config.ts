import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SR Agent',
        short_name: 'SR Agent',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a102b',
        theme_color: '#1a102b',
        icons: [
          {
            src: '/icons/sr-green.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/sr-green-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }), ,
  ],
})