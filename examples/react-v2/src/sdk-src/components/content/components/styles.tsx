"use client";
import * as React from "react";
import { useState } from "react";

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  isNestedRender?: boolean;
}

import InlinedStyles from "../../inlined-styles";
import type { CustomFont } from "./styles.helpers.js";
import { getCss, getDefaultStyles, getFontCss } from "./styles.helpers.js";

function ContentStyles(props: Props) {
  const [injectedStyles, setInjectedStyles] = useState(() =>
    `
${getCss({
  cssCode: props.cssCode,
  contentId: props.contentId,
})}
${getFontCss({
  customFonts: props.customFonts,
})}
${getDefaultStyles(props.isNestedRender)}
`.trim()
  );

  return <InlinedStyles id="builderio-content" styles={injectedStyles} />;
}

export default ContentStyles;
