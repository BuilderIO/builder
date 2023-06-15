<script lang="ts">
  import { getContext, onDestroy, onMount, setContext } from 'svelte';

  import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
  import type {
    BuilderRenderState,
    RegisteredComponent,
    RegisteredComponents,
  } from '../../context/types.js';
  import { evaluate } from '../../functions/evaluate.js';
  import { getContent } from '../../functions/get-content/index.js';
  import { fetch } from '../../functions/get-fetch.js';
  import { isBrowser } from '../../functions/is-browser.js';
  import { isEditing } from '../../functions/is-editing.js';
  import { isPreviewing } from '../../functions/is-previewing.js';
  import {
    components,
    createRegisterComponentMessage,
  } from '../../functions/register-component.js';
  import { _track } from '../../functions/track/index.js';
  import type {
    Breakpoints,
    BuilderContent,
  } from '../../types/builder-content.js';
  import type { Nullable } from '../../types/typescript.js';
  import RenderBlocks from '../render-blocks.svelte';
  import RenderContentStyles from './components/render-styles.svelte';
  import builderContext, {
    type BuilderStore,
  } from '../../context/builder.context.js';
  import {
    registerInsertMenu,
    setupBrowserForEditing,
  } from '../../scripts/init-editing.js';
  import { checkIsDefined } from '../../helpers/nullable.js';
  import { getInteractionPropertiesForEvent } from '../../functions/track/interaction.js';
  import type {
    RenderContentProps,
    BuilderComponentStateChange,
  } from './render-content.types.js';
  import {
    getContentInitialValue,
    getContextStateInitialValue,
  } from './render-content.helpers.js';
  import { TARGET } from '../../constants/target.js';
  import { logger } from '../../helpers/logger.js';
  import { getRenderContentScriptString } from '../render-content-variants/helpers.js';
  import { wrapComponentRef } from './wrap-component-ref.js';
  import { writable } from 'svelte/store';

  const isEvent = (attr) => attr.startsWith('on:');
  const isNonEvent = (attr) => !attr.startsWith('on:');
  const filterAttrs = (attrs = {}, filter) => {
    const validAttr = {};
    Object.keys(attrs).forEach((attr) => {
      if (filter(attr)) {
        validAttr[attr] = attrs[attr];
      }
    });
    return validAttr;
  };
  const setAttrs = (node, attrs = {}) => {
    const attrKeys = Object.keys(attrs);
    const setup = (attr) => node.addEventListener(attr.substr(3), attrs[attr]);
    const teardown = (attr) =>
      node.removeEventListener(attr.substr(3), attrs[attr]);
    attrKeys.map(setup);
    return {
      update(attrs = {}) {
        const attrKeys = Object.keys(attrs);
        attrKeys.map(teardown);
        attrKeys.map(setup);
      },
      destroy() {
        attrKeys.map(teardown);
      },
    };
  };

  export let content: RenderContentProps['content'];
  export let data: RenderContentProps['data'];
  export let canTrack: RenderContentProps['canTrack'];
  export let locale: RenderContentProps['locale'];
  export let customComponents: RenderContentProps['customComponents'];
  export let model: RenderContentProps['model'];
  export let context: RenderContentProps['context'];
  export let apiKey: RenderContentProps['apiKey'];
  export let parentContentId: RenderContentProps['parentContentId'];
  export let hideContent: RenderContentProps['hideContent'];
  export let classNameProp: RenderContentProps['classNameProp'];
  export let isSsrAbTest: RenderContentProps['isSsrAbTest'];
  export let includeRefs: RenderContentProps['includeRefs'];
  export let enrich: RenderContentProps['enrich'];
  export let apiVersion: RenderContentProps['apiVersion'];

  function mergeNewContent(newContent: BuilderContent) {
    useContent = {
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
    };
  }
  function setBreakpoints(breakpoints: Breakpoints) {
    useContent = {
      ...useContent,
      meta: {
        ...useContent?.meta,
        breakpoints,
      },
    };
  }
  function contentSetState(newRootState: BuilderRenderState) {
    $builderStore.rootState = newRootState;
  }
  function processMessage(event: MessageEvent) {
    const { data } = event;
    if (data) {
      switch (data.type) {
        case 'builder.configureSdk': {
          const messageContent = data.data;
          const { breakpoints, contentId } = messageContent;
          if (!contentId || contentId !== useContent?.id) {
            return;
          }
          if (breakpoints) {
            setBreakpoints(breakpoints);
          }
          forceReRenderCount = forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
          break;
        }
        case 'builder.contentUpdate': {
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
        case 'builder.patchUpdates': {
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
        context: context || {},
        localState: undefined,
        rootState: $builderStore.rootState,
        rootSetState: contentSetState,
      });
    }
  }
  function onClick(event: any) {
    if (useContent) {
      const variationId = useContent?.testVariationId;
      const contentId = useContent?.id;
      _track({
        type: 'click',
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
        rootState: $builderStore.rootState,
        rootSetState: contentSetState,
      })
    );
  }
  function handleRequest({ url, key }: { key: string; url: string }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...$builderStore.rootState,
          [key]: json,
        };
        contentSetState(newState);
      })
      .catch((err) => {
        console.error('error fetching dynamic data', url, err);
      });
  }
  function runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = useContent?.data?.httpRequests ?? {};
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
          'builder:component:stateChange',
          {
            detail: {
              state: $builderStore.rootState,
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

  let forceReRenderCount = 0;
  let overrideContent = null;
  let useContent = getContentInitialValue({
    content: content,
    data: data,
  });
  let update = 0;
  let canTrackToUse = checkIsDefined(canTrack) ? canTrack : true;
  let allRegisteredComponents = [
    ...getDefaultRegisteredComponents(),
    // While this `components` object is deprecated, we must maintain support for it.
    // Since users are able to override our default components, we need to make sure that we do not break such
    // existing usage.
    // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
    // which is the new standard way of providing custom components, and must therefore take precedence.
    ...components,
    ...(customComponents || []),
  ].reduce(
    (acc, { component, ...curr }) => ({
      ...acc,
      [curr.name]: {
        component: TARGET === 'vue3' ? wrapComponentRef(component) : component,
        ...curr,
      },
    }),
    {} as RegisteredComponents
  );
  let httpReqsData = {};
  let clicked = false;
  let scriptStr = getRenderContentScriptString({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    contentId: content?.id!,
    parentContentId: parentContentId!,
  });

  onMount(() => {
    if (!apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        forceReRenderCount = forceReRenderCount + 1;
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
        Object.values<RegisteredComponent>(allRegisteredComponents).forEach(
          (registeredComponent) => {
            const message = createRegisterComponentMessage(registeredComponent);
            window.parent?.postMessage(message, '*');
          }
        );
        window.addEventListener('message', processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        );
      }
      if (useContent) {
        const variationId = useContent?.testVariationId;
        const contentId = useContent?.id;
        _track({
          type: 'impression',
          canTrack: canTrackToUse,
          contentId,
          apiKey: apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      // override normal content in preview mode
      if (isPreviewing()) {
        const searchParams = new URL(location.href).searchParams;
        const searchParamPreviewModel = searchParams.get('builder.preview');
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        );
        const previewApiKey =
          searchParams.get('apiKey') || searchParams.get('builder.space');

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
          getContent({
            model: model,
            apiKey: apiKey,
            apiVersion: apiVersion,
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
  function onUpdateFn_1(..._args: any[]) {
    evaluateJsCode();
  }
  $: onUpdateFn_1(...[useContent?.data?.jsCode, $builderStore.rootState]);
  function onUpdateFn_2(..._args: any[]) {
    runHttpRequests();
  }
  $: onUpdateFn_2(...[useContent?.data?.httpRequests]);
  function onUpdateFn_3(..._args: any[]) {
    emitStateUpdate();
  }
  $: onUpdateFn_3(...[$builderStore.rootState]);

  const builderStore = writable({
    get content() {
      return useContent;
    },
    get localState() {
      return undefined;
    },
    rootState: getContextStateInitialValue({
      content: content,
      data: data,
      locale: locale,
    }),
    get rootSetState() {
      return TARGET === 'qwik' ? undefined : contentSetState;
    },
    get context() {
      return context || {};
    },
    get apiKey() {
      return apiKey;
    },
    get apiVersion() {
      return apiVersion;
    },
    get registeredComponents() {
      return allRegisteredComponents;
    },
    get inheritedStyles() {
      return {};
    },
  });
  setContext(builderContext.key, builderStore);

  onDestroy(() => {
    if (isBrowser()) {
      window.removeEventListener('message', processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        emitStateUpdate
      );
    }
  });
</script>

{#if useContent}
  <div
    bind:this={elementRef}
    on:click={(event) => {
      onClick(event);
    }}
    data-builder-content-id={useContent?.id}
    data-builder-model={model}
    {...filterAttrs(
      TARGET === 'reactNative'
        ? {
            dataSet: {
              // currently, we can't set the actual ID here.
              // we don't need it right now, we just need to identify content divs for testing.
              'builder-content-id': '',
            },
          }
        : {},
      isNonEvent
    )}
    {...hideContent
      ? {
          hidden: true,
          'aria-hidden': true,
        }
      : {}}
    class={classNameProp}
    use:setAttrs={filterAttrs(
      TARGET === 'reactNative'
        ? {
            dataSet: {
              // currently, we can't set the actual ID here.
              // we don't need it right now, we just need to identify content divs for testing.
              'builder-content-id': '',
            },
          }
        : {},
      isEvent
    )}
  >
    {#if isSsrAbTest}
      <svelte:element this={'script'}>{@html scriptStr}</svelte:element>
    {/if}

    {#if TARGET !== 'reactNative'}
      <RenderContentStyles
        contentId={useContent?.id}
        cssCode={useContent?.data?.cssCode}
        customFonts={useContent?.data?.customFonts}
      />
    {/if}
    <RenderBlocks blocks={useContent?.data?.blocks} />
  </div>
{/if}
