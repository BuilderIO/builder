import type { ComponentInfo } from '../types/components.js';

export const createRegisterComponentMessage = (info: ComponentInfo) => ({
  type: 'builder.registerComponent',
  data: serializeComponentInfo(info),
});

// eslint-disable-next-line @typescript-eslint/ban-types
const serializeFn = (fnValue: Function) => {
  const fnStr = fnValue.toString().trim();

  // we need to account for a few different fn syntaxes:
  // 1. `function name(args) => {code}`
  // 2. `name(args) => {code}`
  // 3. `(args) => {}`
  const appendFunction =
    !fnStr.startsWith('function') && !fnStr.startsWith('(');

  return `return (${appendFunction ? 'function ' : ''}${fnStr}).apply(this, arguments)`;
};

export function serializeComponentInfo(info: ComponentInfo) {
  return JSON.parse(
    JSON.stringify(info, (key, value) => {
      if (typeof value === 'function') {
        return serializeFn(value);
      }
      return value;
    })
  );
}
