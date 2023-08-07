import { evaluate } from './evaluate';
import type { EvaluatorArgs } from './evaluate/evaluate.js';

export type Options = Pick<
  EvaluatorArgs,
  'localState' | 'context' | 'rootState' | 'rootSetState' | 'serverExecutor'
>;

type EventHandler = (event: Event) => any;

export const createEventHandler =
  (value: string, options: Options): EventHandler =>
  (event) =>
    evaluate({
      code: value,
      event,
      isExpression: false,
      ...options,
    });
