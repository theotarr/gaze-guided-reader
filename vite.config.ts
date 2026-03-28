import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        // Only the bare specifier — do not rewrite `@mediapipe/face_mesh/face_mesh.js`
        find: /^@mediapipe\/face_mesh$/,
        replacement: path.resolve(__dirname, 'src/shims/mediapipe-face-mesh.ts'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
