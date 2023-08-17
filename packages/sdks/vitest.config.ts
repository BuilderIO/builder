import { defineConfig } from 'vitest/config';
import { getEvaluatorPathAlias } from './output-generation.js';

console.log('Running tests for environment: ', process.env.SDK_ENV);

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    alias: getEvaluatorPathAlias(),
  },
});
