import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'

// `npm run build:single` (vite build --mode single) genera un único .html
// autocontenido. Se usa el modo de Vite en vez de una variable de entorno para
// que funcione igual en Windows, macOS y Linux sin dependencias extra.
export default defineConfig(({ mode }) => {
  const singleFile = mode === 'single' || process.env.SINGLE_FILE === '1'

  return {
    plugins: [
      vue(),
      ...(singleFile
        ? [viteSingleFile()]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.png', 'apple-touch-icon.png'],
              manifest: {
                name: 'ActiVida · Reto Running',
                short_name: 'ActiVida',
                description: 'Reto mensual de running de ActiVida — consigue tus badges y sube de tier.',
                theme_color: '#2ee56f',
                background_color: '#f4f8f5',
                display: 'standalone',
                start_url: '/',
                icons: [
                  { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
                  { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
                  { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
              }
            })
          ])
    ],
    base: './',
    build: {
      outDir: singleFile ? 'dist-single' : 'dist',
      cssCodeSplit: !singleFile,
      assetsInlineLimit: singleFile ? 100000000 : 4096
    },
    server: { host: true, port: 5173 },
    test: {
      environment: 'node',
      include: ['src/**/*.{test,spec}.js']
    }
  }
})
