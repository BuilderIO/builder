import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import regexReplace from 'rollup-plugin-re';
import replace from 'rollup-plugin-replace';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

const libraryName = 'builder-widgets';

const resolvePlugin = resolve();

const externalDependencies = Object.keys(pkg.dependencies)
  .concat(Object.keys(pkg.optionalDependencies || {}))
  .concat(Object.keys(pkg.peerDependencies || {}))
  .filter(name => !name.startsWith('lodash'));

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: 'src/**',
  },
  external: ['vm2'],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      // TODO: remove me!
      check: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      exclude: ['node_modules/vm2/**'],
      namedExports: {
        'node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'createRef',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment',
          'useContext',
          'useState',
          'useEffect',
        ],
        'node_modules/react-dom/index.js': ['render', 'hydrate'],
        'node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef'],
        '../react/node_modules/react/index.js': [
          'cloneElement',
          'createContext',
          'createRef',
          'Component',
          'createElement',
          'forwardRef',
          'Fragment',
        ],
        '../react/node_modules/react-dom/index.js': ['render', 'hydrate'],
        '../react/node_modules/react-is/index.js': [
          'isElement',
          'isValidElementType',
          'ForwardRef',
        ],
      },
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolvePlugin,

    // Resolve source maps to the original source
    // sourceMaps(),
  ],
};

export default [
  {
    ...options,
    output: [
      { dir: 'dist/builder-widgets-es5', format: 'es', sourcemap: true },
      { dir: 'dist/builder-widgets-cjs', format: 'cjs', sourcemap: true },
    ],
    // Do not resolve for es module build
    // TODO: should really do a cjs build too (probably for the default build instead of umd...)
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//, /lodash\-es/],
        }),
      ]),
  },
  {
    ...options,
    input: 'src/builder-widgets-async.tsx',
    output: [{ dir: 'dist/builder-widgets-async', format: 'es', sourcemap: true }],
    // Do not resolve for es module build
    // TODO: should really do a cjs build too (probably for the default build instead of umd...)
    external: externalDependencies,
    plugins: options.plugins
      .filter(plugin => plugin !== resolvePlugin)
      .concat([
        resolve({
          only: [/^\.{0,2}\//, /lodash\-es/],
        }),
      ]),
  },
];
