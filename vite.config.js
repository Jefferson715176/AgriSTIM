import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // A missing import blanks the whole app at runtime, so fail the build instead of warning.
  build: { rollupOptions: {
    onwarn(warning, warn) { if (warning.code === 'MISSING_EXPORT') throw new Error(warning.message); warn(warning) },
    // Vendor code changes rarely, so it stays cached across app deploys and downloads in parallel.
    output: { manualChunks: { react: ['react', 'react-dom', 'react-dom/client'], supabase: ['@supabase/supabase-js'] } },
  } },
})
