import { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate';
import { getEventHandlerName } from './event-handler-name';

export function getBlockActions(options: {
  block: BuilderBlock;
  context: any;
  state: any;
}): any {
  const obj: any = {};
  if (options.block.actions) {
    for (const key in options.block.actions) {
      if (!options.block.actions.hasOwnProperty(key)) {
        continue;
      }
      const value = options.block.actions[key];
      obj[getEventHandlerName(key)] = (event: Event) =>
        evaluate({
          code: value,
          context: options.context,
          state: options.state,
          event,
        });
    }
  }
  return obj;
}
