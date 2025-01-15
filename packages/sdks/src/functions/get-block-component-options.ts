import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { evaluate } from './evaluate/evaluate.js';

export function getBlockComponentOptions(
  block: BuilderBlock,
  context: Pick<
    BuilderContextInterface,
    'localState' | 'context' | 'rootState' | 'rootSetState'
  >
) {
  return {
    ...block.component?.options,
    ...(block as any).options,
    ...evaluateTextComponentTextOption(block, context),
  };
}

const evaluateTextComponentTextOption = (
  block: BuilderBlock,
  context: Pick<
    BuilderContextInterface,
    'localState' | 'context' | 'rootState' | 'rootSetState'
  >
) => {
  if (
    block.component?.name === 'Text' &&
    block.component.options?.text &&
    typeof block.component.options.text === 'string'
  ) {
    return {
      ...block.component.options,
      text: block.component.options.text.replace(
        /{{([^}]+)}}/g,
        (_match: string, group: string) =>
          evaluate({
            code: group,
            context,
            localState: context.localState,
            rootState: context.rootState,
            rootSetState: context.rootSetState,
          }) as string
      ),
    };
  }
};
