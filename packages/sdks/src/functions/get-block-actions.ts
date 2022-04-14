import { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate';
import { getEventHandlerName } from './event-handler-name';

type Actions = { [index: string]: (event: Event) => any };

export function getBlockActions(options: {
  block: BuilderBlock;
  context: any;
  state: any;
}): Actions {
  const obj: Actions = {};
  const optionActions = options.block.actions ?? {};

  for (const key in optionActions) {
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];
    obj[getEventHandlerName(key)] = (event: Event) =>
      evaluate({
        code: value,
        context: options.context,
        state: options.state,
        event,
      });
  }
  return obj;
}
