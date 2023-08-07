import * as ivm from 'isolated-vm';
import type { FunctionArguments, ExecutorArgs } from '../helpers';
import { getFunctionArguments } from '../helpers';
import type { BuilderRenderState } from 'src/sdk-src/context/types';

const makeFn = ({
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
            const val = obj.getSync(key);
            if (typeof val?.getSync === 'function') {
                return refToProxy(val);
            }
            return val;
        },
        set(target, key, value) {
            log('setting: ', key)
            obj.setSync(key, value);
            BUILDER_SET_STATE(obj.copySync())
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

  function theFunction() {
${refToProxyFn}
${strinfigyFn}
${args
  .map(
    ([arg]) => `
var ${arg} = refToProxy(${getSyncValName(arg)});`
  )
  .join('')}
var ctx = context;
${code}
  }

  const val = theFunction()

  if (typeof val === 'object' && val !== null) {
    JSON.stringify(val.copySync ? val.copySync() : val);
  } else {
    val
  };
`;
};

const getSyncValName = (key: string) => `${key}_sync`;

const getIsolateContext = () => {
  // if (Builder.serverContext) {
  //   return Builder.serverContext;
  // }
  // Builder.setServerContext(isolate.createContextSync());
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  return isolate.createContextSync();
};

export const runInNode = ({
  useCode,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
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

  if (rootSetState) {
    jail.setSync('BUILDER_SET_STATE', function (newState: BuilderRenderState) {
      console.log('setting new state');
      rootSetState(newState);
    });
  }

  args.forEach(([key, arg]) => {
    const val =
      typeof arg === 'object'
        ? new ivm.Reference(
            key === 'builder'
              ? {
                  // workaround: methods with default values for arguments is not being cloned over
                  ...arg,
                  getUserAttributes: () =>
                    (arg as ExecutorArgs['builder']).getUserAttributes(),
                }
              : arg
          )
        : null;

    jail.setSync(getSyncValName(key), val);
  });

  const evalStr = makeFn({
    code: useCode,
    args,
    // TODO: does this work
    useReturn: true,
  });

  try {
    const resultStr = isolateContext.evalSync(evalStr);
    try {
      // console.log('resultStr', resultStr);

      // returning objects throw errors in isolated vm, so we stringify it and parse it back
      const res = JSON.parse(resultStr);
      return res;
    } catch (_error: any) {
      return resultStr;
    }
  } catch (e: any) {
    console.error(`Failed to eval: ${e.message}. Code: ${useCode} `);
    return undefined;
  }
};
