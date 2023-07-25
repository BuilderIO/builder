/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  // root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@builder.io/mitosis/recommended'],
  parser: '@typescript-eslint/parser',
  // ignorePatterns: ['overrides/**/*'],
  parserOptions: {
    // project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@builder.io/mitosis', 'unused-imports'],
  rules: {
    '@builder.io/mitosis/no-var-declaration-or-assignment-in-component': 'off',
    'unused-imports/no-unused-imports': 'error',
    'object-shorthand': 'error',

    // Note: you must disable the base rule as it can report incorrect errors
    // 'require-await': 'off',
    // '@typescript-eslint/require-await': 'error',

    // '@typescript-eslint/no-misused-promises': 'error',
    // '@typescript-eslint/no-floating-promises': 'error',
  },
};
