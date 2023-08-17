/**
 * Using vite hasn't worked so far, but holding on to this file just in case we need to try again
 * in the future. We use `react-native-bob-builder` instead.
 *
 * The main issue is that externalizing `react-native` does not seem to work when Expo tries to consume this library.
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation';

export default defineConfig({
  plugins: [
    viteOutputGenerator({ format: 'js' }),
    // react()
  ],
  build: {
    target: 'es2015',
    lib: {
      entry: './src/index.js',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'isolated-vm',
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-native',
        '@react-native-async-storage/async-storage',
        'react-native-render-html',
        'react-native-storage',
        'react-native-video',
        'react-native-url-polyfill',
        'react-native/Libraries/Utilities/PolyfillFunctions',
      ],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          'react-native': 'react-native',
          reactNative: 'react-native',
        },
      },
    },
  },
});
