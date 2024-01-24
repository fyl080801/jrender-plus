import path from 'path'
import { mergeConfig, defineConfig } from 'vite'
import base from '../../build/vite.config.base'

const config = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@jrender-plus/core': path.resolve(__dirname, '../core/lib'),
      '@jrender-plus/extends': path.resolve(__dirname, '../extends/lib'),
      '@jrender-plus/element-plus': path.resolve(__dirname, '../element-plus/lib'),
    },
  },
  server: {
    port: 8080,
  },
  // plugins: [WindiCss()],
})

export default mergeConfig(base, config)
