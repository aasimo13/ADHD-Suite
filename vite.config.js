import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const DEFAULT_REPO_BASE = '/ADHD-Suite/'

const ensureTrailingSlash = (value) =>
  value.endsWith('/') ? value : `${value}/`

const basePath = process.env.APP_BASE_PATH ?? (
  process.env.NODE_ENV === 'production' ? DEFAULT_REPO_BASE : '/'
)

export default defineConfig({
  base: ensureTrailingSlash(basePath),
  base: './',
  plugins: [react()],
})
