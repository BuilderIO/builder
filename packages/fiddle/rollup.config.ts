import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');

const libraryName = 'builder-fiddle';

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
  ],
};

export default [
  // React CJS
  {
    ...options,
    output: [{ file: 'dist/react.js', format: 'cjs', sourcemap: true }],
    plugins: options.plugins.concat([sourceMaps()]),
  },
  // ES
  {
    ...options,
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
    plugins: options.plugins.concat([sourceMaps()]),
  },
  {
    ...options,
    output: [
      {
        file: pkg.main,
        name: 'BuilderFiddle',
        format: 'umd',
        sourcemap: true,
        amd: {
          id: '@builder.io/fiddle',
        },
      },
    ],
    plugins: options.plugins.concat([uglify(), sourceMaps()]),
  },
];
