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
import BlockStyles from "./block-styles";
import RenderBlock from "./render-block";
import BuilderContext from "../../context/builder.context.js";

function RenderComponent(props) {
  const ComponentRefRef = props.componentRef;

  return (
    <BuilderContext.Provider
      value={{
        content: props.context.content,
        rootState: props.context.rootState,
        localState: props.context.localState,
        context: props.context.context,
        apiKey: props.context.apiKey,
        registeredComponents: props.context.registeredComponents,
        inheritedStyles: props.context.inheritedStyles,
        apiVersion: props.context.apiVersion,
      }}
    >
      {props.componentRef ? (
        <>
          <ComponentRefRef {...props.componentOptions}>
            {props.blockChildren?.map((child) => (
              <RenderBlock
                key={"render-block-" + child.id}
                block={child}
                context={props.context}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
              />
            ))}
          </ComponentRefRef>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}

export default RenderComponent;
