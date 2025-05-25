import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), basicSsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      three: path.resolve(__dirname, 'node_modules/three')
    },
  },
  assetsInclude: ['**/*.fbx', '**/*.glb', '**/*.gltf', '**/*.mp3', '**/*.wav'],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // FBXファイルなどの3Dモデルファイルは元のファイル名を保持
          const extType = path.extname(assetInfo.name || '');
          if (['.fbx', '.glb', '.gltf'].includes(extType)) {
            return `[name][extname]`;
          }
          if (['.mp3', '.wav', '.ogg'].includes(extType)) {
            return `audio/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      strict: false
    }
  }
})
