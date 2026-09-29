import { logger } from '../../helpers/logger.js';
import { get } from '../get.js';
import { chooseBrowserOrServerEval } from './choose-eval.js';
import type { EvaluatorArgs, ExecutorArgs } from './helpers.js';
import { getBuilderGlobals, parseCode } from './helpers.js';

type EvalValue = unknown;

/**
 * handles multi-level gets on state: `state.x.y.z`
 * does not handle bracket notation
 * see https://regexr.com/87a9j
 */
const STATE_GETTER_REGEX = /^(return )?(\s*)?state(?<getPath>(\.\w+)+)(\s*);?$/;

/**
 * Handles multi-level gets on state transpiled by rollup with virtual index.
 * see https://regexr.com/87ai4
 */
const VIRTUAL_INDEX_REGEX =
  /(\s)*var(\s)+_virtual_index(\s)*=(\s)*state(?<getPath>(\.\w+)+)(\s*);?(\s)*return(\s)*_virtual_index(\s)*/;

export const getSimpleExpressionGetPath = (code: string) => {
  return (
    STATE_GETTER_REGEX.exec(code.trim())?.groups?.getPath?.slice(1) ||
    VIRTUAL_INDEX_REGEX.exec(code.trim())?.groups?.getPath?.slice(1)
  );
};

const MAX_CACHED_CODE_STRINGS = 5000;
const SIMPLE_GET_PATH_CACHE = new Map<string, string | null>();

const getCachedSimpleExpressionGetPath = (code: string) => {
  let getPath = SIMPLE_GET_PATH_CACHE.get(code);
  if (getPath === undefined) {
    getPath = getSimpleExpressionGetPath(code) || null;
    if (SIMPLE_GET_PATH_CACHE.size >= MAX_CACHED_CODE_STRINGS) {
      SIMPLE_GET_PATH_CACHE.clear();
    }
    SIMPLE_GET_PATH_CACHE.set(code, getPath);
  }
  return getPath;
};

/**
 * Same result as `get({ ...rootState, ...localState }, getPath)`, without copying every state key.
 */
const getSimpleStateValue = (
  rootState: EvaluatorArgs['rootState'],
  localState: EvaluatorArgs['localState'],
  getPath: string
) => {
  const firstKey = getPath.split('.')[0];
  const source =
    localState && Object.prototype.hasOwnProperty.call(localState, firstKey)
      ? localState
      : rootState;
  return get(source, getPath);
};

export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
  trackingContext,
}: EvaluatorArgs): EvalValue {
  if (code.trim() === '') {
    return undefined;
  }

  /**
   * For very simple expressions like "state.foo" we can optimize by skipping
   * the executor altogether.
   * We try not to take many risks with this optimizations, so we only do it for
   * `state.{path}` expressions.
   */
  const getPath = getCachedSimpleExpressionGetPath(code.trim());
  if (getPath) {
    return getSimpleStateValue(rootState, localState, getPath);
  }

  const args: ExecutorArgs = {
    code: parseCode(code, { isExpression }),
    builder: getBuilderGlobals(trackingContext),
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };

  try {
    const newEval = chooseBrowserOrServerEval(args);
    return newEval;
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, { code });
    return undefined;
  }
}
