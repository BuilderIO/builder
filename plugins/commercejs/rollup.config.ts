import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

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
    '@emotion/core',
    '@emotion/styled',
    'mobx',
    'react-dom',
    'mobx-react',
  ],
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd',
      sourcemap: true,
    },
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: pkg.unpkg, format: 'system', sourcemap: true },
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),

    // Resolve source maps to the original source
    sourceMaps(),
    nodePolyfills(),
    ...(SERVE
      ? [
          serve({
            contentBase: 'dist',
            port: 1268,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }),
        ]
      : []),
  ],
};
