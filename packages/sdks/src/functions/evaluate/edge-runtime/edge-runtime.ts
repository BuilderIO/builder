import { logger } from '../../../helpers/logger';
import { flattenState } from '../browser-runtime/browser';
import type { ExecutorArgs } from '../helpers';
import { getFunctionArguments } from '../helpers';
import Interpreter from './acorn-interpreter';

/**
 * https://stackoverflow.com/a/46503625
 */
function patchInterpreter() {
  const originalGetProperty = Interpreter.prototype.getProperty;
  const originalSetProperty = Interpreter.prototype.setProperty;

  function newGetProperty(this: typeof Interpreter, obj: any, name: any) {
    if (obj == null || !obj._connected) {
      return originalGetProperty.call(this, obj, name);
    }

    const value = obj._connected[name];
    if (Array.isArray(value)) {
      return this.nativeToPseudo(value);
    }

    if (typeof value === 'object') {
      // if the value is an object itself, create another connected object
      return this.createConnectedObject(value);
    }
    return value;
  }
  function newSetProperty(
    this: typeof Interpreter,
    obj: any,
    name: any,
    value: any,
    opt_descriptor: any
  ) {
    if (obj == null || !obj._connected) {
      return originalSetProperty.call(this, obj, name, value, opt_descriptor);
    }

    obj._connected[name] = this.pseudoToNative(value);
  }

  const getKeys = [];
  const setKeys = [];
  for (const key of Object.keys(Interpreter.prototype)) {
    if (Interpreter.prototype[key] === originalGetProperty) {
      getKeys.push(key);
    }
    if (Interpreter.prototype[key] === originalSetProperty) {
      setKeys.push(key);
    }
  }

  for (const key of getKeys) {
    Interpreter.prototype[key] = newGetProperty;
  }
  for (const key of setKeys) {
    Interpreter.prototype[key] = newSetProperty;
  }

  Interpreter.prototype.createConnectedObject = function (obj: any) {
    const connectedObject = this.createObject(this.OBJECT);
    connectedObject._connected = obj;
    return connectedObject;
  };
}
patchInterpreter();

const stripAwaiter = (code: string) => {
  // remove anything before 'function main()'
  return code.replace(
    /^.*?function main\(\)/,
    `var __awaiter = function (e, t, n, r) {
    return r()
  },
  __generator = function (e, t) {
    return t()
  };
  function main()`
  );
};

const getJSONValName = (val: string) => val + 'JSON';
export const runInEdge = ({
  builder,
  context,
  event,
  rootState,
  localState,
  rootSetState,
  code,
}: ExecutorArgs) => {
  const state = flattenState({
    rootState,
    localState,
    rootSetState,
  });

  const properties = getFunctionArguments({
    builder,
    context,
    event,
    state,
  });

  /**
   * Deserialize all properties from JSON strings to JS objects
   */
  const prependedCode = properties
    .map(([key]) => {
      const jsonValName = getJSONValName(key);
      if (key === 'state') {
        return ``;
      }
      return `var ${key} = ${jsonValName} === undefined ? undefined : JSON.parse(${jsonValName});`;
    })
    .join('\n');
  const cleanedCode = stripAwaiter(code);
  if (cleanedCode === '') {
    logger.warn('Skipping evaluation of empty code block.');
    return;
  }

  const transformed = `
function theFunction() {
  ${prependedCode}

  ${cleanedCode}
}
theFunction();
`;

  const initFunc = function (interpreter: any, globalObject: any) {
    /**
     * serialize all function args to JSON strings
     */
    properties.forEach(([key, val]) => {
      if (key === 'state') {
        interpreter.setProperty(
          globalObject,
          key,
          interpreter.createConnectedObject(val),
          interpreter.READONLY_DESCRIPTOR
        );
      } else {
        const jsonVal = JSON.stringify(val);
        interpreter.setProperty(globalObject, getJSONValName(key), jsonVal);
      }
    });
  };

  const myInterpreter = new Interpreter(transformed, initFunc);
  myInterpreter.run();
  const output = myInterpreter.pseudoToNative(myInterpreter.value);

  return output;
};
