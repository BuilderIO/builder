import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useEffect } from "react";
import ContentVariants from "../../components/content-variants/content-variants";
import { filterAttrs } from "../helpers.js";
import { fetchSymbolContent } from "./symbol.helpers.js";

function Symbol(props) {
  function className() {
    return [
      ...[],
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const [contentToUse, setContentToUse] = useState(() => props.symbol?.content);

  function setContent() {
    if (contentToUse) return;
    fetchSymbolContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }).then((newContent) => {
      if (newContent) {
        setContentToUse(newContent);
      }
    });
  }

  useEffect(() => {}, []);

  useEffect(() => {
    setContent();
  }, [props.symbol]);

  return (
    <View
      {...{}}
      {...props.attributes}
      {...{
        dataSet: {
          class: className(),
        },
      }}
    >
      <ContentVariants
        __isNestedRender={true}
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey}
        context={props.builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
      />
    </View>
  );
}

export default Symbol;
