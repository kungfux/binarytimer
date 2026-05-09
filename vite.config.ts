import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/binarytimer/',
  server: {
    watch: {
      usePolling: true,
    },
  },
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
      },
      manifest: {
        name: 'Binary Timer',
        short_name: 'Binary Timer',
        description: 'Binary Timer Countdown - A Unique Way to Track Time in Binary!',
        theme_color: '#000',
        background_color: '#fff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '360x640',
            type: 'image/png',
            form_factor: 'narrow'
          },
        ]
      },
    }),
  ],
})
