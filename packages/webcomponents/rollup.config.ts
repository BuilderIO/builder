import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

const pkg = require('./package.json')

const libraryName = 'builder-webcomponents'

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['vm2'],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        'node_modules/d3-ease/dist/d3-ease.js': [
          'easeLinear',
          'easeQuad',
          'easeQuadIn',
          'easeQuadOut',
          'easeQuadInOut',
          'easeCubic',
          'easeCubicIn',
          'easeCubicOut',
          'easeCubicInOut',
          'easePoly',
          'easePolyIn',
          'easePolyOut',
          'easePolyInOut',
          'easeSin',
          'easeSinIn',
          'easeSinOut',
          'easeSinInOut',
          'easeExp',
          'easeExpIn',
          'easeExpOut',
          'easeExpInOut',
          'easeCircle',
          'easeCircleIn',
          'easeCircleOut',
          'easeCircleInOut',
          'easeBounce',
          'easeBounceIn',
          'easeBounceOut',
          'easeBounceInOut',
          'easeBack',
          'easeBackIn',
          'easeBackOut',
          'easeBackInOut',
          'easeElastic',
          'easeElasticIn',
          'easeElasticOut',
          'easeElasticInOut'
        ]
      }
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve()
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
    output: [{ dir: './dist/system', format: 'system', sourcemap: true }],
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true,
    plugins: options.plugins.concat([uglify(), sourceMaps()])
  }
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
  // // Lite - no polyfills
  // {
  //   ...options,
  //   input: `src/${libraryName}-lite.ts`,
  //   output: [{ file: pkg.module.replace(/\.js$/, '.lite.js'), format: 'es', sourcemap: true }],
  //   plugins: options.plugins.concat([sourceMaps()])
  // },
  // {
  //   ...options,
  //   input: `src/${libraryName}-lite.ts`,
  //   output: [
  //     {
  //       file: pkg.main.replace(/\.js$/, '.lite.js'),
  //       name: 'BuilderWC',
  //       format: 'umd',
  //       sourcemap: true,
  //       amd: {
  //         id: '@builder.io/webcomponents'
  //       }
  //     }
  //   ],
  //   plugins: options.plugins.concat([uglify(), sourceMaps()])
  // }
]
