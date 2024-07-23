import { setContext, useMetadata, useState } from '@builder.io/mitosis';
import BuilderContext from '../../../context/builder.context.lite.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import type { BlockProps } from '../block.lite.jsx';
import Block from '../block.lite.jsx';

type Props = Omit<BlockProps, 'context'> & {
  repeatContext: BuilderContextInterface;
};

useMetadata({
  options: {
    vue: {
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
      linkComponent={props.linkComponent}
    />
  );
}
