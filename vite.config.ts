import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
    resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      three: path.resolve(__dirname, 'node_modules/three')
    },
  },
})
