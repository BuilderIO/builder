import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types.js';
import { logger } from '../../helpers/logger.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import { isNonNodeServer } from '../is-non-node-server.js';
import type { ExecutorArgs } from './types.js';
import { runInNonNode } from './non-node-runtime/index.js';

export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
}: {
  code: string;
  event?: Event;
  isExpression?: boolean;
} & Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
>): any {
  if (code === '') {
    logger.warn('Skipping evaluation of empty code block.');
    return;
  }
  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser(),
  };

  // Be able to handle simple expressions like "state.foo" or "1 + 1"
  // as well as full blocks like "var foo = "bar"; return foo"
  const useReturn =
    // we disable this for cases where we definitely don't want a return
    isExpression &&
    !(
      code.includes(';') ||
      code.includes(' return ') ||
      code.trim().startsWith('return ')
    );
  const useCode = useReturn ? `return (${code});` : code;
  const args: ExecutorArgs = {
    useCode,
    builder,
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };

  if (isBrowser()) return runInBrowser(args);

  if (isNonNodeServer()) return runInNonNode(args);

  return runInNode(args);
}
export const runInBrowser = ({
  useCode,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
}: ExecutorArgs) => {
  const state = flattenState(rootState, localState, rootSetState);

  try {
    return new Function(
      'builder',
      'Builder' /* <- legacy */,
      'state',
      'context',
      'event',
      useCode
    )(builder, builder, state, context, event);
  } catch (e) {
    logger.warn(
      'Builder custom code error: \n While Evaluating: \n ',
      useCode,
      '\n',
      e
    );
  }
};

export const runInNode = (args: ExecutorArgs) => {
  // TO-DO: use vm-isolate
  return runInBrowser(args);
};

export function flattenState(
  rootState: Record<string | symbol, any>,
  localState: Record<string | symbol, any> | undefined,
  rootSetState: ((rootState: BuilderRenderState) => void) | undefined
): BuilderRenderState {
  if (rootState === localState) {
    throw new Error('rootState === localState');
  }

  return new Proxy(rootState, {
    get: (_, prop) => {
      if (localState && prop in localState) {
        return localState[prop];
      }
      return rootState[prop as string];
    },
    set: (_, prop, value) => {
      if (localState && prop in localState) {
        throw new Error(
          'Writing to local state is not allowed as it is read-only.'
        );
      }
      rootState[prop as string] = value;
      rootSetState?.(rootState);
      return true;
    },
  });
}
