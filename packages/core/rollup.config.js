import * as ts from 'typescript';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const basicOptions = {
  input: './index.ts',

  context: 'window',

  plugins: [
    typescript({
      typescript: ts,
      useTsconfigDeclarationDir: true,
    }),
    json(),
    commonjs({
      namedExports: {
        'js-cookie': ['get', 'set'],
        './node_modules/es6-promise/dist/es6-promise.j': ['polyfill'],
      },
    }),
  ],
};

const umdOptions = {
  ...basicOptions,
  output: [
    {
      format: 'umd',
      name: 'BuilderIO',
      file: 'dist/index.umd.js',
      sourcemap: true,
      amd: {
        id: '@builder.io/sdk',
      },
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

const umdMinOptions = {
  ...basicOptions,
  output: [
    {
      format: 'umd',
      name: 'BuilderIO',
      file: pkg.unpkg,
      sourcemap: true,
      amd: {
        id: '@builder.io/sdk',
      },
    },
  ],
  plugins: basicOptions.plugins.concat([resolve(), uglify()]),
};

const externalModuleOptions = {
  ...basicOptions,
  output: [
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
    },
    {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
  ],
  external: Object.keys(pkg.dependencies || {}),
  plugins: basicOptions.plugins.concat([
    resolve({
      only: [/^\.{0,2}\//],
    }),
  ]),
};

export default [umdOptions, umdMinOptions, externalModuleOptions];
