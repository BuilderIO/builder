import type { Isolate, IsolateOptions, Reference, Script } from 'isolated-vm';
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
import {
  NOT_EVALUATED,
  evaluateSafeStateExpression,
} from '../safe-state-expression.js';
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
        // Functions cannot cross the isolate boundary, and server renders never call them.
        if (typeof value === 'function') {
          return true;
        }
        const v = typeof value === 'object' ? new ${INJECTED_IVM_GLOBAL}.Reference(value) : value;
        obj.setSync(key, v);
        ${BUILDER_SET_STATE_NAME}(key, value)
        return true;
    },
    deleteProperty(target, key) {
        obj.deleteSync(key);
        return true;
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
  // Wrapped in an IIFE so it compiles as a reusable script whose completion value is the result.
  return `(function () {
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
})()`;
};

type IsolatedVMImport = typeof import('isolated-vm');

let IVM_INSTANCE: IsolatedVMImport | null = null;
let IVM_OPTIONS: IsolateOptions = { memoryLimit: 128 };

/**
 * Evaluations share one isolate, each in a fresh context. The isolate is disposed at the end of the
 * current task (or after a fixed number of evaluations), so a render's bindings share it without it
 * outliving that work: a single long-lived isolate leaked memory (#4210), and one still alive at
 * worker-thread teardown crashes `isolated-vm` on Linux.
 */
const MAX_EVALUATIONS_PER_ISOLATE = 1000;

let POOLED: {
  isolate: Isolate;
  evaluations: number;
  scripts: Map<string, Script>;
} | null = null;
let DISPOSE_TIMER: ReturnType<typeof setTimeout> | null = null;
let IS_EXIT_HANDLER_REGISTERED = false;

const disposePooledIsolate = () => {
  if (DISPOSE_TIMER) {
    clearTimeout(DISPOSE_TIMER);
    DISPOSE_TIMER = null;
  }
  if (POOLED && !POOLED.isolate.isDisposed) {
    try {
      POOLED.isolate.dispose();
    } catch (e) {
      // Ignore disposal errors
    }
  }
  POOLED = null;
};

const getPooledIsolate = (ivm: IsolatedVMImport) => {
  if (
    !POOLED ||
    POOLED.isolate.isDisposed ||
    POOLED.evaluations >= MAX_EVALUATIONS_PER_ISOLATE
  ) {
    disposePooledIsolate();
    POOLED = {
      isolate: new ivm.Isolate(IVM_OPTIONS),
      evaluations: 0,
      scripts: new Map(),
    };
  }
  if (!DISPOSE_TIMER) {
    DISPOSE_TIMER = setTimeout(disposePooledIsolate, 0);
    DISPOSE_TIMER.unref?.();
  }
  if (
    !IS_EXIT_HANDLER_REGISTERED &&
    typeof process !== 'undefined' &&
    typeof process.once === 'function'
  ) {
    IS_EXIT_HANDLER_REGISTERED = true;
    process.once('exit', disposePooledIsolate);
  }
  POOLED.evaluations++;
  return POOLED;
};

/**
 * Set the `isolated-vm` instance to be used by the node runtime.
 * This is useful for environments that are not able to rely on our
 * `safeDynamicRequire` trick to import the `isolated-vm` package.
 */
export const setIvm = (ivm: IsolatedVMImport, options?: IsolateOptions) => {
  if (IVM_INSTANCE) return;
  IVM_INSTANCE = ivm;
  // Store options to be used per-request in runInNode
  if (options) {
    IVM_OPTIONS = options;
  }
};

// only mention the script for SDKs that have it.
const SHOULD_MENTION_INITIALIZE_SCRIPT =
  SDK_NAME === '@builder.io/sdk-react-nextjs' ||
  SDK_NAME === '@builder.io/sdk-react' ||
  SDK_NAME === '@builder.io/sdk-qwik' ||
  SDK_NAME === '@builder.io/sdk-vue';

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

export const runInNode = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
}: ExecutorArgs) => {
  const safeValue = evaluateSafeStateExpression(code, rootState, localState);
  if (safeValue !== NOT_EVALUATED) return safeValue;

  const ivm = getIvm();
  const pooled = getPooledIsolate(ivm);
  const isolateContext = pooled.isolate.createContextSync();
  const references: Reference[] = [];
  try {
    const jail = isolateContext.global;

    // Setup the isolate
    jail.setSync('global', jail.derefInto());
    jail.setSync('log', function (...logArgs: any[]) {
      console.log(...logArgs);
    });
    jail.setSync(INJECTED_IVM_GLOBAL, ivm);

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
      if (val) references.push(val);
      jail.setSync(getSyncValName(key), val);
    });

    let script = pooled.scripts.get(code);
    if (!script) {
      script = pooled.isolate.compileScriptSync(processCode({ code, args }));
      pooled.scripts.set(code, script);
    }
    const resultStr = script.runSync(isolateContext);

    try {
      // returning objects throw errors in isolated vm, so we stringify it and parse it back
      const res = JSON.parse(resultStr);
      return res;
    } catch (_error: any) {
      return resultStr;
    }
  } finally {
    references.forEach((reference) => {
      try {
        reference.release();
      } catch (e) {
        // Ignore release errors
      }
    });
    try {
      isolateContext.release();
    } catch (e) {
      // Ignore release errors (e.g. the isolate was disposed after hitting its memory limit)
    }
  }
};
