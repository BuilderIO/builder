import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { getEventHandlerName } from './event-handler-name.js';
import { crateEventHandler } from './get-block-actions-handler.js';

type Actions = { [index: string]: (event: Event) => any };

export function getBlockActions(
  options: {
    block: BuilderBlock;
  } & Pick<BuilderContextInterface, 'state' | 'context'>
): Actions {
  const obj: Actions = {};
  const optionActions = options.block.actions ?? {};

  for (const key in optionActions) {
    // eslint-disable-next-line no-prototype-builtins
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];
    obj[getEventHandlerName(key)] = crateEventHandler(value, options);
  }
  return obj;
}
