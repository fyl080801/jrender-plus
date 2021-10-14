import path from 'path'
import { defineConfig, mergeConfig } from 'vite'
import base from '../../build/vite.config.base'
import pkg from './package.json'

const config = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib'),
      name: pkg.name,
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue'],
    },
  },
})

export default mergeConfig(base, config)
