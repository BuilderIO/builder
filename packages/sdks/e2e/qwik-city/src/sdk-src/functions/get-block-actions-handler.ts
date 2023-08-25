import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate/index';
import { $ } from '@builder.io/qwik';

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
    })
  );
}
