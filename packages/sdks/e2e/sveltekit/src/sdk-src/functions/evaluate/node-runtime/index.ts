import * as ivm from 'isolated-vm';
import type { FunctionArguments, ExecutorArgs } from '../helpers';
import { flattenState, getFunctionArguments } from '../helpers';
const makeFn = ({
  code,
  useReturn,
  args
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
            const val = obj.getSync(key);
            if (typeof val?.getSync === 'function') {
                return refToProxy(val);
            }
            return val;
        },
        set(target, key, value) {
            obj.setSync(key, value);
        },
        deleteProperty(target, key) {
            obj.deleteSync(key);
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
  return `
${refToProxyFn}
${strinfigyFn}
${args.map(([arg], index) => `
var ${arg} = refToProxy($${index});`).join('')}
var ctx = context;
${useReturn ? `return stringify(${code});` : code};
`;
};
const getIsolateContext = () => {
  // if (Builder.serverContext) {
  //   return Builder.serverContext;
  // }
  // Builder.setServerContext(isolate.createContextSync());
  const isolate = new ivm.Isolate({
    memoryLimit: 128
  });
  return isolate.createContextSync();
};
export const runInNode = ({
  useCode,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState
}: ExecutorArgs) => {
  const state = flattenState(rootState, localState, rootSetState);
  const args = getFunctionArguments({
    builder,
    context,
    event,
    state
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
  const resultStr = isolateContext.evalClosureSync(makeFn({
    code: useCode,
    args,
    // TODO: does this work
    useReturn: true
  }), args.map(([key, arg]) => {
    return typeof arg === 'object' ? new ivm.Reference(key === 'builder' ? {
      // workaround: methods with default values for arguments is not being cloned over
      ...arg,
      getUserAttributes: () => (arg as ExecutorArgs['builder']).getUserAttributes()
    } : arg) : null;
  }));
  try {
    // returning objects throw errors in isolated vm, so we stringify it and parse it back
    const res = JSON.parse(resultStr);
    return res;
  } catch (_error: any) {
    return resultStr;
  }
}