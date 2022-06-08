import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import RenderInlinedStyles from "../render-inlined-styles.lite";

export default function BlockStyles(props) {
  function useBlock() {
    return getProcessedBlock({
      block: props.block,
      state: builderContext.state,
      context: builderContext.context,
    });
  }

  function camelToKebabCase(string) {
    return string
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  function css() {
    // TODO: media queries
    const styleObject = useBlock().responsiveStyles?.large;

    if (!styleObject) {
      return "";
    }

    let str = `.${useBlock().id} {`;

    for (const key in styleObject) {
      const value = styleObject[key];

      if (typeof value === "string") {
        str += `${camelToKebabCase(key)}: ${value};`;
      }
    }

    str += "}";
    return str;
  }

  const builderContext = useContext(BuilderContext);

  return (
    <>
      {TARGET === "vue" || TARGET === "svelte" ? (
        <>
          <RenderInlinedStyles styles={css()} />
        </>
      ) : null}
    </>
  );
}
