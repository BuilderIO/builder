import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'

const pkg = require('./package.json')

const libraryName = 'builder-widgets'

const resolvePlugin = resolve()

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: 'src/**'
  },
  external: ['vm2'],
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
    resolvePlugin,

    // Resolve source maps to the original source
    sourceMaps()
  ]
}

export default [
  {
    ...options,
    output: {
      format: 'umd',
      file: 'dist/builder-widgets.umd.js',
      name: 'BuilderWidgets',
      sourcemap: true,
      amd: {
        id: '@builder.io/widgets'
      }
    }
  },
  {
    ...options,
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true }
    ],
    // Do not resolve for es module build
    // TODO: should really do a cjs build too (probably for the default build instead of umd...)
    external: Object.keys(pkg.dependencies || {}).filter(name => !name.startsWith('lodash-es')),
    plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
      resolve({
        only: [/^\.{0,2}\//, /lodash\-es/]
      })
    ])
  },
  {
    ...options,
    output: {
      format: 'iife',
      file: pkg.unpkg,
      name: 'BuilderWidgets',
      sourcemap: true
    }
  }
  // {
  //   ...options,
  //   output: {
  //     format: 'system',
  //     file: TODO,
  //     sourcemap: true
  //   }
  // }
]
