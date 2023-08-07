import { $ } from '@builder.io/qwik';
import { evaluate } from './evaluate';
import type { EvaluatorArgs } from './evaluate/evaluate.js';

export type Options = Pick<
  EvaluatorArgs,
  'localState' | 'context' | 'rootState' | 'rootSetState' | 'serverExecutor'
>;

export function createEventHandler(
  value: string,
  options: Options
): (event: Event) => any {
  return $((event: Event) =>
    evaluate({
      code: value,
      event,
      isExpression: false,
      ...options,
    })
  );
}
