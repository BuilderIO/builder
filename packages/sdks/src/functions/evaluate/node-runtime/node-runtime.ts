import type { Context, IsolateOptions } from 'isolated-vm';
import { SDK_NAME } from '../../../constants/sdk-name.js';
import { MSG_PREFIX, logger } from '../../../helpers/logger.js';
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

const output = theFunction()

if (typeof output === 'object' && output !== null) {
  return JSON.stringify(output.copySync ? output.copySync() : output);
} else {
  return output;
}
`;
};

type IsolatedVMImport = typeof import('isolated-vm');

let IVM_INSTANCE: IsolatedVMImport | null = null;
let IVM_CONTEXT: Context | null = null;

/**
 * Set the `isolated-vm` instance to be used by the node runtime.
 * This is useful for environments that are not able to rely on our
 * `safeDynamicRequire` trick to import the `isolated-vm` package.
 */
export const setIvm = (ivm: IsolatedVMImport, options: IsolateOptions = {}) => {
  IVM_INSTANCE = ivm;

  setIsolateContext(options);
};

// only mention the script for SDKs that have it.
const SHOULD_MENTION_INITIALIZE_SCRIPT =
  SDK_NAME === '@builder.io/sdk-react-nextjs' ||
  SDK_NAME === '@builder.io/sdk-react' ||
  SDK_NAME === '@builder.io/sdk-qwik';

const getIvm = (): IsolatedVMImport => {
  try {
    if (IVM_INSTANCE) return IVM_INSTANCE;
    const dynRequiredIvm = safeDynamicRequire('isolated-vm');

    if (dynRequiredIvm) return dynRequiredIvm;
  } catch (error) {
    logger.error('isolated-vm import error.', error);
  }

  const ERROR_MESSAGE = `${MSG_PREFIX}could not import \`isolated-vm\` module for safe script execution on a Node server.
    
    SOLUTION: In a server-only execution path within your application, do one of the following:
  
    ${SHOULD_MENTION_INITIALIZE_SCRIPT ? `- import and call \`initializeNodeRuntime()\` from "${SDK_NAME}/node/init".` : ''}
    - add the following import: \`await import('isolated-vm')\`.

    For more information, visit https://builder.io/c/docs/integration-tips#enabling-data-bindings-in-node-environments`;

  throw new Error(ERROR_MESSAGE);
};

function setIsolateContext(options: IsolateOptions = { memoryLimit: 128 }) {
  const ivm = getIvm();
  const isolate = new ivm.Isolate(options);
  const context = isolate.createContextSync();

  const jail = context.global;

  // This makes the global object available in the context as `global`. We use `derefInto()` here
  // because otherwise `global` would actually be a Reference{} object in the new isolate.
  jail.setSync('global', jail.derefInto());

  // We will create a basic `log` function for the new isolate to use.
  jail.setSync('log', function (...logArgs: any[]) {
    console.log(...logArgs);
  });

  jail.setSync(INJECTED_IVM_GLOBAL, ivm);

  IVM_CONTEXT = context;
  return context;
}

const getIsolateContext = () => {
  if (IVM_CONTEXT) return IVM_CONTEXT;

  const context = setIsolateContext();

  return context;
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

  const evalStr = processCode({ code, args });

  const resultStr = isolateContext.evalClosureSync(evalStr);

  try {
    // returning objects throw errors in isolated vm, so we stringify it and parse it back
    const res = JSON.parse(resultStr);
    return res;
  } catch (_error: any) {
    return resultStr;
  }
};
