import { TARGET } from '../constants/target';
import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';
import { getEventHandlerName } from './event-handler-name';
import { createEventHandler } from './get-block-actions-handler';
type Actions = {
  [index: string]: (event: Event) => any;
};
export function getBlockActions(options: {
  block: BuilderBlock;
  stripPrefix?: boolean;
} & Pick<BuilderContextInterface, 'localState' | 'context' | 'rootState' | 'rootSetState'>): Actions {
  const obj: Actions = {};
  const optionActions = options.block.actions ?? {};
  for (const key in optionActions) {
    // eslint-disable-next-line no-prototype-builtins
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];
    let eventHandlerName = getEventHandlerName(key);
    if (options.stripPrefix) {
      switch (TARGET) {
        case 'vue':
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