import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import rootImport from 'rollup-plugin-root-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    rootImport({
      root: `${__dirname}/src`,
      useInput: 'prepend',
      extensions: '.js',
    }),
  ]
})
