import { join } from 'path';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import alias from 'rollup-plugin-alias';
import { terser } from 'rollup-plugin-terser';

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
          jsx: 'react',
        },
      },
      tsconfig: join(__dirname, 'tsconfig.json'),
    }),
    json(),
    commonjs({
      namedExports: {
        'node_modules/liquidjs/dist/liquid.js': ['Liquid', 'Context', 'Expression'],
      },
    }),
    alias({
      liquidjs: join(__dirname, './node_modules/liquidjs/dist/liquid.js'),
    }),
  ],
};

const clientOptions = {
  ...basicOptions,
  input: './js/index.ts',
  output: [
    {
      format: 'es',
      file: 'js/index.js',
      sourcemap: true,
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

const trackOptions = {
  ...basicOptions,
  input: './track/track.ts',
  output: [
    {
      format: 'iife',
      file: 'track.js',
      sourcemap: true,
    },
  ],
  external: [],
  plugins: basicOptions.plugins.concat([resolve(), terser()]),
};

const reactOptions = {
  ...basicOptions,
  input: './react/react.ts',
  output: [
    {
      format: 'es',
      file: 'dist/react/bundle.esm.js',
      sourcemap: true,
    },
    {
      format: 'cjs',
      file: 'dist/react/bundle.cjs.js',
      sourcemap: true,
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

export default [clientOptions, reactOptions, trackOptions];
