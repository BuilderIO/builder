import { logger } from '../../helpers/logger.js';
import { isBrowser } from '../is-browser.js';
import { isEditing } from '../is-editing.js';
import type { BuilderGlobals, ExecutorArgs } from './helpers.js';
import { getUserAttributes } from '../track/helpers.js';

/**
 * THIS IS A MAGICAL IMPORT. It is aliased by the build process of every SDK configuration, so that
 * it points to the correct runtime for that configuration, which are expected to live exactly at:
 *  - ./browser-runtime/index.js
 *  - ./node-runtime/index.js
 *  - ./edge-runtime/index.js
 *
 * We have code in `/output-generation` that does this aliasing, and is re-used by each SDK.
 * Also, each individual `tsconfig.json` aliases this import to the browser runtime so that the
 * types can be resolved correctly.
 */
import { evaluator } from 'placeholder-runtime';

export type EvaluatorArgs = Omit<ExecutorArgs, 'builder' | 'event'> & {
  event?: Event;
  isExpression?: boolean;
};

export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
}: EvaluatorArgs): any {
  if (code === '') {
    logger.warn('Skipping evaluation of empty code block.');
    return;
  }
  const builder: BuilderGlobals = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser(),
    getUserAttributes: () => getUserAttributes(),
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
    code: useCode,
    builder,
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };

  try {
    return evaluator(args);
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, { code });
    return undefined;
  }
}
