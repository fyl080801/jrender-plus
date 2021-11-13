import path from 'path'
import { defineConfig, mergeConfig } from 'vite'
import base from '../../build/vite.config.base'

const config = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib'),
      name: 'JRenderPlusExtends',
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue', '@jrender-plus/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@jrender-plus/core': 'JRenderPlus',
        },
      },
    },
  },
})

export default mergeConfig(base, config)
