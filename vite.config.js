import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')

          if (!normalizedId.includes('/node_modules/')) {
            return undefined
          }

          if (normalizedId.includes('framer-motion')) {
            return 'motion'
          }

          if (normalizedId.includes('react-router')) {
            return 'router'
          }

          if (normalizedId.includes('@supabase/supabase-js')) {
            return 'supabase'
          }

          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/')
          ) {
            return 'react-vendor'
          }

          return undefined
        },
      },
    },
  },
})
