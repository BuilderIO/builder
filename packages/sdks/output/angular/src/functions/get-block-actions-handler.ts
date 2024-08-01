import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from '../types/builder-block';
import { evaluate } from './evaluate/index';
type Options = {
  block: BuilderBlock;
} & Pick<BuilderContextInterface, 'localState' | 'context' | 'rootState' | 'rootSetState'>;
type EventHandler = (event: Event) => any;
export const createEventHandler = (value: string, options: Options): EventHandler => event => evaluate({
  code: value,
  context: options.context,
  localState: options.localState,
  rootState: options.rootState,
  rootSetState: options.rootSetState,
  event,
  isExpression: false,
  enableCache: true
})