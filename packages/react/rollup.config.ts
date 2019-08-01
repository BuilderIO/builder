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

const externalDependencies = Object.keys(pkg.dependencies)
  .concat(Object.keys(pkg.optionalDependencies || {}))
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
      tsconfigOverride: {
        compilerOptions: {
          // No need to type check and gen over and over, we do once at beggingn of builder with `tsc`
          declaration: false,
          check: false,
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
  // React 15
  {
    ...options,
    output: [
      { file: './dist/15.esm.js', format: 'es', sourcemap: true },
      { file: './dist/15.js', format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//]
        }),
        replace({
          'React.Fragment': '"span"',
          'React.createContext': `require('create-react-context')`
        }),
        regexReplace({
          // ... do replace before commonjs
          patterns: [
            {
              test: /\/\/\/REACT15ONLY/g,
              replace: ''
            },
            {
              test: /\/\*\*\*REACT15ONLY([^\*]+)\*\//g,
              replace: '$1'
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
              replace: 'require("preact/compat")'
            },
            {
              // regexp match with resolved path
              // match: /formidable(\/|\\)lib/,
              // string or regexp
              test: /from ['"]react(-dom)?['"]/g,
              replace: 'from "preact/compat"'
            }
          ]
        }),
        resolve({
          only: [/^\.{0,2}\//]
        }),
        alias({
          react: 'preact/compat',
          'react-dom': 'preact/compat'
        })
      ])
  },
  // Inferno
  // TODO: may have to do react 15 modifications for support (no fragment/context?)
  // {
  //   ...options,
  //   output: [
  //     { file: './dist/inferno.esm.js', format: 'es', sourcemap: true },
  //     { file: './dist/inferno.js', format: 'cjs', sourcemap: true }
  //   ],
  //   external: externalDependencies.filter(
  //     name => !name.startsWith('create-inferno-context') // create-info-context needs bundling as it causes errors otherwise
  //   ),
  //   plugins: options.plugins
  //     .filter(plugin => plugin !== resolvePlugin)
  //     .concat([
  //       resolve({
  //         only: [/^\.{0,2}\//]
  //       }),
  //       alias({
  //         react: 'inferno-compat',
  //         'react-dom': 'inferno-compat',
  //         inferno: 'inferno-compat',
  //         'inferno-dom': 'inferno-compat'
  //       })
  //       // replace({
  //       //   'React.createContext': `require('create-inferno-context')`
  //       // })
  //     ])
  // },
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
