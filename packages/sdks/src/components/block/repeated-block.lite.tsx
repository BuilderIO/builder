import { useState, setContext } from '@builder.io/mitosis';
import BuilderContext from '../../../context/builder.context.lite';
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../../context/types.js';
import type { BuilderBlock } from '../../../types/builder-block';
import Block from '../block.lite';
import { useMetadata } from '@builder.io/mitosis';
import type { Dictionary } from '../../../types/typescript';

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  components: Dictionary<RegisteredComponent>;
};

useMetadata({
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
});

/**
 * We can't make this a generic `ProvideContext` function because Vue 2 won't support root slots, e.g.
 *
 * ```vue
 * <template>
 *  <slot></slot>
 * </template>
 * ```
 */
export default function RepeatedBlock(props: Props) {
  const [store] = useState(props.repeatContext, { reactive: true });

  setContext(BuilderContext, store);

  return (
    <Block block={props.block} context={store} components={props.components} />
  );
}
