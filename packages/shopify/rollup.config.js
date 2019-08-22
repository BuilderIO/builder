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

const umdOptions = {
  ...basicOptions,
  output: [
    {
      format: 'umd',
      name: 'BuilderShopify',
      file: 'dist/index.umd.js',
      sourcemap: true,
      amd: {
        id: '@builder.io/shopify',
      },
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

const umdMinOptions = {
  ...umdOptions,
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
