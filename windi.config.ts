import { defineConfig } from 'vite-plugin-windicss'

export default defineConfig({
  preflight: false,
  darkMode: 'media',
  theme: {
    extend: {},
    // borderColor: (theme) => ({
    //   ...theme('color'),
    //   DEFAULT: theme('colors.gray.300', 'currentColor'),
    // }),
  },
  plugins: [],
})

// module.exports = {
//   purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './packages/**/*.{vue,js,ts,jsx,tsx}'],
//   darkMode: false, // or 'media' or 'class'
//   theme: {
//     extend: {},
//   },
//   variants: {
//     extend: {},
//   },
//   plugins: [],
// }
