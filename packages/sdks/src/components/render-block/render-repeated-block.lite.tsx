import { setContext } from '@builder.io/mitosis';
import BuilderContext from '../../context/builder.context.lite';
import type { BuilderContextInterface } from '../../context/types.js';
import type { BuilderBlock } from '../../types/builder-block';
import RenderBlock from './render-block.lite';

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
};

/**
 * We can't make this a generic `ProvideContext` function because Vue 2 won't support root slots, e.g.
 *
 * ```vue
 * <template>
 *  <slot></slot>
 * </template>
 * ```
 */
export default function RenderRepeatedBlock(props: Props) {
  setContext(BuilderContext, {
    content: props.repeatContext.content,
    state: props.repeatContext.state,
    context: props.repeatContext.context,
    apiKey: props.repeatContext.apiKey,
    registeredComponents: props.repeatContext.registeredComponents,
    inheritedStyles: props.repeatContext.inheritedStyles,
  });

  return <RenderBlock block={props.block} context={props.repeatContext} />;
}
