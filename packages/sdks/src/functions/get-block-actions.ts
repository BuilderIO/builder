import { evaluate } from './evaluate';
import { getEventHandlerName } from './name-event-handlers';

export function getBlockActions(options: {
  block: any;
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
