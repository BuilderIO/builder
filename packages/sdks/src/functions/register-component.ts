import type { RegisteredComponent } from '../context/types.js';
import type { ComponentInfo } from '../types/components.js';

export const createRegisterComponentMessage = (info: ComponentInfo) => ({
  type: 'builder.registerComponent',
  data: serializeIncludingFunctions(info),
});

export const sendRegisterComponentMessage = (info: ComponentInfo) => {
  window.parent?.postMessage(createRegisterComponentMessage(info), '*');
};

/**
 * @private
 * @description This is a private internal function that is used to register a component from the Builder DevTools.
 * Do not use this function directly.
 */
export const registerComponentFromDevTools = (info: RegisteredComponent) => {
  const { component: _, ...rest } = info;
  sendRegisterComponentMessage(rest);
};

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

export function serializeIncludingFunctions(info: ComponentInfo) {
  return JSON.parse(
    JSON.stringify(info, (key, value) => {
      if (typeof value === 'function') {
        return serializeFn(value);
      }
      return value;
    })
  );
}
