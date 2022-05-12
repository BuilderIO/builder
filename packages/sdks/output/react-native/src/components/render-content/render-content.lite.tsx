import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext, useEffect } from "react";
import { DEFAULT_REGISTERED_COMPONENTS } from "../../constants/builder-registered-components.js";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context";
import { evaluate } from "../../functions/evaluate.js";
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from "../../functions/get-builder-search-params/index.js";
import { getContent } from "../../functions/get-content/index.js";
import { getFetch } from "../../functions/get-fetch.js";
import { isBrowser } from "../../functions/is-browser.js";
import { isEditing } from "../../functions/is-editing.js";
import { isPreviewing } from "../../functions/is-previewing.js";
import { previewingModelName } from "../../functions/previewing-model-name.js";
import { createRegisterComponentMessage } from "../../functions/register-component.js";
import { track } from "../../functions/track.js";
import RenderBlocks from "../render-blocks.lite";
import RenderContentStyles from "./components/render-styles.lite";

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

  function contentState() {
    return { ...props.content?.data?.state, ...props.data, ...overrideState };
  }

  function context() {
    return {};
  }

  function allRegisteredComponents() {
    return { ...DEFAULT_REGISTERED_COMPONENTS, ...props.customComponents };
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
        state: contentState(),
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
        state: contentState(),
      })
    );
  }

  function handleRequest({ url, key }) {
    const fetchAndSetState = async () => {
      const fetch = await getFetch();
      const response = await fetch(url);
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
          state: contentState(),
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
        Object.values(allRegisteredComponents()).forEach(
          (registeredComponent) => {
            const message = createRegisterComponentMessage(registeredComponent);
            window.parent?.postMessage(message, "*");
          }
        );
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
  }, [contentState()]);

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
          return contentState();
        },

        get context() {
          return context();
        },

        get apiKey() {
          return props.apiKey;
        },

        get registeredComponents() {
          return allRegisteredComponents();
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
              <RenderContentStyles
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
