import { useMetadata, useStore } from '@builder.io/mitosis';
import type { BuilderNonceProp } from '../../../types/builder-props.js';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import type { CustomFont } from './styles.helpers.js';
import { getCss, getDefaultStyles, getFontCss } from './styles.helpers.js';

interface Props extends BuilderNonceProp {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  isNestedRender?: boolean;
}

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export default function ContentStyles(props: Props) {
  const state = useStore({
    injectedStyles: `
${getCss({ cssCode: props.cssCode, contentId: props.contentId })}
${getFontCss({ customFonts: props.customFonts })}
${getDefaultStyles(props.isNestedRender)}
`.trim(),
  });

  return (
    <InlinedStyles
      styles={state.injectedStyles}
      id="builderio-content"
      nonce={props.nonce}
    />
  );
}
