import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
// import alias from 'rollup-plugin-alias'
import alias from '@rollup/plugin-alias';
import serve from 'rollup-plugin-serve';
import * as path from 'path';
import visualizer from 'rollup-plugin-visualizer';

const pkg = require('./package.json');

const SERVE = process.env.SERVE === 'true';
const REACT = process.env.REACT === 'true';

const port = process.env.PORT || 1267;
if (SERVE) {
  // Rollup clear console shortly after load and wipes this message,
  // so delay a sec so we can see it
  setTimeout(() => {
    console.log(`\n\nDev server listening on port ${port}...\n\n`);
  }, 10);
}

const libraryName = 'builder-webcomponents';

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['vm2', 'http', 'https', 'buffer', 'zlib', 'node-fetch'],
  watch: {
    include: 'src/**',
  },
  experimentalCodeSplitting: true,
  experimentalDynamicImport: true,
  plugins: [
    // Allow json resolution
    replace({
      'process.env.NODE_ENV': JSON.stringify(SERVE ? 'development' : 'production'),
    }),
    json(),
    alias({
      entries: {
        react: path.resolve('./node_modules/preact/compat/dist/compat.module.js'),
        'react-dom': path.resolve('./node_modules/preact/compat/dist/compat.module.js'),
        '@emotion/core': path.resolve('./node_modules/@emotion/core/dist/core.browser.esm.js'),
        '@builder.io/react': path.resolve(
          './node_modules/@builder.io/react/dist/builder-react.es5.js'
        ),
        '@builder.io/sdk': path.resolve('./node_modules/@builder.io/sdk/dist/index.esm.js'),
        ...(REACT
          ? {
              react: path.resolve('./node_modules/react/cjs/react.development.js'),
              'react-dom': path.resolve('./node_modules/react-dom/cjs/react-dom.development.js'),
            }
          : null),
      },
    }),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    resolve({
      // only: [/^\.{0,2}\//, /lodash\-es/]
      module: true,
    }),
    commonjs({
      ignore: ['http', 'https', 'node-fetch'],
      exclude: ['node_modules/vm2/**'],
      namedExports: {
        './node_modules/react/cjs/react.development.js': [
          'cloneElement',
          'createContext',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment',
          'useState',
          'useEffect',
        ],
        './node_modules/react-dom/cjs/react-dom.development.js': ['render', 'hydrate'],
        'node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef'],
        '../react/node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment',
          'useState',
          'useEffect',
        ],
        '../react/node_modules/react-is/index.js': [
          'isElement',
          'isValidElementType',
          'ForwardRef',
        ],
      },
    }),
    // Don't uglify when serving
    ...(SERVE ? [] : [uglify()]),
    sourceMaps(),
    ...(SERVE
      ? [
          serve({
            port,
            contentBase: '.',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache',
            },
          }),
        ]
      : []),
  ],
};

export default [
  // {
  //   ...options,
  //   output: [{ file: pkg.module, format: 'es', sourcemap: true }],
  //   plugins: options.plugins.concat([sourceMaps()])
  // },
  // {
  //   ...options,
  //   output: [{ file: pkg.unpkg, format: 'iife', sourcemap: true, name: 'BuilderWC' }],
  //   plugins: options.plugins.concat([uglify(), sourceMaps()])
  // },
  {
    ...options,
    output: [{ dir: './dist/system', format: 'system', sourcemap: true }],
    plugins: options.plugins.concat([
      replace({
        'process.env.ANGULAR': 'false',
      }),
    ]),
  },
  {
    ...options,
    output: [{ dir: './dist/system/angular', format: 'system', sourcemap: true }],
    plugins: options.plugins.concat([
      replace({
        'process.env.ANGULAR': 'true',
      }),
    ]),
  },
  // {
  //   ...options,
  //   output: [
  //     {
  //       file: pkg.main, // pkg.browser
  //       name: 'BuilderWC',
  //       format: 'umd',
  //       sourcemap: true,
  //       amd: {
  //         id: '@builder.io/webcomponents'
  //       }
  //     }
  //   ],
  //   plugins: options.plugins.concat([uglify(), sourceMaps()])
  // },
  // Lite - no polyfills
  {
    ...options,
    input: `src/${libraryName}-lite.ts`,
    output: [{ dir: './dist/system/lite', format: 'system', sourcemap: true }],
    plugins: options.plugins.concat([
      replace({
        'process.env.ANGULAR': 'false',
      }),
    ]),
  },
  {
    ...options,
    input: `src/${libraryName}-lite.ts`,
    output: [{ dir: './dist/system/angular/lite', format: 'system', sourcemap: true }],
    plugins: options.plugins.concat([
      replace({
        'process.env.ANGULAR': 'true',
      }),
    ]),
  },
];
