const alias = require('@rollup/plugin-alias')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const { terser } = require('rollup-plugin-terser')
const vue = require('rollup-plugin-vue')
const sizes = require('rollup-plugin-sizes')
const scss = require('rollup-plugin-scss')
const postcss = require('rollup-plugin-postcss')
const banner = require('rollup-plugin-banner').default

module.exports = {
  alias,
  babel,
  nodeResolve,
  commonjs,
  typescript,
  terser,
  vue,
  sizes,
  scss,
  postcss,
  banner,
}
