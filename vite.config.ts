import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import { plugins } from './build/vite.plugin'

const packages = fs.readdirSync(path.resolve(__dirname, 'packages')).reduce((target, p) => {
  target[`@jrender-plus/${p}`] = path.resolve(__dirname, `packages/${p}/lib`)
  return target
}, {})

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...packages,
    },
  },
  build: {
    minify: true,
  },
  plugins,
  server: {
    port: 8080,
  },
})
