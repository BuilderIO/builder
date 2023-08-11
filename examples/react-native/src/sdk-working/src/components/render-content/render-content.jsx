import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useContext, useRef, useEffect } from "react";
import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";
import { evaluate } from "../../functions/evaluate.js";
import { getContent } from "../../functions/get-content/index.js";
import { fetch } from "../../functions/get-fetch.js";
import { isBrowser } from "../../functions/is-browser.js";
import { isEditing } from "../../functions/is-editing.js";
import { isPreviewing } from "../../functions/is-previewing.js";
import {
  components,
  createRegisterComponentMessage,
} from "../../functions/register-component.js";
import { _track } from "../../functions/track/index.js";
import RenderBlocks from "../render-blocks";
import RenderContentStyles from "./components/render-styles";
import builderContext from "../../context/builder.context.js";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../scripts/init-editing.js";
import { checkIsDefined } from "../../helpers/nullable.js";
import { getInteractionPropertiesForEvent } from "../../functions/track/interaction.js";
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from "./render-content.helpers.js";
import { TARGET } from "../../constants/target.js";
import { logger } from "../../helpers/logger.js";

function RenderContent(props) {
  const elementRef = useRef(null);
  const [forceReRenderCount, setForceReRenderCount] = useState(() => 0);

  const [overrideContent, setOverrideContent] = useState(() => null);

  const [useContent, setUseContent] = useState(() =>
    getContentInitialValue({
      content: props.content,
      data: props.data,
    })
  );

  function mergeNewContent(newContent) {
    setUseContent({
      ...useContent,
      ...newContent,
      data: {
        ...useContent?.data,
        ...newContent?.data,
      },
      meta: {
        ...useContent?.meta,
        ...newContent?.meta,
        breakpoints:
          newContent?.meta?.breakpoints || useContent?.meta?.breakpoints,
      },
    });
  }

  function setBreakpoints(breakpoints) {
    setUseContent({
      ...useContent,
      meta: {
        ...useContent?.meta,
        breakpoints,
      },
    });
  }

  const [update, setUpdate] = useState(() => 0);

  const [canTrackToUse, setCanTrackToUse] = useState(() =>
    checkIsDefined(props.canTrack) ? props.canTrack : true
  );

  const [contentState, setContentState] = useState(() =>
    getContextStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    })
  );

  function contentSetState(newRootState) {
    setContentState(newRootState);
  }

  const [allRegisteredComponents, setAllRegisteredComponents] = useState(() =>
    [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: curr,
      }),
      {}
    )
  );

  function processMessage(event) {
    const { data } = event;
    if (data) {
      switch (data.type) {
        case "builder.configureSdk": {
          const messageContent = data.data;
          const { breakpoints, contentId } = messageContent;
          if (!contentId || contentId !== useContent?.id) {
            return;
          }
          if (breakpoints) {
            setBreakpoints(breakpoints);
          }
          setForceReRenderCount(forceReRenderCount + 1); // This is a hack to force Qwik to re-render.
          break;
        }
        case "builder.contentUpdate": {
          const messageContent = data.data;
          const key =
            messageContent.key ||
            messageContent.alias ||
            messageContent.entry ||
            messageContent.modelName;
          const contentData = messageContent.data;
          if (key === props.model) {
            mergeNewContent(contentData);
            setForceReRenderCount(forceReRenderCount + 1); // This is a hack to force Qwik to re-render.
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
    const jsCode = useContent?.data?.jsCode;
    if (jsCode) {
      evaluate({
        code: jsCode,
        context: props.context || {},
        localState: undefined,
        rootState: contentState,
        rootSetState: contentSetState,
      });
    }
  }

  const [httpReqsData, setHttpReqsData] = useState(() => ({}));

  const [clicked, setClicked] = useState(() => false);

  function onClick(event) {
    if (useContent) {
      const variationId = useContent?.testVariationId;
      const contentId = useContent?.id;
      _track({
        type: "click",
        canTrack: canTrackToUse,
        contentId,
        apiKey: props.apiKey,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !clicked,
      });
    }
    if (!clicked) {
      setClicked(true);
    }
  }

  function evalExpression(expression) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: props.context || {},
        localState: undefined,
        rootState: contentState,
        rootSetState: contentSetState,
      })
    );
  }

  function handleRequest({ url, key }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...contentState,
          [key]: json,
        };
        contentSetState(newState);
      })
      .catch((err) => {
        console.error("error fetching dynamic data", url, err);
      });
  }

  function runHttpRequests() {
    const requests = useContent?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (url && (!httpReqsData[key] || isEditing())) {
        const evaluatedUrl = evalExpression(url);
        handleRequest({
          url: evaluatedUrl,
          key,
        });
      }
    });
  }

  function emitStateUpdate() {
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent("builder:component:stateChange", {
          detail: {
            state: contentState,
            ref: {
              name: props.model,
            },
          },
        })
      );
    }
  }

  useEffect(() => {
    if (!props.apiKey) {
      logger.error(
        "No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop."
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        setForceReRenderCount(forceReRenderCount + 1);
        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale
            ? {
                locale: props.locale,
              }
            : {}),
          ...(props.includeRefs
            ? {
                includeRefs: props.includeRefs,
              }
            : {}),
        });
        Object.values(allRegisteredComponents).forEach(
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
      if (useContent) {
        const variationId = useContent?.testVariationId;
        const contentId = useContent?.id;
        _track({
          type: "impression",
          canTrack: canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      // override normal content in preview mode
      if (isPreviewing()) {
        const searchParams = new URL(location.href).searchParams;
        const searchParamPreviewModel = searchParams.get("builder.preview");
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        );
        const previewApiKey =
          searchParams.get("apiKey") || searchParams.get("builder.space");

        /**
         * Make sure that:
         * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered  *  at the same time, e.g. header/page/footer.  * - the API key is the same, since we don't want to preview content from other organizations.
         * - if there is content, that the preview ID is the same as that of the one we receive.
         *
         * TO-DO: should we only update the state when there is a change?
         **/
        if (
          searchParamPreviewModel === props.model &&
          previewApiKey === props.apiKey &&
          (!props.content || searchParamPreviewId === props.content.id)
        ) {
          getContent({
            model: props.model,
            apiKey: props.apiKey,
            apiVersion: props.apiVersion,
          }).then((content) => {
            if (content) {
              mergeNewContent(content);
            }
          });
        }
      }
      evaluateJsCode();
      runHttpRequests();
      emitStateUpdate();
    }
  }, []);

  useEffect(() => {
    if (props.content) {
      mergeNewContent(props.content);
    }
  }, [props.content]);
  useEffect(() => {
    evaluateJsCode();
  }, [useContent?.data?.jsCode, contentState]);
  useEffect(() => {
    runHttpRequests();
  }, [useContent?.data?.httpRequests]);
  useEffect(() => {
    emitStateUpdate();
  }, [contentState]);

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
    <builderContext.Provider
      value={{
        content: useContent,
        localState: undefined,
        rootState: contentState,
        rootSetState: TARGET === "qwik" ? undefined : contentSetState,
        context: props.context || {},
        apiKey: props.apiKey,
        apiVersion: props.apiVersion,
        registeredComponents: allRegisteredComponents,
        inheritedStyles: {},
      }}
    >
      {useContent ? (
        <>
          <ScrollView
            ref={elementRef}
            onClick={(event) => onClick(event)}
            builder-content-id={useContent?.id}
            builder-model={props.model}
          >
            {TARGET !== "reactNative" ? (
              <>
                <RenderContentStyles
                  contentId={useContent?.id}
                  cssCode={useContent?.data?.cssCode}
                  customFonts={useContent?.data?.customFonts}
                />
              </>
            ) : null}

            <RenderBlocks
              blocks={useContent?.data?.blocks}
              key={forceReRenderCount}
            />
          </ScrollView>
        </>
      ) : null}
    </builderContext.Provider>
  );
}

export default RenderContent;
