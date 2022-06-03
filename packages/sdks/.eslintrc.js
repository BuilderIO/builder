module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', '@builder.io/mitosis'],
  rules: {
    '@builder.io/mitosis/css-no-vars': 'error',
    '@builder.io/mitosis/res-no-current': 'error',
    '@builder.io/mitosis/static-control-flow': 'error',
    '@builder.io/mitosis/no-state-destructuring': 'error',
    '@builder.io/mitosis/jsx-callback-arg-name': 'error',
    '@builder.io/mitosis/no-assign-props-to-state': 'error',
    '@builder.io/mitosis/use-state-var-declarator': 'error',
    '@builder.io/mitosis/no-async-methods-on-state': 'error',
    '@builder.io/mitosis/no-var-declaration-in-jsx': 'error',
    '@builder.io/mitosis/jsx-callback-arrow-function': 'error',
    '@builder.io/mitosis/no-var-name-same-as-state-property': 'error',
    // '@builder.io/mitosis/only-default-function-and-imports': 'error',
    '@builder.io/mitosis/no-conditional-logic-in-component-render': 'error',
    // '@builder.io/mitosis/no-var-declaration-or-assignment-in-component':
    //   'error',
    '@typescript-eslint/no-empty-interface': 'off',
  },
};
