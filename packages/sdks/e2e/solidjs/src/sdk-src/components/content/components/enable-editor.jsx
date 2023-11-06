import { Show, onMount, on, createEffect, createSignal } from "solid-js";

import { evaluate } from "../../../functions/evaluate/index.js";
import { fetch } from "../../../functions/get-fetch.js";
import { isBrowser } from "../../../functions/is-browser.js";
import { isEditing } from "../../../functions/is-editing.js";
import { createRegisterComponentMessage } from "../../../functions/register-component.js";
import { _track } from "../../../functions/track/index.js";
import builderContext from "../../../context/builder.context.js";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../../scripts/init-editing.js";
import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction.js";
import { fetchOneEntry } from "../../../functions/get-content/index.js";
import { isPreviewing } from "../../../functions/is-previewing.js";
import { postPreviewContent } from "../../../helpers/preview-lru-cache/set.js";
import { fastClone } from "../../../functions/fast-clone.js";
import { logger } from "../../../helpers/logger.js";
import { getDefaultCanTrack } from "../../../helpers/canTrack.js";

function EnableEditor(props) {
  const [forceReRenderCount, setForceReRenderCount] = createSignal(0);

  const [lastUpdated, setLastUpdated] = createSignal(0);

  const [shouldSendResetCookie, setShouldSendResetCookie] = createSignal(false);

  const [httpReqsData, setHttpReqsData] = createSignal({});

  const [clicked, setClicked] = createSignal(false);

  function mergeNewContent(newContent) {
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

  function processMessage(event) {
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

          setForceReRenderCount(forceReRenderCount() + 1); // This is a hack to force Qwik to re-render.

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
            setForceReRenderCount(forceReRenderCount() + 1); // This is a hack to force Qwik to re-render.
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

  function onClick(event) {
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
        unique: !clicked(),
      });
    }

    if (!clicked()) {
      setClicked(true);
    }
  }

  function evalExpression(expression) {
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

  function handleRequest({ url, key }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...props.builderContextSignal.rootState,
          [key]: json,
        };
        props.builderContextSignal.rootSetState?.(newState);
        httpReqsData()[key] = true;
      })
      .catch((err) => {
        console.error("error fetching dynamic data", url, err);
      });
  }

  function runHttpRequests() {
    const requests =
      props.builderContextSignal.content?.data?.httpRequests ?? {};
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
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent("builder:component:stateChange", {
          detail: {
            state: fastClone(props.builderContextSignal.rootState),
            ref: {
              name: props.model,
            },
          },
        })
      );
    }
  }

  function elementRef_onIniteditingbldr(event) {
    console.log("init editing bldr");
    setForceReRenderCount(forceReRenderCount() + 1);
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
    Object.values(props.builderContextSignal.componentInfos).forEach(
      (registeredComponent) => {
        const message = createRegisterComponentMessage(registeredComponent);
        window.parent?.postMessage(message, "*");
      }
    );
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
     * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
     *  at the same time, e.g. header/page/footer.
     * - the API key is the same, since we don't want to preview content from other organizations.
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

  let elementRef;

  onMount(() => {
    logger.log("on mount", elementRef);

    if (isBrowser()) {
      logger.log("is browser", elementRef);

      if (isEditing() && elementRef) {
        logger.log("is editing", elementRef);
        elementRef.dispatchEvent(new CustomEvent("initeditingbldr"));
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
          apiKey: apiKeyProp,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      } // override normal content in preview mode

      if (isPreviewing() && elementRef) {
        elementRef.dispatchEvent(new CustomEvent("initpreviewingbldr"));
      }
    }
  });
  onMount(() => {
    if (!props.apiKey) {
      logger.error(
        "No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop."
      );
    }

    evaluateJsCode();
    runHttpRequests();
    emitStateUpdate();
  });

  function onUpdateFn_0() {
    if (props.content) {
      mergeNewContent(props.content);
    }
  }
  createEffect(on(() => [props.content], onUpdateFn_0));

  function onUpdateFn_1() {}
  createEffect(on(() => [shouldSendResetCookie()], onUpdateFn_1));

  function onUpdateFn_2() {
    evaluateJsCode();
  }
  createEffect(
    on(
      () => [
        props.builderContextSignal.content?.data?.jsCode,
        props.builderContextSignal.rootState,
      ],
      onUpdateFn_2
    )
  );

  function onUpdateFn_3() {
    runHttpRequests();
  }
  createEffect(
    on(
      () => [props.builderContextSignal.content?.data?.httpRequests],
      onUpdateFn_3
    )
  );

  function onUpdateFn_4() {
    emitStateUpdate();
  }
  createEffect(on(() => [props.builderContextSignal.rootState], onUpdateFn_4));

  return (
    <builderContext.Provider value={props.builderContextSignal}>
      <Show when={props.builderContextSignal.content}>
        <div
          class={props.classNameProp}
          {...{}}
          key={forceReRenderCount()}
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
          onIniteditingbldr={(event) => elementRef_onIniteditingbldr(event)}
          onInitpreviewingbldr={(event) =>
            elementRef_onInitpreviewingbldr(event)
          }
        >
          {props.children}
        </div>
      </Show>
    </builderContext.Provider>
  );
}

export default EnableEditor;
