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
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@builder.io/mitosis/recommended',
  ],
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
  plugins: ['@typescript-eslint', '@builder.io/mitosis', 'unused-imports'],
  rules: {
    '@builder.io/mitosis/no-var-declaration-or-assignment-in-component': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'unused-imports/no-unused-imports': [
      'error',
      { varsIgnorePattern: 'setAttrs' },
    ],
    'object-shorthand': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '(^_|setAttrs)' },
    ],

    // Note: you must disable the base rule as it can report incorrect errors
    // 'require-await': 'off',
    // '@typescript-eslint/require-await': 'error',

    // '@typescript-eslint/no-misused-promises': 'error',
    // '@typescript-eslint/no-floating-promises': 'error',
  },
};
