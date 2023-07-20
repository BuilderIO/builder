'use client';
import * as React from "react";
import { useState, useContext, useRef, useEffect } from "react";

type BuilderEditorProps = Omit<
  ContentProps,
  "customComponents" | "data" | "apiVersion" | "isSsrAbTest"
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};
import type { BuilderContextInterface } from "../../../context/types";
import { evaluate } from "../../../functions/evaluate";
import { fetch } from "../../../functions/get-fetch";
import { isBrowser } from "../../../functions/is-browser";
import { isEditing } from "../../../functions/is-editing";
import { createRegisterComponentMessage } from "../../../functions/register-component";
import { _track } from "../../../functions/track/index";
import builderContext from "../../../context/builder.context.js";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../../scripts/init-editing";
import { checkIsDefined } from "../../../helpers/nullable";
import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction";
import type {
  ContentProps,
  BuilderComponentStateChange,
} from "../content.types";
import { TARGET } from "../../../constants/target";
import { logger } from "../../../helpers/logger";
import type { ComponentInfo } from "../../../types/components";
import { getContent } from "../../../functions/get-content/index";
import { isPreviewing } from "../../../functions/is-previewing";
import type { BuilderContent } from "../../../types/builder-content";

function EnableEditor(props: BuilderEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [canTrackToUse, setCanTrackToUse] = useState(() =>
    checkIsDefined(props.canTrack) ? props.canTrack : true
  );

  const [forceReRenderCount, setForceReRenderCount] = useState(() => 0);

  function mergeNewContent(newContent: BuilderContent) {
    props.builderContextSignal.content = {
      ...props.builderContextSignal.content,
      ...newContent,
      data: {
        ...props.builderContextSignal.content?.data,
        ...newContent?.data,
      },
      meta: {
        ...props.builderContextSignal.content?.meta,
        ...newContent?.meta,
        breakpoints:
          newContent?.meta?.breakpoints ||
          props.builderContextSignal.content?.meta?.breakpoints,
      },
    };
  }

  function processMessage(event: MessageEvent) {
    const { data } = event;

    if (data) {
      switch (data.type) {
        case "builder.configureSdk": {
          const messageContent = data.data;
          const { breakpoints, contentId } = messageContent;

          if (
            !contentId ||
            contentId !== props.builderContextSignal.content?.id
          ) {
            return;
          }

          if (breakpoints) {
            mergeNewContent({
              meta: {
                breakpoints,
              },
            });
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
    const jsCode = props.builderContextSignal.content?.data?.jsCode;

    if (jsCode) {
      evaluate({
        code: jsCode,
        context: props.context || {},
        localState: undefined,
        rootState: props.builderContextSignal.rootState,
        rootSetState: props.builderContextSignal.rootSetState,
      });
    }
  }

  const [httpReqsData, setHttpReqsData] = useState(() => ({}));

  const [clicked, setClicked] = useState(() => false);

  function onClick(event: any) {
    if (props.builderContextSignal.content) {
      const variationId = props.builderContextSignal.content?.testVariationId;
      const contentId = props.builderContextSignal.content?.id;

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

  function evalExpression(expression: string) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: props.context || {},
        localState: undefined,
        rootState: props.builderContextSignal.rootState,
        rootSetState: props.builderContextSignal.rootSetState,
      })
    );
  }

  function handleRequest({ url, key }: { key: string; url: string }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...props.builderContextSignal.rootState,
          [key]: json,
        };
        props.builderContextSignal.rootSetState?.(newState);
        httpReqsData[key] = true;
      })
      .catch((err) => {
        console.error("error fetching dynamic data", url, err);
      });
  }

  function runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = props.builderContextSignal.content?.data?.httpRequests ?? {};
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
        new CustomEvent<BuilderComponentStateChange>(
          "builder:component:stateChange",
          {
            detail: {
              state: props.builderContextSignal.rootState,
              ref: {
                name: props.model,
              },
            },
          }
        )
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
        window.addEventListener("message", processMessage);
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
          ...(props.enrich
            ? {
                enrich: props.enrich,
              }
            : {}),
        });
        Object.values<ComponentInfo>(
          props.builderContextSignal.componentInfos
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, "*");
        });
        window.addEventListener(
          "builder:component:stateChangeListenerActivated",
          emitStateUpdate
        );
      }

      if (props.builderContextSignal.content) {
        const variationId = props.builderContextSignal.content?.testVariationId;
        const contentId = props.builderContextSignal.content?.id;

        _track({
          type: "impression",
          canTrack: canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      } // override normal content in preview mode

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
            apiVersion: props.builderContextSignal.apiVersion,
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
  }, [
    props.builderContextSignal.content?.data?.jsCode,
    props.builderContextSignal.rootState,
  ]);
  useEffect(() => {
    runHttpRequests();
  }, [props.builderContextSignal.content?.data?.httpRequests]);
  useEffect(() => {
    emitStateUpdate();
  }, [props.builderContextSignal.rootState]);

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
    <builderContext.Provider value={props.builderContextSignal}>
      {props.builderContextSignal.content ? (
        <>
          <div
            key={forceReRenderCount}
            ref={elementRef}
            onClick={(event) => onClick(event)}
            builder-content-id={props.builderContextSignal.content?.id}
            builder-model={props.model}
            {...(TARGET === "reactNative"
              ? {
                  dataSet: {
                    // currently, we can't set the actual ID here. // we don't need it right now, we just need to identify content divs for testing.
                    "builder-content-id": "",
                  },
                }
              : {})}
            {...(props.showContent
              ? {}
              : {
                  hidden: true,
                  "aria-hidden": true,
                })}
            className={props.classNameProp}
          >
            {props.children}
          </div>
        </>
      ) : null}
    </builderContext.Provider>
  );
}

export default EnableEditor;
