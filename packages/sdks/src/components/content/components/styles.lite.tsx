import { useMetadata, useStore } from '@builder.io/mitosis';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import type { CustomFont } from './styles.helpers.js';
import { getCss, getDefaultStyles, getFontCss } from './styles.helpers.js';

type Props = {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  __isNestedRender?: boolean;
};

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
${getDefaultStyles(props.__isNestedRender)}
`.trim(),
  });

  return <InlinedStyles styles={state.injectedStyles} />;
}
