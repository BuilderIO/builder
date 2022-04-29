import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext, useEffect } from "react";
import { isBrowser } from "../../functions/is-browser";
import BuilderContext from "../../context/builder.context";
import { track } from "../../functions/track";
import { isEditing } from "../../functions/is-editing";
import { isPreviewing } from "../../functions/is-previewing";
import { previewingModelName } from "../../functions/previewing-model-name";
import { getContent } from "../../functions/get-content";
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from "../../functions/get-builder-search-params";
import RenderBlocks from "../render-blocks.lite";
import { evaluate } from "../../functions/evaluate";
import { getFetch } from "../../functions/get-fetch";
import { TARGET } from "../../constants/target";
import RenderStyles from "./components/render-styles.lite";

export default function RenderContent(props) {
  function useContent() {
    const mergedContent = {
      ...props.content,
      ...overrideContent,
      data: { ...props.content?.data, ...props.data, ...overrideContent?.data },
    };
    return mergedContent;
  }

  const [overrideContent, setOverrideContent] = useState(() => null);

  const [update, setUpdate] = useState(() => 0);

  const [overrideState, setOverrideState] = useState(() => ({}));

  function state() {
    return { ...props.content?.data?.state, ...props.data, ...overrideState };
  }

  function context() {
    return {};
  }

  function processMessage(event) {
    const { data } = event;

    if (data) {
      switch (data.type) {
        case "builder.contentUpdate": {
          const messageContent = data.data;
          const key =
            messageContent.key ||
            messageContent.alias ||
            messageContent.entry ||
            messageContent.modelName;
          const contentData = messageContent.data;

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

  function evaluateJsCode() {
    // run any dynamic JS code attached to content
    const jsCode = useContent?.()?.data?.jsCode;

    if (jsCode) {
      evaluate({
        code: jsCode,
        context: context(),
        state: state(),
      });
    }
  }

  function httpReqsData() {
    return {};
  }

  function evalExpression(expression) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: context(),
        state: state(),
      })
    );
  }

  function handleRequest({ url, key }) {
    const fetchAndSetState = async () => {
      const response = await getFetch()(url);
      const json = await response.json();
      const newOverrideState = { ...overrideState, [key]: json };
      setOverrideState(newOverrideState);
    };

    fetchAndSetState();
  }

  function runHttpRequests() {
    const requests = useContent?.()?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (url && (!httpReqsData()[key] || isEditing())) {
        const evaluatedUrl = evalExpression(url);
        handleRequest({
          url: evaluatedUrl,
          key,
        });
      }
    });
  }

  function emitStateUpdate() {
    window.dispatchEvent(
      new CustomEvent("builder:component:stateChange", {
        detail: {
          state: state(),
          ref: {
            name: props.model,
          },
        },
      })
    );
  }

  useEffect(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener("message", processMessage);
        window.addEventListener(
          "builder:component:stateChangeListenerActivated",
          emitStateUpdate
        );
      }

      if (useContent()) {
        track("impression", {
          contentId: useContent().id,
        });
      } // override normal content in preview mode

      if (isPreviewing()) {
        if (props.model && previewingModelName() === props.model) {
          const currentUrl = new URL(location.href);
          const previewApiKey = currentUrl.searchParams.get("apiKey");

          if (previewApiKey) {
            getContent({
              model: props.model,
              apiKey: previewApiKey,
              options: getBuilderSearchParams(
                convertSearchParamsToQueryObject(currentUrl.searchParams)
              ),
            }).then((content) => {
              if (content) {
                setOverrideContent(content);
              }
            });
          }
        }
      }

      evaluateJsCode();
      runHttpRequests();
      emitStateUpdate();
    }
  }, []);

  useEffect(() => {
    evaluateJsCode();
  }, [useContent?.()?.data?.jsCode]);
  useEffect(() => {
    runHttpRequests();
  }, [useContent?.()?.data?.httpRequests]);
  useEffect(() => {
    emitStateUpdate();
  }, [state()]);

  useEffect(() => {
    return () => {
      if (isBrowser()) {
        window.removeEventListener("message", processMessage);
        window.removeEventListener(
          "builder:component:stateChangeListenerActivated",
          emitStateUpdate
        );
      }
    };
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        get content() {
          return useContent();
        },

        get state() {
          return state();
        },

        get context() {
          return context();
        },

        get apiKey() {
          return props.apiKey;
        },
      }}
    >
      {useContent() ? (
        <>
          <View
            onClick={(event) =>
              track("click", {
                contentId: useContent().id,
              })
            }
            data-builder-content-id={useContent?.()?.id}
          >
            {(useContent?.()?.data?.cssCode ||
              useContent?.()?.data?.customFonts?.length) &&
            TARGET !== "reactNative" ? (
              <RenderStyles
                cssCode={useContent().data.cssCode}
                customFonts={useContent().data.customFonts}
              />
            ) : null}

            <RenderBlocks blocks={useContent?.()?.data?.blocks} />
          </View>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}
