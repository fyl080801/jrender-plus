const { rollups } = require('../../build')
const { typescript } = require('../../build/rollup.plugins')
const { path } = require('../../build/utils')
const { defineConfig } = require('rollup')

const configs = defineConfig({
  types: ['umd', 'iife', 'esm'],
  external: ['@jrender-plus/core'],
  plugins: [
    ...rollups.defaultPlugins,
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  globals: {
    '@jrender-plus/core': 'JRender',
  },
})

export default (() => {
  const entries = {}

  entries['JRenderElement'] = './lib/index.ts'

  const result = rollups.establish(entries, configs)

  return result
})()
