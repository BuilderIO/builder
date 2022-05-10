import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { TARGET } from "../constants/target.js";

export default function RenderInlinedStyles(props) {
  function injectedStyleScript() {
    return `<${tagName()}>${props.styles}</${tagName()}>`;
  }

  function tagName() {
    // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
    // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
    return "sty" + "le";
  }

  const TagNameRef = tagName();

  return (
    <>
      {TARGET === "svelte" ? (
        <>
          <></>
        </>
      ) : (
        <TagNameRef>
          <Text>{props.styles}</Text>
        </TagNameRef>
      )}
    </>
  );
}
