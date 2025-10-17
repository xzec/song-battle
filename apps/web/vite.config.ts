import path from 'node:path'
import validateEnv from '@repo/vite-plugin-validate-env'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { envSchema } from './env-schema'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3029,
    open: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 3030,
  },
  plugins: [
    validateEnv(envSchema),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
})
