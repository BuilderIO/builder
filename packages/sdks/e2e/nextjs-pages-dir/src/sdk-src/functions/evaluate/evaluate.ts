import { logger } from '../../helpers/logger';
import { chooseBrowserOrServerEval } from './choose-eval';
import type { EvaluatorArgs, ExecutorArgs } from './helpers';
import { getBuilderGlobals, parseCode } from './helpers';
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
  const args: ExecutorArgs = {
    code: parseCode(code, {
      isExpression,
    }),
    builder: getBuilderGlobals(),
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };
  try {
    return chooseBrowserOrServerEval(args);
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, {
      code,
    });
    return undefined;
  }
}
