"use client";
import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useContext } from "react";
import BlockStyles from "../block-styles";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import { getWrapperProps } from "./component-ref.helpers.js";
import BuilderContext from "../../../../context/builder.context";

function ComponentRef(props) {
  const [Wrapper, setWrapper] = useState(() =>
    props.isInteractive ? InteractiveElement : props.componentRef
  );

  return (
    <BuilderContext.Provider
      value={{
        content: props.context.content,
        rootState: props.context.rootState,
        localState: props.context.localState,
        context: props.context.context,
        apiKey: props.context.apiKey,
        componentInfos: props.context.componentInfos,
        inheritedStyles: props.context.inheritedStyles,
        apiVersion: props.context.apiVersion,
      }}
    >
      {props.componentRef ? (
        <>
          <Wrapper
            {...getWrapperProps({
              componentOptions: props.componentOptions,
              builderBlock: props.builderBlock,
              context: props.context,
              componentRef: props.componentRef,
              includeBlockProps: props.includeBlockProps,
              isInteractive: props.isInteractive,
              contextValue: props.context,
            })}
          >
            {props.blockChildren?.map((child) => (
              <Block
                key={"block-" + child.id}
                block={child}
                context={props.context}
                registeredComponents={props.registeredComponents}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
              />
            ))}
          </Wrapper>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}

export default ComponentRef;
