import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const injectBootApiMeta = (): import('vite').Plugin => ({
  name: 'inject-boot-api-meta',
  transformIndexHtml(html) {
    const apiUrl = String(process.env.VITE_SHIORI_API_URL ?? '')
      .trim()
      .replace(/"/g, '')
    if (!apiUrl) return html
    return html.replace(
      '<head>',
      `<head>\n    <meta name="shiori-api-url" content="${apiUrl}" />`,
    )
  },
})

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const appVersion = JSON.parse(
  readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8')
).version as string

/** Short git SHA for build identity — empty if git is unavailable. */
const resolveAppBuild = (): string => {
  const fromEnv = String(process.env.VITE_APP_BUILD ?? process.env.GITHUB_SHA ?? '').trim()
  if (fromEnv) return fromEnv.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const appBuild = resolveAppBuild()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectBootApiMeta()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    'import.meta.env.VITE_APP_BUILD': JSON.stringify(appBuild),
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@tanstack/')) return 'query'
          if (id.includes('react-router') || id.includes('@remix-run/router')) return 'router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('@radix-ui') || id.includes('radix-ui')) return 'radix'
          if (id.includes('lucide-react') || id.includes('hugeicons-react')) return 'icons'
          if (id.includes('date-fns')) return 'date-fns'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
})
