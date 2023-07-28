import { set } from '../set';
import Interpreter from './interpreter.js';
import type { ExecutorArgs } from './types';
const processCode = (code: string) => {
  return code
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      if (line.includes('__awaiter')) return undefined;

      const isStateSetter = trimmed.startsWith('state.');
      if (!isStateSetter) return line;
      const [lhs, rhs] = trimmed.split('=');
      const setStr = lhs.replace('state.', '').trim();
      const setExpr = `setRootState('${setStr}', ${rhs.trim()})`;
      return `
  ${line}
  if (Builder.isNonNodeRuntime) {
    ${setExpr}
  }
  `;
    })
    .filter(Boolean)
    .join('\n');
};
const getJSONValName = (val: string) => val + 'JSON';
export const runInNonNode = ({
  builder,
  context,
  event,
  rootState,
  localState,
  rootSetState,
  useCode,
}: ExecutorArgs) => {
  const state = { ...rootState, ...localState };

  const properties = {
    state,
    Builder: builder,
    builder,
    context,
    event,
  };

  /**
   * Deserialize all properties from JSON strings to JS objects
   */
  const prependedCode = Object.keys(properties)
    .map((key) => `var ${key} = JSON.parse(${getJSONValName(key)});`)
    .join('\n');
  const cleanedCode = processCode(useCode);

  if (cleanedCode === '') {
    console.warn('Skipping evaluation of empty code block.');
    return;
  }

  const transformed = `
function theFunction() {
  // prepended code:
  ${prependedCode}

  // CHECK:
  // throw new Error('running code in non-node runtime: ' + Object.keys(state).join(', '))
  // user code:
  ${cleanedCode}
}
theFunction();
`;
  const setRootState = (prop: string, value: any) => {
    const newState = set(state, prop, value);
    rootSetState?.(newState);
  };
  const initFunc = function (interpreter: any, globalObject: any) {
    /**
     * serialize all function args to JSON strings
     */
    Object.keys(properties).forEach((key) => {
      const val = properties[key as keyof typeof properties] || {};
      const jsonVal = JSON.stringify(val);
      interpreter.setProperty(globalObject, getJSONValName(key), jsonVal);
    });

    /**
     * Add a JavaScript function "setRootState" to the interpreter's global object, that will be called whenever a
     * state property is set. This function will update the state object.
     */
    interpreter.setProperty(
      globalObject,
      'setRootState',
      interpreter.createNativeFunction(setRootState)
    );
  };
  try {
    const myInterpreter = new Interpreter(transformed, initFunc);
    myInterpreter.run();
    const output = myInterpreter.pseudoToNative(myInterpreter.value);
    console.log('output', output);

    return output;
  } catch (e) {
    console.warn('Builder custom code error: \n While Evaluating: \n ', {
      transformed,
      e,
    });
    return;
  }
};
