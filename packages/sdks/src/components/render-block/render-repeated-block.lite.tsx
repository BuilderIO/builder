import { setContext } from '@builder.io/mitosis';
import BuilderContext, {
  BuilderContextInterface,
} from '../../context/builder.context.lite';
import { BuilderBlock } from '../../types/builder-block';
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
    get content() {
      return props.repeatContext.content;
    },
    get state() {
      return props.repeatContext.state;
    },
    get context() {
      return props.repeatContext.context;
    },
    get apiKey() {
      return props.repeatContext.apiKey;
    },
    get registeredComponents() {
      return props.repeatContext.registeredComponents;
    },
  });

  return <RenderBlock block={props.block} />;
}
