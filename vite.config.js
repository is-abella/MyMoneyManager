import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Workbox is Google's Service Worker library
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Specifies file patterns to cache
        // ** means all directories, * means all files
        
        runtimeCaching: [
          {
            // API request caching
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            // Caches API requests matching this pattern
            
            handler: 'NetworkFirst',
            // NetworkFirst: Try network first, use cache if it fails
            // CacheFirst: Check cache first, make network request if not found
            // StaleWhileRevalidate: Show cache first, update in background
            
            options: {
              cacheName: 'api-cache',
              // Name for this cache
              
              expiration: {
                maxEntries: 50,
                // Store maximum of 50 items in cache
                maxAgeSeconds: 60 * 60 * 24,
                // Cache expires after 24 hours (86400 seconds)
              },
              
              cacheableResponse: {
                statuses: [0, 200],
                // Only cache status codes 0 (CORS) and 200 (success)
              }
            }
          },
          {
            // Image caching
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            // Cache requests for image file extensions
            
            handler: 'CacheFirst',
            // Images don't change often, so prioritize cache
            
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        id: '/',
        name: 'My Money Manager',
        short_name: 'Money',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
         // Background color of the splash screen while app is loading

        theme_color: '#000000',
        // Color of the browser's address bar and task switcher

        display: 'standalone',
        // How the app should be displayed
        // standalone: Like a native app (recommended) no browser bar
        // fullscreen: Full screen mode
        // minimal-ui: Minimal browser UI
        // browser: Regular browser mode
  
        orientation: 'portrait',
        // Lock screen orientation
        // portrait: vertical, landscape: horizontal, any: automatic

        icons: [
          {
            src: '/mmm-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/mmm-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})