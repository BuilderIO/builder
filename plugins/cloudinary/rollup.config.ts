import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import serve from 'rollup-plugin-serve';

const SERVE = process.env.SERVE === 'true';

const pkg = require('./package.json');

const libraryName = 'CloudinaryImageEditor';

export default {
  input: `src/${libraryName}.tsx`,
  // Important! We need to have shared references to 'react' and '@builder.io/sdk'
  // for builder plugins to run properly
  external: ['react', '@builder.io/sdk', '@material-ui/core', '@emotion/core', '@emotion/styled'],
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
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
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
