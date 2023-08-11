import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useContext, useEffect } from "react";
import RenderContent from "../../components/render-content/render-content";
import BuilderContext from "../../context/builder.context.js";
import { getContent } from "../../functions/get-content/index.js";
import { TARGET } from "../../constants/target";
import { logger } from "../../helpers/logger";

function Symbol(props) {
  const [className, setClassName] = useState(() =>
    [
      ...(TARGET === "vue2" || TARGET === "vue3"
        ? Object.keys(props.attributes.class)
        : [props.attributes.class]),
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const [contentToUse, setContentToUse] = useState(() => props.symbol?.content);

  function fetchContent() {
    /**
     * If:
     * - we have a symbol prop
     * - yet it does not have any content
     * - and we have not already stored content from before
     * - and it has a model name
     *
     * then we want to re-fetch the symbol content.
     */
    if (
      !contentToUse &&
      props.symbol?.model &&
      // This is a hack, we should not need to check for this, but it is needed for Svelte.
      builderContext?.apiKey
    ) {
      getContent({
        model: props.symbol.model,
        apiKey: builderContext.apiKey,
        apiVersion: builderContext.apiVersion,
        query: {
          id: props.symbol.entry,
        },
      })
        .then((response) => {
          if (response) {
            setContentToUse(response);
          }
        })
        .catch((err) => {
          logger.error("Could not fetch symbol content: ", err);
        });
    }
  }

  const builderContext = useContext(BuilderContext);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [props.symbol]);

  return (
    <View
      {...props.attributes}
      dataSet={{
        class: className,
      }}
    >
      <RenderContent
        apiVersion={builderContext.apiVersion}
        apiKey={builderContext.apiKey}
        context={builderContext.context}
        customComponents={Object.values(builderContext.registeredComponents)}
        data={{
          ...props.symbol?.data,
          ...builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
      />
    </View>
  );
}

export default Symbol;
