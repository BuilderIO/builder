"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";

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
import builderContext from "../../../context/builder.context";
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
import { logger } from "../../../helpers/logger";
import type { ComponentInfo } from "../../../types/components";
import type { BuilderContent } from "../../../types/builder-content";
import { useRouter } from "next/navigation";

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

  const [lastUpdated, setLastUpdated] = useState(() => 0);

  const [shouldSendResetCookie, setShouldSendResetCookie] = useState(
    () => false
  );

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
        case "builder.hardReset": {
          const lastUpdatedAutosave = parseInt(data.data.lastUpdatedAutosave);
          console.log("HARD RESET", {
            lastUpdatedAutosave,
          });
          const lastUpdatedToUse =
            !isNaN(lastUpdatedAutosave) && lastUpdatedAutosave > lastUpdated
              ? lastUpdatedAutosave
              : lastUpdated;
          setLastUpdated(lastUpdatedToUse);
          console.log("HARD RESET", {
            shouldSendResetCookie,
          });
          if (shouldSendResetCookie) {
            console.log("HARD RESET: refreshing.");
            document.cookie = `builder.hardReset=${lastUpdatedToUse};max-age=100`;
            setShouldSendResetCookie(false);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router.refresh();
          } else {
            console.log("HARD RESET: not refreshing.");
          }
          break;
        }
        case "builder.patchUpdates": {
          const patches = data.data.data;
          for (const contentId of Object.keys(patches)) {
            const patchesForBlock = patches[contentId];

            // TO-DO: fix scenario where we end up with -Infinity
            const getLastIndex = () =>
              Math.max(
                ...document.cookie
                  .split(";")
                  .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                  .map((x) => {
                    const parsedIndex = parseInt(
                      x.split("=")[0].split(contentIdKeyPrefix)[1]
                    );
                    return isNaN(parsedIndex) ? 0 : parsedIndex;
                  })
              ) || 0;
            const contentIdKeyPrefix = `builder.patch.${contentId}.`;

            // get last index of patch for this block
            const lastIndex = getLastIndex();
            const cookie = {
              name: `${contentIdKeyPrefix}${lastIndex + 1}`,
              value: encodeURIComponent(JSON.stringify(patchesForBlock)),
            };

            // remove hard reset cookie just in case it was set in a prior update.
            document.cookie = `builder.hardReset=no;max-age=0`;
            document.cookie = `${cookie.name}=${cookie.value};max-age=30`;
            const newCookieValue = document.cookie
              .split(";")
              .find((x) => x.trim().startsWith(cookie.name))
              ?.split("=")[1];
            if (newCookieValue !== cookie.value) {
              console.warn("Cookie did not save correctly.");
              console.log("Clearing all Builder patch cookies...");
              window.parent?.postMessage(
                {
                  type: "builder.patchUpdatesFailed",
                  data: data.data,
                },
                "*"
              );
              document.cookie
                .split(";")
                .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                .forEach((x) => {
                  document.cookie = `${x.split("=")[0]}=;max-age=0`;
                });
              setShouldSendResetCookie(true);
            } else {
              console.log("cookie saved correctly");

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              router.refresh();
            }
          }
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

  const router = useRouter();

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
      }
      evaluateJsCode();
      runHttpRequests();
      emitStateUpdate();
    }
  }, []);

  useEffect(() => {
    if (!props.content) return;
    const lastUpdatedAutosave = props.content.meta?.lastUpdatedAutosave;
    const hardResetCookie = document.cookie
      .split(";")
      .find((x) => x.trim().startsWith("builder.hardReset"));
    const hardResetCookieValue = hardResetCookie?.split("=")[1];
    if (!hardResetCookieValue) return;
    if (
      lastUpdatedAutosave &&
      parseInt(hardResetCookieValue) <= lastUpdatedAutosave
    ) {
      console.log("got fresh content! 🎉");
      document.cookie = `builder.hardReset=;max-age=0`;
      window.parent?.postMessage(
        {
          type: "builder.freshContentFetched",
          data: {
            contentId: props.content.id,
            lastUpdated: lastUpdatedAutosave,
          },
        },
        "*"
      );
    } else {
      console.log(
        "hard reset cookie is newer than lastUpdatedAutosave, refreshing"
      );
      document.cookie = `builder.hardReset=${hardResetCookieValue};max-age=100`;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      router.refresh();
    }
  }, [props.content]);
  useEffect(() => {
    if (isBrowser()) {
      window.removeEventListener("message", processMessage);
      window.addEventListener("message", processMessage);
    }
  }, [shouldSendResetCookie]);
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
            {...{}}
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
