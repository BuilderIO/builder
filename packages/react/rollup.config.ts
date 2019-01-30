import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'

const pkg = require('./package.json')

const libraryName = 'builder-react'

const resolvePlugin = resolve()

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['vm2'],
  watch: {
    include: 'src/**'
  },
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      exclude: ['node_modules/vm2/**']
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    // resolve({}),
    resolvePlugin,

    // Resolve source maps to the original source
    sourceMaps()
  ]
}

export default [
  {
    ...options,
    output: {
      // TODO: pkg.browser
      file: pkg.browser,
      // file: pkg.main,
      name: 'BuilderReact',
      format: 'umd',
      sourcemap: true,
      amd: {
        id: '@builder.io/react'
      }
    }
  },
  // TODO: system
  // {
  //   ...options,
  //   output: { file: './dist/system.js', format: 'system', name: '@builder.io/react', sourcemap: true },
  //   external: ['react', '@builder.io/sdk'],
  //   plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
  //     resolve({
  //       // only: [/^\.{0,2}\//]
  //     })
  //   ])
  // },
  {
    ...options,
    // TODO:
    // output: [
    //   {
    //     format: 'cjs',
    //     file: pkg.main,
    //     sourcemap: true,
    //   },
    //   {
    //     format: 'es',
    //     file: pkg.module,
    //     sourcemap: true,
    //   },
    // ],
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true }
    ],
    external: Object.keys(pkg.dependencies || {}).filter(name => !name.startsWith('lodash-es')),
    plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
      resolve({
        only: [/^\.{0,2}\//, /lodash\-es/]
      })
    ])
  },
  {
    ...options,
    output: { file: pkg.unpkg, format: 'iife', name: 'BuilderReact', sourcemap: true }
  }
]
