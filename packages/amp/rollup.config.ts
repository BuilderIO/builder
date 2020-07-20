import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

const pkg = require('./package.json');

const libraryName = 'builder-amp';

const resolvePlugin = resolve();

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: 'src/**',
  },
  external: ['vm2'],
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({}),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolvePlugin,

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};

export default [
  {
    ...options,
    output: {
      format: 'umd',
      file: pkg.main,
      name: 'BuilderAmp',
      sourcemap: true,
      amd: {
        id: '@builder.io/amp',
      },
    },
  },
  {
    ...options,
    output: {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
    // Do not resolve for es module build
    // TODO: should really do a cjs build too (probably for the default build instead of umd...)
    external: Object.keys(pkg.dependencies || {}),
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//],
        }),
      ]),
  },
  {
    ...options,
    output: {
      format: 'iife',
      file: pkg.unpkg,
      name: 'BuilderWidgets',
      sourcemap: true,
    },
  },
  // {
  //   ...options,
  //   output: {
  //     format: 'system',
  //     file: TODO,
  //     sourcemap: true
  //   }
  // }
];
