import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import serve from 'rollup-plugin-serve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

const SERVE = process.env.SERVE === 'true'

const pkg = require('./package.json')

const libraryName = 'dropdown'

export default {
  input: `src/${libraryName}.tsx`,
  // Important! We need to have shared references to 'react' and '@builder.io/sdk'
  // for builder plugins to run properly
  external: [
    'react',
    '@builder.io/sdk',
    '@material-ui/core',
    '@emotion/core',
    '@emotion/styled',
    'ses',
  ],
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd',
      sourcemap: true
    },
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: pkg.unpkg, format: 'system', sourcemap: true }
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    resolve(),
    commonjs(),
    builtins(),
    globals(),

    // Resolve source maps to the original source
    sourceMaps(),
    ...(SERVE
      ? [
          serve({
            contentBase: 'dist',
            port: 1268,
            headers: {
              'Access-Control-Allow-Origin': '*'
            }
          })
        ]
      : [])
  ]
}
