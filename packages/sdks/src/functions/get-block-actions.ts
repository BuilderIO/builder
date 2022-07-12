import type {
  BuilderRenderContext,
  BuilderRenderState,
} from '../context/builder.context.lite';
import { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate.js';
import { getEventHandlerName } from './event-handler-name.js';

type Actions = { [index: string]: (event: Event) => any };

export function getBlockActions(options: {
  block: BuilderBlock;
  context: BuilderRenderContext;
  state: BuilderRenderState;
}): Actions {
  const obj: Actions = {};
  const optionActions = options.block.actions ?? {};

  for (const key in optionActions) {
    // eslint-disable-next-line no-prototype-builtins
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
