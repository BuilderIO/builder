import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext, useEffect } from "react";
import { isBrowser } from "../functions/is-browser";
import RenderBlock from "./render-block.lite";
import BuilderContext from "../context/builder.context.lite";
import { track } from "../functions/track";
import { ifTarget } from "../functions/if-target";
import { onChange } from "../functions/on-change";
import { isReactNative } from "../functions/is-react-native";

export default function RenderContent(props) {
  function useContent() {
    return overrideContent || props.content;
  }

  const [update, setUpdate] = useState(() => 0);

  const [state, setState] = useState(() => ({}));

  const [context, setContext] = useState(() => ({}));

  const [overrideContent, setOverrideContent] = useState(() => null);

  function processMessage(event) {
    const { data } = event;

    if (data) {
      switch (data.type) {
        case "builder.contentUpdate": {
          const key =
            data.data.key ||
            data.data.alias ||
            data.data.entry ||
            data.data.modelName;
          const contentData = data.data.data; // oof

          if (key === props.model) {
            setOverrideContent(contentData);
          }

          break;
        }

        case "builder.patchUpdates": {
          // TODO
          break;
        }
      }
    }
  }

  useEffect(() => {
    if (isBrowser()) {
      window.addEventListener("message", processMessage); // TODO: run this when content is defined
      // track('impression', {
      //   contentId: props.content!.id,
      // });
    }
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        get content() {
          return props.content;
        },

        get state() {
          return state;
        },

        get context() {
          return context;
        },
      }}
    >
      <View
        onClick={(event) => {
          track("click", {
            contentId: props.content.id,
          });
        }}
        data-builder-content-id={props.content?.id}
      >
        {useContent?.()?.data?.cssCode && !isReactNative() && (
          <View>
            <Text>{useContent().data.cssCode}</Text>
          </View>
        )}

        {useContent?.()?.data?.blocks?.map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </View>
    </BuilderContext.Provider>
  );
}
