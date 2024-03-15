import { $ } from '@builder.io/qwik';
import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate/index.js';

export function createEventHandler(
  value: string,
  options: { block: BuilderBlock } & Pick<
    BuilderContextInterface,
    'localState' | 'context' | 'rootState' | 'rootSetState'
  >
): (event: Event) => any {
  return $((event: Event) =>
    evaluate({
      code: value,
      context: options.context,
      localState: options.localState,
      rootState: options.rootState,
      rootSetState: options.rootSetState,
      event,
      enableCache: true,
    })
  );
}
