import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import regexReplace from 'rollup-plugin-re'
import json from 'rollup-plugin-json'
import alias from 'rollup-plugin-alias'

import pkg from './package.json'

const libraryName = 'builder-react'

const resolvePlugin = resolve()

const externalDependencies = Object.keys(pkg.dependencies).concat(
  Object.keys(pkg.optionalDependencies || {})
)
// TODO: go back to using peerDependencies once fix rollup iife issue
// .concat(Object.keys(pkg.peerDependencies || {}))

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['vm2'],
  watch: {
    include: 'src/**'
  },
  plugins: [
    typescript({
      include: ['*.js+(|x)', '*.ts+(|x)', '**/*.ts+(|x)'],
      tsconfigOverride: {
        compilerOptions: {
          // No need to type check and gen over and over, we do once at beggingn of builder with `tsc`
          declaration: false,
          check: false,
          checkJs: false,
          allowJs: true
        }
      }
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
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
        'node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef']
      }
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
      // file: pkg.browser,
      file: 'dist/builder-react.browser.js',
      // file: pkg.main,
      name: 'BuilderReact',
      format: 'umd',
      sourcemap: true,
      amd: {
        id: '@builder.io/react'
      }
    }
  },
  // TODO: system for sharing across dynamically loaded
  // react components
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
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//]
        })
      ])
  },
  {
    ...options,
    input: `src/${libraryName}-lite.ts`,
    output: [
      { file: `dist/${libraryName}-lite.esm.js`, format: 'es', sourcemap: true },
      { file: `dist/${libraryName}-lite.cjs.js`, format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//]
        })
      ])
  },
  // Server
  {
    ...options,
    output: [
      { file: './dist/server.esm.js', format: 'es', sourcemap: true },
      { file: './dist/server.js', format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//]
        }),
        regexReplace({
          // ... do replace before commonjs
          patterns: [
            {
              // regexp match with resolved path
              // match: /formidable(\/|\\)lib/,
              // string or regexp
              test: /\/\/\/SERVERONLY/g,
              replace: ''
            }
          ]
        })
      ])
  },
  // Preact
  // TODO: may have to do react 15 modifications for support (no fragment/context?)
  {
    ...options,
    output: [
      { file: './dist/preact.esm.js', format: 'es', sourcemap: true },
      { file: './dist/preact.js', format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        regexReplace({
          // ... do replace before commonjs
          patterns: [
            {
              // regexp match with resolved path
              // match: /formidable(\/|\\)lib/,
              // string or regexp
              test: /require\(['"]react(-dom)?['"]\)/g,
              replace: 'require("preact/compat/dist/compat.module.js")'
            },
            {
              // regexp match with resolved path
              // match: /formidable(\/|\\)lib/,
              // string or regexp
              test: /from ['"]react(-dom)?['"]/g,
              replace: 'from "preact/compat/dist/compat.module.js"'
            }
          ]
        }),
        resolve({
          // only: [/^\.{0,2}\//]
        }),
        alias({
          react: 'preact/compat/dist/compat.module.js',
          'react-dom': 'preact/compat/dist/compat.module.js',
          'preact/hooks': 'preact/hooks/dist/hooks.module.js',
          'preact/debug': 'preact/debug/dist/debug.module.js',
        })
      ])
  },
  {
    ...options,
    output: {
      file: pkg.unpkg,
      format: 'iife',
      name: 'BuilderReact',
      sourcemap: true
    }
  }
]
