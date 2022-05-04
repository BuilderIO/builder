import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import RenderInlinedStyles from "../render-inlined-styles.lite";

export default function BlockStyles(props) {
  function camelToKebabCase(string) {
    return string
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  function css() {
    // TODO: media queries
    const styleObject = props.block.responsiveStyles?.large;

    if (!styleObject) {
      return "";
    }

    let str = `.${props.block.id} {`;

    for (const key in styleObject) {
      const value = styleObject[key];

      if (typeof value === "string") {
        str += `${camelToKebabCase(key)}: ${value};`;
      }
    }

    str += "}";
    return str;
  }

  return <RenderInlinedStyles styles={css()} />;
}
