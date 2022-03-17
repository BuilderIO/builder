import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext, useEffect } from "react";
import RenderContent from "../components/render-content.lite";
import BuilderContext from "../context/builder.context.lite";
import { getContent } from "../functions/get-content";

export default function Symbol(props) {
  const [className, setClassName] = useState(() => "builder-symbol");

  const [content, setContent] = useState(() => null);

  const builderContext = useContext(BuilderContext);

  useEffect(() => {
    setContent(props.symbol?.content);
  }, []);

  return (
    <View
      dataSet={{
        class: className,
      }}
      className={className}
    >
      <RenderContent
        apiKey={builderContext.apiKey}
        context={builderContext.context}
        data={{
          ...props.symbol?.data,
          ...builderContext.state,
          ...props.symbol?.content?.data?.state,
        }}
        model={props.symbol?.model}
        content={content}
      />
    </View>
  );
}
