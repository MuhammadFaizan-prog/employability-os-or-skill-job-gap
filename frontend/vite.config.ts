import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Inline tiny assets as base64 (< 4 KB) — reduces HTTP requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split large vendor bundles into separate cacheable chunks
        manualChunks: (id) => {
          // React core — stable, rarely changes → long-lived cache
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Supabase client — large, infrequently updated
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // PDF.js — very large (~3MB), only used on Resume page
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdfjs'
          }
          // CodeMirror editor — large, only used in CodingChallenge
          if (
            id.includes('node_modules/@codemirror') ||
            id.includes('node_modules/@uiw/react-codemirror')
          ) {
            return 'vendor-codemirror'
          }
        },
      },
    },
  },

  server: {
    // Security headers for local dev (production headers go on hosting platform)
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
})

