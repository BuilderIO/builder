import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useContext } from "react";
import BuilderContext from "../../context/builder.context.js";
import RenderBlock from "./render-block";

function RenderRepeatedBlock(props) {
  return (
    <BuilderContext.Provider
      value={{
        content: props.repeatContext.content,
        localState: props.repeatContext.localState,
        rootState: props.repeatContext.rootState,
        rootSetState: props.repeatContext.rootSetState,
        context: props.repeatContext.context,
        apiKey: props.repeatContext.apiKey,
        registeredComponents: props.repeatContext.registeredComponents,
        inheritedStyles: props.repeatContext.inheritedStyles,
        apiVersion: props.repeatContext.apiVersion,
      }}
    >
      <RenderBlock block={props.block} context={props.repeatContext} />
    </BuilderContext.Provider>
  );
}

export default RenderRepeatedBlock;
