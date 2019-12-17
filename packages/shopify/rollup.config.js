import * as ts from 'typescript';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const basicOptions = {
  input: './index.ts',

  context: 'window',

  external: ['react', '@builder.io/react', '@builder.io/sdk'],

  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          // No need to type check and gen over and over, we do once at beggingn of builder with `tsc`
          declaration: false,
          allowJs: true,
        },
      },
    }),
    json(),
    commonjs({}),
  ],
};

const clientOptions = {
  ...basicOptions,
  input: './js/index.ts',
  output: [
    {
      format: 'es',
      file: 'js/index.js',
      sourcemap: true
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

const reactOptions = {
  ...basicOptions,
  input: './react/index.ts',
  output: [
    {
      format: 'es',
      file: 'react/index.js',
      sourcemap: true
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

export default [clientOptions, reactOptions];
