import { defineConfig } from 'vitest/config';
import { getEvaluatorPathAlias } from './output-generation';

process.env.SDK_ENV = 'browser';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: getEvaluatorPathAlias(),
  },
});
