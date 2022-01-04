import { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
      obj['on' + capitalizeFirstLetter(key)] = (event: Event) =>
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
