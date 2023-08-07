import type { BuilderContextInterface } from '../../context/types.js';
import { logger } from '../../helpers/logger.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import { isNonNodeServer } from '../is-non-node-server.js';
import type { ExecutorArgs } from './helpers.js';
import { flattenState, getFunctionArguments } from './helpers.js';
import { runInNonNode } from './non-node-runtime/index.js';
import { getUserAttributes } from '../track/helpers.js';
import { runInNode } from './node-runtime/index.js';
export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true
}: {
  code: string;
  event?: Event;
  isExpression?: boolean;
} & Pick<BuilderContextInterface, 'localState' | 'context' | 'rootState' | 'rootSetState'>): any {
  if (code === '') {
    logger.warn('Skipping evaluation of empty code block.');
    return;
  }
  const builder: ExecutorArgs['builder'] = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser(),
    getUserAttributes: () => getUserAttributes()
  };

  // Be able to handle simple expressions like "state.foo" or "1 + 1"
  // as well as full blocks like "var foo = "bar"; return foo"
  const useReturn =
  // we disable this for cases where we definitely don't want a return
  isExpression && !(code.includes(';') || code.includes(' return ') || code.trim().startsWith('return '));
  const useCode = useReturn ? `return (${code});` : code;
  const args: ExecutorArgs = {
    useCode,
    builder,
    context,
    event,
    rootSetState,
    rootState,
    localState
  };
  try {
    if (isBrowser()) return runInBrowser(args);
    if (isNonNodeServer()) return runInNonNode(args);
    return runInNode(args);
  } catch (e) {
    logger.warn('Custom code error.', {
      useCode,
      error: e
    });
    return undefined;
  }
}
export const runInBrowser = ({
  useCode,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState
}: ExecutorArgs) => {
  const functionArgs = getFunctionArguments({
    builder,
    context,
    event,
    state: flattenState(rootState, localState, rootSetState)
  });
  try {
    return new Function(...functionArgs.map(([name]) => name), useCode)(...functionArgs.map(([, value]) => value));
  } catch (e) {
    logger.warn('Builder custom code error: \n While Evaluating: \n ', useCode, '\n', e);
  }
}