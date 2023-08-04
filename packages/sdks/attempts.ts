/**
 *  - /data-bindings page shows issues getting state.entries.article: nested values
 *  - works fine in react SDK
 *
 */

import * as ivm from 'isolated-vm';
import type { FunctionArguments, ExecutorArgs } from '../helpers';
import { getFunctionArguments } from '../helpers';
import { logger } from '../../../helpers/logger';
const processCode = ({
  code,
  useReturn,
  args,
}: {
  code: string;
  useReturn: boolean;
  args: FunctionArguments;
}) => {
  // Convert all argument references to proxies, and pass `copySync` method to target object, to return a copy of the original JS object
  // https://github.com/laverdet/isolated-vm#referencecopysync
  const refToProxyFn = `
  var refToProxy = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    return new Proxy({}, {
      get(target, key) {
        if (key === 'copySync') {
          return () => obj.copySync();
        }
        // log('key', key, JSON.stringify(obj))
        const val = target[key]
        if (typeof val === 'object') {
            return refToProxy(val);
        }
        return target[key];
      },
      set(target, key, value) {
        // log('setting', key, value)
        // obj.setSync(key, value);
        obj[key] = value;
        rootSetState(key, JSON.stringify({value}));
      },
      deleteProperty(target, key) {
        // obj.deleteSync(key);
        delete obj[key];
      }
    })
  }
`;
  // Returned object  will be stringified and parsed back to the parent isolate
  const strinfigyFn = `
    var stringify = (val) => {
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val.copySync ? val.copySync() : val);
      }
      return val;
    }
  `;
  const x = `
  ${refToProxyFn}
  ${strinfigyFn}
  ${args
    .map(([key]) => {
      return `var ${key} = (${key}_ref);`;
    })
    .join('\n')}
function theFunction() {
  ${useReturn ? `return (${code});` : code};
}

(theFunction())
`;

  return x;
};
const getIsolateContext = () => {
  // if (Builder.serverContext) {
  //   return Builder.serverContext;
  // }
  // Builder.setServerContext(isolate.createContextSync());
  const isolate = new ivm.Isolate({
    memoryLimit: 128,
  });
  return isolate.createContextSync();
};
export const runInNode = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
  useReturn,
}: ExecutorArgs) => {
  const state = { ...rootState, ...localState };
  const args = getFunctionArguments({
    builder,
    context,
    event,
    state,
  });
  const isolateContext = getIsolateContext();
  const jail = isolateContext.global;
  // This makes the global object available in the context as `global`. We use `derefInto()` here
  // because otherwise `global` would actually be a Reference{} object in the new isolate.
  jail.setSync('global', jail.derefInto());

  // We will create a basic `log` function for the new isolate to use.
  jail.setSync('log', function (...args: any[]) {
    console.log(...args);
  });

  const useCode = processCode({
    code,
    args,
    useReturn,
  });

  args.forEach(([key, arg]) => {
    if (key === 'state') {
      console.log('setting state sync', Object.keys(state));

      jail.setSync('state_ref', new ivm.ExternalCopy(state).copyInto());

      return;
    }
    const newLocal =
      typeof arg === 'object'
        ? new ivm.Reference(
            key === 'builder'
              ? {
                  // workaround: methods with default values for arguments is not being cloned over
                }
              : arg
          )
        : null;

    jail.setSync(key + '_ref', newLocal, { copy: true });
  });

  jail.setSync('rootSetState', (key, value) => {
    state[key] = JSON.parse(value);
    rootSetState?.(state);
  });

  try {
    const resultStr = isolateContext.evalSync(useCode);
    try {
      // returning objects throw errors in isolated vm, so we stringify it and parse it back
      const res = JSON.parse(resultStr);
      return res;
    } catch (_error: any) {
      return resultStr;
    }
  } catch (error: any) {
    logger.error('evalSync', { error, useCode });
  }
};
