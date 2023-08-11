import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { TARGET } from "../constants/target.js";

function RenderInlinedStyles(props) {
  function tag() {
    // NOTE: we have to obfuscate the name of the tag due to a limitation in the svelte-preprocessor plugin.
    // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
    return "sty" + "le";
  }

  function injectedStyleScript() {
    return `<${tag()}>${props.styles}</${tag()}>`;
  }

  return (
    <>
      {TARGET === "svelte" || TARGET === "qwik" ? (
        <>
          <View dangerouslySetInnerHTML={{ __html: props.styles }} />
        </>
      ) : (
        <View>
          <Text>{props.styles}</Text>
        </View>
      )}
    </>
  );
}

export default RenderInlinedStyles;
