import { useState, setContext } from '@builder.io/mitosis';
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
  const [store] = useState(props.repeatContext, { reactive: true });

  setContext(BuilderContext, store);

  return <RenderBlock block={props.block} context={store} />;
}
