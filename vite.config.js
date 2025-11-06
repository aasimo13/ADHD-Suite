import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const basePath = process.env.APP_BASE_PATH || '/ADHD-Suite/'

export default defineConfig({
  base: basePath,
  plugins: [react()],
})
