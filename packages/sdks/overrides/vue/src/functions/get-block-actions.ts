import { evaluate } from './evaluate';

export function getBlockActions(options: { block: any; context: any; state: any }): any {
  const obj: any = {};
  if (options.block.actions) {
    for (const key in options.block.actions) {
      const value = options.block.actions[key];
      obj['v-on:' + key] = (event: Event) =>
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
