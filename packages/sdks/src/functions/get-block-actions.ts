import { TARGET } from '../constants/target.js';
import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { getEventHandlerName } from './event-handler-name.js';
import { createEventHandler } from './get-block-actions-handler.js';

type Actions = { [index: string]: (event: Event) => any };

export function getBlockActions(
  options: {
    block: BuilderBlock;
    stripVOn?: boolean;
  } & Pick<
    BuilderContextInterface,
    'localState' | 'context' | 'rootState' | 'rootSetState'
  >
): Actions {
  const obj: Actions = {};
  const optionActions = options.block.actions ?? {};

  for (const key in optionActions) {
    // eslint-disable-next-line no-prototype-builtins
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];

    let eventHandlerName = getEventHandlerName(key);

    // Vue edge-case
    if (options.stripVOn && (TARGET === 'vue3' || TARGET === 'vue2')) {
      eventHandlerName = eventHandlerName.replace('v-on:', '');
    }

    obj[eventHandlerName] = createEventHandler(value, options);
  }

  return obj;
}
