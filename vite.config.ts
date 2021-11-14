import path from 'path'
import fs from 'fs'
import { mergeConfig, defineConfig } from 'vite'
import WindiCss from 'vite-plugin-windicss'
import base from './build/vite.config.base'

const prefix = `monaco-editor/esm/vs`

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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jsonWorker: [`${prefix}/language/json/json.worker`],
          yamlWorker: [`${prefix}/basic-languages/yaml/yaml?worker`],
          cssWorker: [`${prefix}/language/css/css.worker`],
          htmlWorker: [`${prefix}/language/html/html.worker`],
          tsWorker: [`${prefix}/language/typescript/ts.worker`],
          editorWorker: [`${prefix}/editor/editor.worker`],
        },
      },
    },
  },
  plugins: [WindiCss()],
})

export default mergeConfig(base, config)
