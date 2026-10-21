import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_URL || 'http://localhost:3002/api').replace(/\/api\/?$/, '')

  return {
    plugins: [
      react(),
      {
        name: 'lcp-head-order',
        transformIndexHtml(html) {
          // Prefer stylesheet before module JS so CSS isn't starved behind a 300KB+ chunk
          return html.replace(
            /(<script type="module"[^>]*><\/script>)\s*(<link rel="stylesheet"[^>]*>)/i,
            '$2\n    $1'
          );
        },
      },
    ],
    server: {
      proxy: {
        // Live DB-driven sitemap during local development
        '/sitemap.xml': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
