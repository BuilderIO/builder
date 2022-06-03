import { BuilderBlock } from '../../types/builder-block.js';
import RenderInlinedStyles from '../render-inlined-styles.lite';
import { useState } from '@builder.io/mitosis';

export type BlockStylesProps = {
  block: BuilderBlock;
};

export default function BlockStyles(props: BlockStylesProps) {
  const state = useState({
    camelToKebabCase(string: string) {
      return string
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .toLowerCase();
    },

    get css(): string {
      // TODO: media queries
      const styleObject = props.block.responsiveStyles?.large;
      if (!styleObject) {
        return '';
      }

      let str = `.${props.block.id} {`;

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
  return <RenderInlinedStyles styles={state.css} />;
}
