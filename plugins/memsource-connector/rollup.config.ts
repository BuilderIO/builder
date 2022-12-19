import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import common from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
const SERVE = process.env.SERVE === 'true';

const pkg = require('./package.json');

const libraryName = 'plugin';

export default {
  input: `src/${libraryName}.tsx`,
  // Important! We need to have shared references to 'react' and '@builder.io/sdk'
  // for builder plugins to run properly
  // Do not change these! If you install new dependenies, that is ok, they should be
  // left out of this list
  external: [
    'react',
    '@builder.io/react',
    '@builder.io/app-context',
    '@material-ui/core',
    '@material-ui/icons',
    '@emotion/core',
    '@emotion/styled',
    'mobx',
    'react-dom',
    'mobx-react',
    'mobx-state-tree',
  ],
  output: [{ file: pkg.unpkg, format: 'system', sourcemap: true }],
  watch: {
    include: 'src/**',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    json(),
    nodeResolve({ mainFields: ['module', 'browser'] }),
    common(),
    esbuild(),

    ...(SERVE
      ? [
          serve({
            contentBase: 'dist',
            port: 1268,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Private-Network': 'true',
            },
          }),
        ]
      : []),
  ],
};
