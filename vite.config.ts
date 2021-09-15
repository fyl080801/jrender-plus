import path from 'path'
import fs from 'fs'
import { mergeConfig, defineConfig } from 'vite'
import base from './build/vite.config.base'

const packages = fs.readdirSync(path.resolve(__dirname, 'packages')).reduce((target, p) => {
  target[`@jrender-plus/${p}`] = path.resolve(__dirname, `packages/${p}/lib`)
  return target
}, {})

const config = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...packages,
    },
  },
  server: {
    port: 8080,
  },
})

export default mergeConfig(base, config)
