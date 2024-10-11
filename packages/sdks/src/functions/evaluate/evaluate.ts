import { logger } from '../../helpers/logger.js';
import { get } from '../get.js';
import { chooseBrowserOrServerEval } from './choose-eval.js';
import type { EvaluatorArgs, ExecutorArgs } from './helpers.js';
import { getBuilderGlobals, parseCode } from './helpers.js';

type EvalValue = unknown;

const STATE_GETTER_REGEX = /^(return )(\s*)?state(?<getPath>(\.\w+)+)(\s*);?$/;

export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
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
  const match = STATE_GETTER_REGEX.exec(code.trim());
  if (match?.groups?.getPath) {
    return get(rootState, match.groups.getPath.slice(1));
  }

  const args: ExecutorArgs = {
    code: parseCode(code, { isExpression }),
    builder: getBuilderGlobals(),
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
