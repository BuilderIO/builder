'use client';
import * as React from "react";

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
  const _context = { ...props["_context"] };

  const state = {
    canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
    forceReRenderCount: 0,
    mergeNewContent(newContent: BuilderContent) {
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
    },
    processMessage(event: MessageEvent) {
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
              state.mergeNewContent({
                meta: {
                  breakpoints,
                },
              });
            }
            state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
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
              state.mergeNewContent(contentData);
              state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
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
    },
    httpReqsData: {},
    clicked: false,
    onClick(event: any) {
      if (props.builderContextSignal.content) {
        const variationId = props.builderContextSignal.content?.testVariationId;
        const contentId = props.builderContextSignal.content?.id;
        _track({
          type: "click",
          canTrack: state.canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
          ...getInteractionPropertiesForEvent(event),
          unique: !state.clicked,
        });
      }
      if (!state.clicked) {
        state.clicked = true;
      }
    },
    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: props.context || {},
          localState: undefined,
          rootState: props.builderContextSignal.rootState,
          rootSetState: props.builderContextSignal.rootSetState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const newState = {
            ...props.builderContextSignal.rootState,
            [key]: json,
          };
          props.builderContextSignal.rootSetState?.(newState);
          state.httpReqsData[key] = true;
        })
        .catch((err) => {
          console.error("error fetching dynamic data", url, err);
        });
    },
    runHttpRequests() {
      const requests: {
        [key: string]: string;
      } = props.builderContextSignal.content?.data?.httpRequests ?? {};
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
    },
  };

  return (
    <>
      {props.builderContextSignal.content ? (
        <>
          <div
            key={state.forceReRenderCount}
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
    </>
  );
}

export default EnableEditor;
