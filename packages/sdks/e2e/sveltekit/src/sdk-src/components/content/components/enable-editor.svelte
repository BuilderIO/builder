<script context="module" lang="ts">
  type BuilderEditorProps = Omit<
    ContentProps,
    "customComponents" | "data" | "apiVersion" | "isSsrAbTest"
  > & {
    builderContextSignal: Writable<BuilderContextInterface>;
    setBuilderContextSignal?: (signal: any) => any;
    children?: any;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";

  import type { BuilderContextInterface } from "../../../context/types.js";
  import { evaluate } from "../../../functions/evaluate";
  import { fetch } from "../../../functions/get-fetch.js";
  import { isBrowser } from "../../../functions/is-browser.js";
  import { isEditing } from "../../../functions/is-editing.js";
  import { createRegisterComponentMessage } from "../../../functions/register-component.js";
  import { _track } from "../../../functions/track/index.js";
  import builderContext from "../../../context/builder.context";
  import {
    registerInsertMenu,
    setupBrowserForEditing,
  } from "../../../scripts/init-editing.js";
  import { checkIsDefined } from "../../../helpers/nullable.js";
  import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction.js";
  import type {
    ContentProps,
    BuilderComponentStateChange,
  } from "../content.types.js";
  import { logger } from "../../../helpers/logger.js";
  import type { ComponentInfo } from "../../../types/components.js";
  import { fetchOneEntry } from "../../../functions/get-content/index.js";
  import { isPreviewing } from "../../../functions/is-previewing.js";
  import type { BuilderContent } from "../../../types/builder-content.js";
  import { postPreviewContent } from "../../../helpers/preview-lru-cache/set.js";
  import type { Writable } from "svelte/store";

  export let canTrack: BuilderEditorProps["canTrack"];
  export let builderContextSignal: BuilderEditorProps["builderContextSignal"];
  export let model: BuilderEditorProps["model"];
  export let context: BuilderEditorProps["context"];
  export let apiKey: BuilderEditorProps["apiKey"];
  export let showContent: BuilderEditorProps["showContent"];
  export let classNameProp: BuilderEditorProps["classNameProp"];

  export let content: BuilderEditorProps["content"];
  export let locale: BuilderEditorProps["locale"];
  export let includeRefs: BuilderEditorProps["includeRefs"];
  export let enrich: BuilderEditorProps["enrich"];

  function mergeNewContent(newContent: BuilderContent) {
    const newContentValue = {
      ...$builderContextSignal.content,
      ...newContent,
      data: {
        ...$builderContextSignal.content?.data,
        ...newContent?.data,
      },
      meta: {
        ...$builderContextSignal.content?.meta,
        ...newContent?.meta,
        breakpoints:
          newContent?.meta?.breakpoints ||
          $builderContextSignal.content?.meta?.breakpoints,
      },
    };
    $builderContextSignal.content = newContentValue;
  }
  function processMessage(event: MessageEvent) {
    const { data } = event;
    if (data) {
      switch (data.type) {
        case "builder.configureSdk": {
          const messageContent = data.data;
          const { breakpoints, contentId } = messageContent;
          if (!contentId || contentId !== $builderContextSignal.content?.id) {
            return;
          }
          if (breakpoints) {
            mergeNewContent({
              meta: {
                breakpoints,
              },
            });
          }
          forceReRenderCount = forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
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
          if (key === model) {
            mergeNewContent(contentData);
            forceReRenderCount = forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
          }

          break;
        }
      }
    }
  }
  function evaluateJsCode() {
    // run any dynamic JS code attached to content
    const jsCode = $builderContextSignal.content?.data?.jsCode;
    if (jsCode) {
      evaluate({
        code: jsCode,
        context: context || {},
        localState: undefined,
        rootState: $builderContextSignal.rootState,
        rootSetState: $builderContextSignal.rootSetState,
      });
    }
  }
  function onClick(event: any) {
    if ($builderContextSignal.content) {
      const variationId = $builderContextSignal.content?.testVariationId;
      const contentId = $builderContextSignal.content?.id;
      _track({
        type: "click",
        canTrack: canTrackToUse,
        contentId,
        apiKey: apiKey,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !clicked,
      });
    }
    if (!clicked) {
      clicked = true;
    }
  }
  function evalExpression(expression: string) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: context || {},
        localState: undefined,
        rootState: $builderContextSignal.rootState,
        rootSetState: $builderContextSignal.rootSetState,
      })
    );
  }
  function handleRequest({ url, key }: { key: string; url: string }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...$builderContextSignal.rootState,
          [key]: json,
        };
        $builderContextSignal.rootSetState?.(newState);
        httpReqsData[key] = true;
      })
      .catch((err) => {
        console.error("error fetching dynamic data", url, err);
      });
  }
  function runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = $builderContextSignal.content?.data?.httpRequests ?? {};
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
              state: $builderContextSignal.rootState,
              ref: {
                name: model,
              },
            },
          }
        )
      );
    }
  }

  let elementRef;

  let canTrackToUse = checkIsDefined(canTrack) ? canTrack : true;
  let forceReRenderCount = 0;
  let lastUpdated = 0;
  let shouldSendResetCookie = false;
  let httpReqsData = {};
  let clicked = false;

  onMount(() => {
    if (!apiKey) {
      logger.error(
        "No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop."
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        forceReRenderCount = forceReRenderCount + 1;
        window.addEventListener("message", processMessage);
        registerInsertMenu();
        setupBrowserForEditing({
          ...(locale
            ? {
                locale: locale,
              }
            : {}),
          ...(includeRefs
            ? {
                includeRefs: includeRefs,
              }
            : {}),
          ...(enrich
            ? {
                enrich: enrich,
              }
            : {}),
        });
        Object.values<ComponentInfo>(
          $builderContextSignal.componentInfos
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, "*");
        });
        window.addEventListener(
          "builder:component:stateChangeListenerActivated",
          emitStateUpdate
        );
      }
      if ($builderContextSignal.content) {
        const variationId = $builderContextSignal.content?.testVariationId;
        const contentId = $builderContextSignal.content?.id;
        _track({
          type: "impression",
          canTrack: canTrackToUse,
          contentId,
          apiKey: apiKey,
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
         * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
         *  at the same time, e.g. header/page/footer.
         * - the API key is the same, since we don't want to preview content from other organizations.
         * - if there is content, that the preview ID is the same as that of the one we receive.
         *
         * TO-DO: should we only update the state when there is a change?
         **/
        if (
          searchParamPreviewModel === model &&
          previewApiKey === apiKey &&
          (!content || searchParamPreviewId === content.id)
        ) {
          fetchOneEntry({
            model: model,
            apiKey: apiKey,
            apiVersion: $builderContextSignal.apiVersion,
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
  });

  function onUpdateFn_0(..._args: any[]) {
    if (content) {
      mergeNewContent(content);
    }
  }
  $: onUpdateFn_0(...[content]);
  function onUpdateFn_1(..._args: any[]) {}
  $: onUpdateFn_1(...[shouldSendResetCookie]);
  function onUpdateFn_2(..._args: any[]) {
    evaluateJsCode();
  }
  $: onUpdateFn_2(
    ...[
      $builderContextSignal.content?.data?.jsCode,
      $builderContextSignal.rootState,
    ]
  );
  function onUpdateFn_3(..._args: any[]) {
    runHttpRequests();
  }
  $: onUpdateFn_3(...[$builderContextSignal.content?.data?.httpRequests]);
  function onUpdateFn_4(..._args: any[]) {
    emitStateUpdate();
  }
  $: onUpdateFn_4(...[$builderContextSignal.rootState]);

  setContext(builderContext.key, builderContextSignal);

  onDestroy(() => {
    if (isBrowser()) {
      window.removeEventListener("message", processMessage);
      window.removeEventListener(
        "builder:component:stateChangeListenerActivated",
        emitStateUpdate
      );
    }
  });
</script>

{#if $builderContextSignal.content}
  <div
    key={forceReRenderCount}
    bind:this={elementRef}
    on:click={(event) => {
      onClick(event);
    }}
    builder-content-id={$builderContextSignal.content?.id}
    builder-model={model}
    {...{}}
    {...showContent
      ? {}
      : {
          hidden: true,
          "aria-hidden": true,
        }}
    class={classNameProp}
  >
    <slot />
  </div>
{/if}