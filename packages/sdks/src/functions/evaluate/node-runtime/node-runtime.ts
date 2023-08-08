import * as ivm from 'isolated-vm';
import type {
  FunctionArguments,
  ExecutorArgs,
  BuilderGlobals,
} from '../helpers.js';
import { getFunctionArguments } from '../helpers.js';
import type { BuilderRenderState } from '../../../context/types.js';

const getSyncValName = (key: string) => `bldr_${key}_sync`;
const BUILDER_SET_STATE_NAME = 'BUILDER_SET_STATE';

// Convert all argument references to proxies, and pass `copySync` method to target object, to return a copy of the original JS object
// https://github.com/laverdet/isolated-vm#referencecopysync
const REF_TO_PROXY_FN = `
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
        ${BUILDER_SET_STATE_NAME}(obj.copySync())
    },
    deleteProperty(target, key) {
        obj.deleteSync(key);
    }
  })
}
`;

const processCode = ({
  code,
  args,
}: {
  code: string;
  args: FunctionArguments;
}) => {
  const fnArgs = args
    .map(([name]) => `var ${name} = refToProxy(${getSyncValName(name)}); `)
    .join('');

  // At the end of the code, the output will be stringified and parsed back to the parent isolate if needed.
  return `
${REF_TO_PROXY_FN}
${fnArgs}
function theFunction() {
  ${code}
}

const output = theFunction()

if (typeof output === 'object' && output !== null) {
  JSON.stringify(output.copySync ? output.copySync() : output);
}
output;
`;
};

const getIsolateContext = () => {
  // if (Builder.serverContext) {
  //   return Builder.serverContext;
  // }
  // Builder.setServerContext(isolate.createContextSync());
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
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
  jail.setSync('log', function (...logArgs: any[]) {
    console.log(...logArgs);
  });

  /**
   * Propagate state changes back to the reactive root state.
   */
  jail.setSync(BUILDER_SET_STATE_NAME, function (newState: BuilderRenderState) {
    if (rootSetState) {
      rootSetState(newState);
    }
  });

  args.forEach(([key, arg]) => {
    const val =
      typeof arg === 'object'
        ? new ivm.Reference(
            // workaround: methods with default values for arguments is not being cloned over
            key === 'builder'
              ? {
                  ...arg,
                  getUserAttributes: () =>
                    (arg as BuilderGlobals).getUserAttributes(),
                }
              : arg
          )
        : null;

    jail.setSync(getSyncValName(key), val);
  });

  const evalStr = processCode({ code, args });
  const resultStr = isolateContext.evalSync(evalStr);

  try {
    // returning objects throw errors in isolated vm, so we stringify it and parse it back
    const res = JSON.parse(resultStr);
    return res;
  } catch (_error: any) {
    return resultStr;
  }
};
