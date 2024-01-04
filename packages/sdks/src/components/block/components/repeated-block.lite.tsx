import { setContext, useMetadata, useState } from '@builder.io/mitosis';
import BuilderContext from '../../../context/builder.context.lite.js';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../context/types.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import Block from '../block.lite.jsx';

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};

useMetadata({
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
  rsc: {
    componentType: 'server',
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
    <Block
      block={props.block}
      context={store}
      registeredComponents={props.registeredComponents}
    />
  );
}
