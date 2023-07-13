/**
 * Input attributes that are functions must be converted to strings before being serialized to JSON.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const serializeFn = (fnValue: Function) => {
  const fnStr = fnValue.toString().trim();

  // we need to account for a few different fn syntaxes:
  // 1. `function name(args) => {code}`
  // 2. `name(args) => {code}`
  // 3. `(args) => {}`
  const appendFunction =
    !fnStr.startsWith('function') && !fnStr.startsWith('(');

  return `return (${
    appendFunction ? 'function ' : ''
  }${fnStr}).apply(this, arguments)`;
};
