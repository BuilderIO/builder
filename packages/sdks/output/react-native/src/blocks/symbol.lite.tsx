import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext, useEffect } from "react";
import RenderContent from "../components/render-content/render-content.lite";
import BuilderContext from "../context/builder.context";
import { getContent } from "../functions/get-content";

export default function Symbol(props) {
  const [className, setClassName] = useState(() => "builder-symbol");

  const [content, setContent] = useState(() => null);

  const builderContext = useContext(BuilderContext);

  useEffect(() => {
    setContent(props.symbol?.content);
  }, []);

  useEffect(() => {
    const symbolToUse = props.symbol;

    if (symbolToUse && !symbolToUse.content && !content && symbolToUse.model) {
      getContent({
        model: symbolToUse.model,
        apiKey: builderContext.apiKey,
        options: {
          entry: symbolToUse.entry,
        },
      }).then((response) => {
        setContent(response);
      });
    }
  }, [
    props.symbol?.content,
    props.symbol?.model,
    props.symbol?.entry,
    content,
  ]);

  return (
    <View
      {...props.attributes}
      dataSet={{
        class: className,
      }}
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
