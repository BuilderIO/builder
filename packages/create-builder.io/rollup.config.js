import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    strict: false,
    banner: '#! /usr/bin/env node\n',
    preferConst: true,
  },
  plugins: [
    resolve(),
    typescript(),
    json(),
    commonjs({
      dynamicRequireTargets: ['graphql-typed-client', 'figlet'],
    }),
  ],
  external: [
    'child_process',
    'replace-in-file',
    'graphql-typed-client',
    'figlet',
    'fs',
    'path',
    'os',
    'https',
    'readline',
    'zlib',
    'events',
    'stream',
    'util',
    'buffer',
  ],
};
