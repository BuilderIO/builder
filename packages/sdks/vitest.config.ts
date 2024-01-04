import { defineConfig } from 'vitest/config';
import { getEvaluatorPathAlias } from './output-generation';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    alias: getEvaluatorPathAlias(),
    globalSetup: 'globalSetup.js',
  },
});
