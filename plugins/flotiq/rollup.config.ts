import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
const SERVE = process.env.SERVE === 'true';
import { readFileSync } from 'fs';
import commonjs from '@rollup/plugin-commonjs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const libraryName = 'plugin';

export default {
  input: `src/${libraryName}.ts`,
  // Important! We need to have shared references to 'react' and '@builder.io/sdk'
  // for builder plugins to run properly
  // Do not change these! If you install new dependenies, that is ok, they should be
  // left out of this list
  external: [
    'react',
    '@builder.io/react',
    '@builder.io/app-context',
    '@material-ui/core',
    '@emotion/core',
    '@emotion/styled',
    'mobx',
    'react-dom',
    'mobx-react',
  ],
  output: [{ file: pkg.unpkg, format: 'system', sourcemap: true }],
  watch: {
    include: 'src/**',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    json(),
    nodeResolve({ mainFields: ['module', 'browser'] }),
    commonjs(),
    esbuild(),

    ...(SERVE
      ? [
        serve({
          contentBase: 'dist',
          port: 1268,
          headers: {
            'Access-Control-Allow-Origin': '*',
            // https://developer.chrome.com/blog/private-network-access-preflight/#new-in-pna
            'Access-Control-Allow-Private-Network': 'true',
          },
        }),
      ]
      : []),
  ],
};
