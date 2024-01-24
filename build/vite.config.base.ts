import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [vue()],
})
