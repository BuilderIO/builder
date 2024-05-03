"use client";
import * as React from "react";
import { useState, useContext, useRef, useEffect } from "react";

type BuilderEditorProps = Omit<
  ContentProps,
  | "customComponents"
  | "apiVersion"
  | "isSsrAbTest"
  | "blocksWrapper"
  | "blocksWrapperProps"
  | "isNestedRender"
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};
import builderContext from "../../../context/builder.context.js";
import type { BuilderContextInterface } from "../../../context/types.js";
import { evaluate } from "../../../functions/evaluate/index.js";
import { fastClone } from "../../../functions/fast-clone.js";
import { fetchOneEntry } from "../../../functions/get-content/index.js";
import { fetch } from "../../../functions/get-fetch.js";
import { isBrowser } from "../../../functions/is-browser.js";
import { isEditing } from "../../../functions/is-editing.js";
import { isPreviewing } from "../../../functions/is-previewing.js";
import { createRegisterComponentMessage } from "../../../functions/register-component.js";
import { _track } from "../../../functions/track/index.js";
import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction.js";
import { getDefaultCanTrack } from "../../../helpers/canTrack.js";
import { logger } from "../../../helpers/logger.js";
import { postPreviewContent } from "../../../helpers/preview-lru-cache/set.js";
import { createEditorListener } from "../../../helpers/subscribe-to-editor.js";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../../scripts/init-editing.js";
import type { BuilderContent } from "../../../types/builder-content.js";
import type { ComponentInfo } from "../../../types/components.js";
import type { Dictionary } from "../../../types/typescript.js";
import { triggerAnimation } from "../../block/animator.js";
import type {
  BuilderComponentStateChange,
  ContentProps,
} from "../content.types.js";
import { getWrapperClassName } from "./styles.helpers.js";
import DynamicDiv from "../../dynamic-div";

function EnableEditor(props: BuilderEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  function mergeNewRootState(newData: Dictionary<any>) {
    const combinedState = {
      ...props.builderContextSignal.rootState,
      ...newData,
    };
    if (props.builderContextSignal.rootSetState) {
      props.builderContextSignal.rootSetState?.(combinedState);
    } else {
      props.setBuilderContextSignal((PREVIOUS_VALUE) => ({
        ...PREVIOUS_VALUE,
        rootState: combinedState,
      }));
    }
  }

  function mergeNewContent(newContent: BuilderContent) {
    const newContentValue = {
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
    props.setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      content: newContentValue,
    }));
  }

  function showContentProps() {
    return props.showContent
      ? {}
      : {
          hidden: true,
          "aria-hidden": true,
        };
  }

  const [ContentWrapper, setContentWrapper] = useState(
    () => props.contentWrapper || "div"
  );

  function processMessage(event: MessageEvent) {
    return createEditorListener({
      model: props.model,
      trustedHosts: props.trustedHosts,
      callbacks: {
        configureSdk: (messageContent) => {
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
        },
        animation: (animation) => {
          triggerAnimation(animation);
        },
        contentUpdate: (newContent) => {
          mergeNewContent(newContent);
        },
      },
    })(event);
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
        /**
         * We don't want to cache the result of the JS code, since it's arbitrary side effect code.
         */
        enableCache: false,
      });
    }
  }

  const [httpReqsData, setHttpReqsData] = useState(() => ({}));

  const [httpReqsPending, setHttpReqsPending] = useState(() => ({}));

  const [clicked, setClicked] = useState(() => false);

  function onClick(event: any) {
    if (props.builderContextSignal.content) {
      const variationId = props.builderContextSignal.content?.testVariationId;
      const contentId = props.builderContextSignal.content?.id;
      _track({
        type: "click",
        canTrack: getDefaultCanTrack(props.canTrack),
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

  function runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = props.builderContextSignal.content?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (!url) return;

      // request already in progress
      if (httpReqsPending[key]) return;

      // request already completed, and not in edit mode
      if (httpReqsData[key] && !isEditing()) return;
      httpReqsPending[key] = true;
      const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group) =>
        String(
          evaluate({
            code: group,
            context: props.context || {},
            localState: undefined,
            rootState: props.builderContextSignal.rootState,
            rootSetState: props.builderContextSignal.rootSetState,
            enableCache: true,
          })
        )
      );
      fetch(evaluatedUrl)
        .then((response) => response.json())
        .then((json) => {
          mergeNewRootState({
            [key]: json,
          });
          httpReqsData[key] = true;
        })
        .catch((err) => {
          console.error("error fetching dynamic data", url, err);
        })
        .finally(() => {
          httpReqsPending[key] = false;
        });
    });
  }

  function emitStateUpdate() {
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          "builder:component:stateChange",
          {
            detail: {
              state: fastClone(props.builderContextSignal.rootState),
              ref: {
                name: props.model,
              },
            },
          }
        )
      );
    }
  }

  function elementRef_onIniteditingbldr(event) {
    window.addEventListener("message", processMessage);
    registerInsertMenu();
    setupBrowserForEditing({
      ...(props.locale
        ? {
            locale: props.locale,
          }
        : {}),
      ...(props.enrich
        ? {
            enrich: props.enrich,
          }
        : {}),
      ...(props.trustedHosts
        ? {
            trustedHosts: props.trustedHosts,
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

  function elementRef_onInitpreviewingbldr(event) {
    const searchParams = new URL(location.href).searchParams;
    const searchParamPreviewModel = searchParams.get("builder.preview");
    const searchParamPreviewId = searchParams.get(
      `builder.preview.${searchParamPreviewModel}`
    );
    const previewApiKey =
      searchParams.get("apiKey") || searchParams.get("builder.space");

    /**
     * Make sure that:
     * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered *  at the same time, e.g. header/page/footer. * - the API key is the same, since we don't want to preview content from other organizations.
     * - if there is content, that the preview ID is the same as that of the one we receive.
     *
     * TO-DO: should we only update the state when there is a change?
     **/
    if (
      searchParamPreviewModel === props.model &&
      previewApiKey === props.apiKey &&
      (!props.content || searchParamPreviewId === props.content.id)
    ) {
      fetchOneEntry({
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

  useEffect(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener("message", processMessage);
        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale
            ? {
                locale: props.locale,
              }
            : {}),
          ...(props.enrich
            ? {
                enrich: props.enrich,
              }
            : {}),
          ...(props.trustedHosts
            ? {
                trustedHosts: props.trustedHosts,
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
      const shouldTrackImpression =
        props.builderContextSignal.content &&
        getDefaultCanTrack(props.canTrack);
      if (shouldTrackImpression) {
        const variationId = props.builderContextSignal.content?.testVariationId;
        const contentId = props.builderContextSignal.content?.id;
        const apiKeyProp = props.apiKey;
        _track({
          type: "impression",
          canTrack: true,
          contentId,
          apiKey: apiKeyProp!,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      /**
       * Override normal content in preview mode.
       * We ignore this when editing, since the edited content is already being sent from the editor via post messages.
       */
      if (isPreviewing() && !isEditing()) {
        const searchParams = new URL(location.href).searchParams;
        const searchParamPreviewModel = searchParams.get("builder.preview");
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        );
        const previewApiKey =
          searchParams.get("apiKey") || searchParams.get("builder.space");

        /**
         * Make sure that:
         * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered   *  at the same time, e.g. header/page/footer.   * - the API key is the same, since we don't want to preview content from other organizations.
         * - if there is content, that the preview ID is the same as that of the one we receive.
         *
         * TO-DO: should we only update the state when there is a change?
         **/
        if (
          searchParamPreviewModel === props.model &&
          previewApiKey === props.apiKey &&
          (!props.content || searchParamPreviewId === props.content.id)
        ) {
          fetchOneEntry({
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
    }
  }, []);
  useEffect(() => {
    if (!props.apiKey) {
      logger.error(
        "No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop."
      );
    }
    evaluateJsCode();
    runHttpRequests();
    emitStateUpdate();
  }, []);

  useEffect(() => {
    if (props.content) {
      mergeNewContent(props.content);
    }
  }, [props.content]);
  useEffect(() => {
    evaluateJsCode();
  }, [props.builderContextSignal.content?.data?.jsCode]);
  useEffect(() => {
    runHttpRequests();
  }, [props.builderContextSignal.content?.data?.httpRequests]);
  useEffect(() => {
    emitStateUpdate();
  }, [props.builderContextSignal.rootState]);
  useEffect(() => {
    if (props.data) {
      mergeNewRootState(props.data);
    }
  }, [props.data]);
  useEffect(() => {
    if (props.locale) {
      mergeNewRootState({
        locale: props.locale,
      });
    }
  }, [props.locale]);

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
          <ContentWrapper
            {...{}}
            ref={elementRef}
            onClick={(event) => onClick(event)}
            builder-content-id={props.builderContextSignal.content?.id}
            builder-model={props.model}
            {...{}}
            {...showContentProps()}
            {...props.contentWrapperProps}
            className={getWrapperClassName(
              props.content?.testVariationId || props.content?.id
            )}
          >
            {props.children}
          </ContentWrapper>
        </>
      ) : null}
    </builderContext.Provider>
  );
}

export default EnableEditor;
