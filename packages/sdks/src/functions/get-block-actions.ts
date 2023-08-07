import { TARGET } from '../constants/target.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { getEventHandlerName } from './event-handler-name.js';
import type { Options } from './get-block-actions-handler.js';
import { createEventHandler } from './get-block-actions-handler.js';

type Actions = { [index: string]: (event: Event) => any };

export function getBlockActions({
  block,
  stripPrefix,
  ...options
}: {
  block: BuilderBlock;
  stripPrefix?: boolean;
} & Options): Actions {
  const obj: Actions = {};
  const optionActions = block.actions ?? {};

  for (const key in optionActions) {
    // eslint-disable-next-line no-prototype-builtins
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];

    let eventHandlerName = getEventHandlerName(key);

    if (stripPrefix) {
      switch (TARGET) {
        case 'vue2':
        case 'vue3':
          eventHandlerName = eventHandlerName.replace('v-on:', '');
          break;
        case 'svelte':
          eventHandlerName = eventHandlerName.replace('on:', '');
          break;
      }
    }

    obj[eventHandlerName] = createEventHandler(value, options);
  }

  return obj;
}
