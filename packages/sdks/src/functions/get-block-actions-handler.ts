import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate/index.js';
import type { TrackingContext } from './evaluate/helpers.js';

type Options = {
  block: BuilderBlock;
  trackingContext?: TrackingContext;
} & Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
>;

type EventHandler = (event: Event) => any;

export const createEventHandler =
  (value: string, options: Options): EventHandler =>
  (event) =>
    evaluate({
      code: value,
      context: options.context,
      localState: options.localState,
      rootState: options.rootState,
      rootSetState: options.rootSetState,
      event,
      isExpression: false,
      trackingContext: options.trackingContext,
    });
