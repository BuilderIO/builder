import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';
import { $ } from '@builder.io/qwik';

export function createEventHandler(
  value: string,
  options: { block: BuilderBlock } & Pick<
    BuilderContextInterface,
    'state' | 'context'
  >
): (event: Event) => any {
  return $((event: Event) =>
    evaluate({
      code: value,
      context: options.context,
      state: options.state,
      event,
    })
  );
}
