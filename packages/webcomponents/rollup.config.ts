import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import alias from 'rollup-plugin-alias'
import * as path from 'path'
import visualizer from 'rollup-plugin-visualizer'

const pkg = require('./package.json')

const libraryName = 'builder-webcomponents'

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['vm2', 'http', 'https', 'buffer', 'zlib', 'node-fetch'],
  watch: {
    include: 'src/**'
  },
  experimentalCodeSplitting: true,
  experimentalDynamicImport: true,
  plugins: [
    // Allow json resolution
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
      // 'React.createContext': `require('preact-context').createContext`
    }),
    json(),
    alias({
      react: path.resolve('./node_modules/preact/compat/dist/compat.module.js'),
      'react-dom': path.resolve('./node_modules/preact/compat/dist/compat.module.js')
    }),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    resolve({
      // only: [/^\.{0,2}\//, /lodash\-es/]
      module: true
    }),
    commonjs({
      ignore: ['http', 'https', 'node-fetch'],
      exclude: ['node_modules/vm2/**'],
      namedExports: {
        'node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment'
        ],
        'node_modules/react-dom/index.js': ['render', 'hydrate'],
        'node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef'],
        '../react/node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment'
        ],
        '../react/node_modules/react-dom/index.js': ['render', 'hydrate'],
        '../react/node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef']
      }
      // namedExports: {
      //   // left-hand side can be an absolute path, a path
      //   // relative to the current directory, or the name
      //   // of a module in node_modules
      //   // 'preact-compat': ['h', 'Component'],
      //   // [path.resolve('./node_modules/preact-compat/dist/preact-compat.es.js')]: ['h', 'Component']
      // }
    }),
    uglify(),
    sourceMaps()
  ]
}

export default [
  // {
  //   ...options,
  //   output: [{ file: pkg.module, format: 'es', sourcemap: true }],
  //   plugins: options.plugins.concat([sourceMaps()])
  // },
  // {
  //   ...options,
  //   output: [{ file: pkg.unpkg, format: 'iife', sourcemap: true, name: 'BuilderWC' }],
  //   plugins: options.plugins.concat([uglify(), sourceMaps()])
  // },
  {
    ...options,
    output: [{ dir: './dist/system', format: 'system', sourcemap: true }]
  },
  // {
  //   ...options,
  //   output: [
  //     {
  //       file: pkg.main, // pkg.browser
  //       name: 'BuilderWC',
  //       format: 'umd',
  //       sourcemap: true,
  //       amd: {
  //         id: '@builder.io/webcomponents'
  //       }
  //     }
  //   ],
  //   plugins: options.plugins.concat([uglify(), sourceMaps()])
  // },
  // Lite - no polyfills
  {
    ...options,
    input: `src/${libraryName}-lite.ts`,
    output: [{ dir: './dist/system/lite', format: 'system', sourcemap: true }]
  }
]
