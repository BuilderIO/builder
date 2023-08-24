import InlinedStyles from '../../inlined-styles';

import { CustomFont, getCss, getFontCss } from './styles.helpers';

import { Fragment, component$, h, useStore } from '@builder.io/qwik';

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
}
export const ContentStyles = component$((props: Props) => {
  const state = useStore<any>({
    injectedStyles: `
${getCss({
  cssCode: props.cssCode,
  contentId: props.contentId,
})}
${getFontCss({
  customFonts: props.customFonts,
})}

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

  return <InlinedStyles styles={state.injectedStyles}></InlinedStyles>;
});

export default ContentStyles;
