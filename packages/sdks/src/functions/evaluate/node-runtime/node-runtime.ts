import { MSG_PREFIX } from '../../../helpers/logger.js';
import { fastClone } from '../../fast-clone.js';
import { set } from '../../set.js';
import type {
  BuilderGlobals,
  ExecutorArgs,
  FunctionArguments,
} from '../helpers.js';
import { getFunctionArguments } from '../helpers.js';
import { safeDynamicRequire } from './safeDynamicRequire.js';

const getSyncValName = (key: string) => `bldr_${key}_sync`;

const BUILDER_SET_STATE_NAME = 'BUILDER_SET_STATE';

const INJECTED_IVM_GLOBAL = 'BUILDER_IVM';

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
        const v = typeof value === 'object' ? new ${INJECTED_IVM_GLOBAL}.Reference(value) : value;
        obj.setSync(key, v);
        ${BUILDER_SET_STATE_NAME}(key, value)
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

  // the output is stringified and parsed back to the parent isolate if needed (when it's an `object`)
  return `
${REF_TO_PROXY_FN}
${fnArgs}
function theFunction() {
  ${code}
}

let output = theFunction()

if (typeof output === 'object' && output !== null) {
  output = JSON.stringify(output.copySync ? output.copySync() : output);
}

output;
`;
};

let IVM_INSTANCE: typeof import('isolated-vm') | null = null;

/**
 * Set the `isolated-vm` instance to be used by the node runtime.
 * This is useful for environments that are not able to rely on our
 * `safeDynamicRequire` trick to import the `isolated-vm` package.
 */
export const setIvm = (ivm: typeof import('isolated-vm')) => {
  IVM_INSTANCE = ivm;
};

const getIvm = (): typeof import('isolated-vm') => {
  if (IVM_INSTANCE) return IVM_INSTANCE;
  const dynRequiredIvm = safeDynamicRequire('isolated-vm');

  if (!dynRequiredIvm) {
    throw new Error(
      `${MSG_PREFIX}could not import \`isolated-vm\` module for safe script execution on Node server.
      
      In certain Node environments, the SDK requires additional initialization steps. This can be achieved by 
      importing and calling \`initializeNodeRuntime()\` from "@builder.io/sdk-react/node/init". This must be done in
      a server-only execution path within your application.

      Please see the documentation for more information: https://www.builder.io/c/docs/node-isolated-vm-initialization
      `
    );
  }

  return dynRequiredIvm;
};

const getIsolateContext = () => {
  const ivm = getIvm();
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
}: ExecutorArgs) => {
  const ivm = getIvm();

  const state = fastClone({
    ...rootState,
    ...localState,
  });
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
  jail.setSync(BUILDER_SET_STATE_NAME, function (key: string, value: any) {
    // mutate the `rootState` object itself. Important for cases where we do not have `rootSetState`
    // like Qwik.
    set(rootState, key, value);
    // call the `rootSetState` function if it exists
    rootSetState?.(rootState);
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

  jail.setSync(INJECTED_IVM_GLOBAL, ivm);

  const evalStr = processCode({
    code,
    args,
  });
  const resultStr = isolateContext.evalSync(evalStr);
  try {
    // returning objects throw errors in isolated vm, so we stringify it and parse it back
    const res = JSON.parse(resultStr);
    return res;
  } catch (_error: any) {
    return resultStr;
  }
};
