import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState } from "react";
import RenderInlinedStyles from "../../render-inlined-styles";
import { getCss } from "./render-styles.helpers";
import { getFontCss } from "./render-styles.helpers";

function RenderContentStyles(props) {
  const [injectedStyles, setInjectedStyles] = useState(
    () => `
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
`
  );

  return <RenderInlinedStyles styles={injectedStyles} />;
}

export default RenderContentStyles;
