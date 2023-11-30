import { useMetadata, useStore } from '@builder.io/mitosis';
import InlinedStyles from '../../inlined-styles.lite.jsx';
import type { CustomFont } from './styles.helpers.js';
import { getCss, getFontCss } from './styles.helpers.js';

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
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

.builder-text > p:first-of-type, .builder-text > .builder-paragraph:first-of-type {
  margin: 0;
}
.builder-text > p, .builder-text > .builder-paragraph {
  color: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  font-weight: inherit;
  font-size: inherit;
  text-align: inherit;
  font-family: inherit;
}
`.trim(),
  });

  return <InlinedStyles styles={state.injectedStyles} />;
}
