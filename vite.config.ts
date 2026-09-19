// Dari 'vitest/config', bukan 'vite' — supaya blok `test` di bawah ikut
// ter-type. Selebihnya identik dengan defineConfig milik Vite.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SR Agency',
        short_name: 'SR Agency',
        start_url: '/',
        display: 'standalone',
        background_color: '#0e0e10',
        theme_color: '#0e0e10',
        // Nama file harus persis sama dengan isi public/icons —
        // sebelumnya menunjuk sr-green*.png yang tidak pernah ada, jadi
        // ikon PWA 404 dan app tidak bisa di-install dengan benar.
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],

  test: {
    // Testing Library membersihkan DOM antar test lewat `afterEach` GLOBAL.
    // Tanpa ini pembersihannya tidak pernah terdaftar, render menumpuk, dan
    // kueri seperti getByRole('button') menemukan sisa render test sebelumnya.
    // Test yang sudah ada tetap mengimpor describe/it/expect secara eksplisit;
    // opsi ini hanya menambah, tidak memaksa.
    globals: true,
  },
})
