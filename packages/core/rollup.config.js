const { rollups } = require('../../build')
const {
  typescript,
  vue,
  scss,
  // postcss
} = require('../../build/rollup.plugins')
const { path } = require('../../build/utils')
const { defineConfig } = require('rollup')

const configs = defineConfig({
  types: ['umd', 'iife', 'esm'],
  external: [],
  plugins: [
    vue(),
    ...rollups.defaultPlugins,

    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
    scss(),
    // postcss({
    //   plugins: [require("tailwindcss"), require("autoprefixer")]
    // })
  ],
})

export default (() => {
  const entries = {}

  entries['JRender'] = './lib/index.ts'

  const result = rollups.establish(entries, configs)

  return result
})()
