import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE_FILE=1 npm run build  → genera un único .html autocontenido
const singleFile = process.env.SINGLE_FILE === '1'

export default defineConfig({
  plugins: [vue(), ...(singleFile ? [viteSingleFile()] : [])],
  base: './',
  build: {
    outDir: singleFile ? 'dist-single' : 'dist',
    cssCodeSplit: !singleFile,
    assetsInlineLimit: singleFile ? 100000000 : 4096
  },
  server: { host: true, port: 5173 }
})
