import path from 'path'
import { defineConfig, mergeConfig } from 'vite'
import base from '../../build/vite.config.base'

const config = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib'),
      name: 'JRPElementPlus',
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          format: 'es',
          esModule: true,
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
        },
        {
          format: 'umd',
          inlineDynamicImports: true,
          interop: 'default',
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
        },
      ],
    },
  },
})

export default mergeConfig(base, config)
