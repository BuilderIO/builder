import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const libraryName = 'builder-react-native';

const resolvePlugin = resolve();

const externalDependencies = Object.keys(pkg.dependencies)
  // TODO: go back to using peerDependencies once fix rollup iife issue
  // .concat(Object.keys(pkg.peerDependencies || {}))
  .filter(name => !name.startsWith('lodash-es'));

const options = {
  input: `src/${libraryName}.ts`,
  watch: {
    include: 'src/**',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          // No need to type check and gen over and over, we do once at beggingn of builder with `tsc`
          declaration: false,
          // check: false,
          allowJs: true,
        },
      },
    }),
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
    // resolve({}),
    resolvePlugin,

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};

export default [
  {
    ...options,
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true },
    ],
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//, /lodash\-es/],
        }),
      ]),
  },
];
