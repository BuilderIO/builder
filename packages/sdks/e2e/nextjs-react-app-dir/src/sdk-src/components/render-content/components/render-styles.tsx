import * as React from 'react';

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
}

import RenderInlinedStyles from '../../render-inlined-styles';
import type { CustomFont } from './render-styles.helpers';
import { getCss } from './render-styles.helpers';
import { getFontCss } from './render-styles.helpers';
import type { BuilderContextInterface } from '@/sdk-src/context/types';

function RenderContentStyles(props: { context: BuilderContextInterface }) {
  const contentId = props.context.content?.id;
  const cssCode = props.context.content?.data?.cssCode;
  const customFonts = props.context.content?.data?.customFonts;

  const injectedStyles = `
  ${getCss({
    cssCode,
    contentId,
  })}
  ${getFontCss({
    customFonts,
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
  `.trim();

  return <RenderInlinedStyles styles={injectedStyles} />;
}

export default RenderContentStyles;
