import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';

type Options = {
  block: BuilderBlock;
} & Pick<BuilderContextInterface, 'state' | 'context'>;

type EventHandler = (event: Event) => any;

export const createEventHandler =
  (value: string, options: Options): EventHandler =>
  (event) =>
    evaluate({
      code: value,
      context: options.context,
      state: options.state,
      event,
      isExpression: false,
    });
