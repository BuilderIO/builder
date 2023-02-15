import RenderInlinedStyles from '../../render-inlined-styles.lite';
import { useStore } from '@builder.io/mitosis';
import type { CustomFont } from './render-styles.helpers';
import { getCss } from './render-styles.helpers';
import { getFontCss } from './render-styles.helpers';

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
}

export default function RenderContentStyles(props: Props) {
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
`,
  });

  return <RenderInlinedStyles styles={state.injectedStyles} />;
}
