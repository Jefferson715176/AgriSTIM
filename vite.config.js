import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // A missing import blanks the whole app at runtime, so fail the build instead of warning.
  build: { rollupOptions: { onwarn(warning, warn) { if (warning.code === 'MISSING_EXPORT') throw new Error(warning.message); warn(warning) } } },
})
