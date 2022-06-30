import { TARGET } from '../../constants/target.js';
import BuilderContext from '../../context/builder.context.lite';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';
import { Show, useContext, useStore } from '@builder.io/mitosis';

export type BlockStylesProps = {
  block: BuilderBlock;
};

export default function BlockStyles(props: BlockStylesProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    get useBlock(): BuilderBlock {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    camelToKebabCase(string: string) {
      return string
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .toLowerCase();
    },

    get css(): string {
      // TODO: media queries
      const styleObject = state.useBlock.responsiveStyles?.large;
      if (!styleObject) {
        return '';
      }

      let str = `.${state.useBlock.id} {`;

      for (const key in styleObject) {
        const value = styleObject[key];
        if (typeof value === 'string') {
          str += `${state.camelToKebabCase(key)}: ${value};`;
        }
      }

      str += '}';

      return str;
    },
  });
  return (
    <Show when={TARGET === 'vue' || TARGET === 'svelte'}>
      <RenderInlinedStyles styles={state.css} />
    </Show>
  );
}
