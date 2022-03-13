import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
// import WindiCss from 'vite-plugin-windicss'
import { plugins } from './build/vite.plugin'

// const prefix = `monaco-editor/esm/vs`

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

// const config = defineConfig({
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//       ...packages,
//     },
//   },
//   server: {
//     port: 8080,
//   },
//   build: {
//     minify: true,
//     // rollupOptions: {
//     //   output: {
//     //     manualChunks: {
//     //       jsonWorker: [`${prefix}/language/json/json.worker`],
//     //       yamlWorker: [`${prefix}/basic-languages/yaml/yaml?worker`],
//     //       cssWorker: [`${prefix}/language/css/css.worker`],
//     //       htmlWorker: [`${prefix}/language/html/html.worker`],
//     //       tsWorker: [`${prefix}/language/typescript/ts.worker`],
//     //       editorWorker: [`${prefix}/editor/editor.worker`],
//     //     },
//     //   },
//     // },
//   },
//   plugins: [WindiCss()],
// })

// export default mergeConfig(base, config)
