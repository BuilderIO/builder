/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  parserOptions: {
    /**
     * override root `tsconfig.json` for this sub-project
     */
    project: './tsconfig.json',
  },
};
