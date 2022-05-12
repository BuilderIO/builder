import { useContext, Show, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createMutable } from "solid-js/store";

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

function RenderContent(props) {
  const state = createMutable({
    get useContent() {
      const mergedContent: BuilderContent = {
        ...props.content,
        ...state.overrideContent,
        data: {
          ...props.content?.data,
          ...props.data,
          ...state.overrideContent?.data,
        },
      };
      return mergedContent;
    },
    overrideContent: null,
    update: 0,
    overrideState: {},
    get contentState() {
      return {
        ...props.content?.data?.state,
        ...props.data,
        ...state.overrideState,
      };
    },
    get context() {
      return {} as {
        [index: string]: any;
      };
    },
    get allRegisteredComponents() {
      return { ...DEFAULT_REGISTERED_COMPONENTS, ...props.customComponents };
    },
    processMessage(event: MessageEvent) {
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
              state.overrideContent = contentData;
            }

            break;
          }

          case "builder.patchUpdates": {
            // TODO
            break;
          }
        }
      }
    },
    evaluateJsCode() {
      // run any dynamic JS code attached to content
      const jsCode = state.useContent?.data?.jsCode;

      if (jsCode) {
        evaluate({
          code: jsCode,
          context: state.context,
          state: state.contentState,
        });
      }
    },
    get httpReqsData() {
      return {};
    },
    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: state.context,
          state: state.contentState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      const fetchAndSetState = async () => {
        const fetch = await getFetch();
        const response = await fetch(url);
        const json = await response.json();
        const newOverrideState = { ...state.overrideState, [key]: json };
        state.overrideState = newOverrideState;
      };

      fetchAndSetState();
    },
    runHttpRequests() {
      const requests = state.useContent?.data?.httpRequests ?? {};
      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!state.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = state.evalExpression(url);
          state.handleRequest({
            url: evaluatedUrl,
            key,
          });
        }
      });
    },
    emitStateUpdate() {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          "builder:component:stateChange",
          {
            detail: {
              state: state.contentState,
              ref: {
                name: props.model,
              },
            },
          }
        )
      );
    },
  });

  onMount(() => {
    if (isBrowser()) {
      if (isEditing()) {
        Object.values(state.allRegisteredComponents).forEach(
          (registeredComponent) => {
            const message = createRegisterComponentMessage(registeredComponent);
            window.parent?.postMessage(message, "*");
          }
        );
        window.addEventListener("message", state.processMessage);
        window.addEventListener(
          "builder:component:stateChangeListenerActivated",
          state.emitStateUpdate
        );
      }

      if (state.useContent) {
        track("impression", {
          contentId: state.useContent.id,
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
                state.overrideContent = content;
              }
            });
          }
        }
      }

      state.evaluateJsCode();
      state.runHttpRequests();
      state.emitStateUpdate();
    }
  });

  return (
    <Dynamic
      value={{
        get content() {
          return state.useContent;
        },
        get state() {
          return state.contentState;
        },
        get context() {
          return state.context;
        },
        get apiKey() {
          return props.apiKey;
        },
        get registeredComponents() {
          return state.allRegisteredComponents;
        },
      }}
      component={BuilderContext.Provider}
    >
      <Show when={state.useContent}>
        <div
          onClick={(event) =>
            track("click", {
              contentId: state.useContent.id,
            })
          }
          data-builder-content-id={state.useContent?.id}
        >
          <Show
            when={
              (state.useContent?.data?.cssCode ||
                state.useContent?.data?.customFonts?.length) &&
              TARGET !== "reactNative"
            }
          >
            <RenderContentStyles
              cssCode={state.useContent.data.cssCode}
              customFonts={state.useContent.data.customFonts}
            ></RenderContentStyles>
          </Show>
          <RenderBlocks blocks={state.useContent?.data?.blocks}></RenderBlocks>
        </div>
      </Show>
    </Dynamic>
  );
}

export default RenderContent;
