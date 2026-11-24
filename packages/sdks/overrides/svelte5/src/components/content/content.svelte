<!--
  One Builder content entry (the other SDKs' Content + EnableEditor + ContentStyles in one
  component). Owns the reactive Builder context, runs the content's jsCode and HTTP requests, tracks
  impressions and clicks, and connects to the visual editor or preview when it runs inside Builder.
-->
<script lang="ts">
  import { onMount, setContext, untrack } from 'svelte';
  import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
  import BuilderContext from '../../context/builder.context.js';
  import ComponentsContext from '../../context/components.context.js';
  import { createBuilderContext } from '../../context/reactive-context.svelte.js';
  import { evaluate } from '../../functions/evaluate/index.js';
  import { isBrowser } from '../../functions/is-browser.js';
  import { isEditing } from '../../functions/is-editing.js';
  import { isPreviewing } from '../../functions/is-previewing.js';
  import { logFetch } from '../../functions/log-fetch.js';
  import { _track } from '../../functions/track/index.js';
  import { getInteractionPropertiesForEvent } from '../../functions/track/interaction.js';
  import { getDefaultCanTrack } from '../../helpers/canTrack.js';
  import { getCookieSync } from '../../helpers/cookie.js';
  import { scriptTag, styleTag } from '../../helpers/inline-tags.js';
  import { logger } from '../../helpers/logger.js';
  import type { BuilderContent } from '../../types/builder-content.js';
  import type { Dictionary } from '../../types/typescript.js';
  import Blocks from '../blocks/blocks.svelte';
  import { getUpdateVariantVisibilityScript } from '../content-variants/helpers.js';
  import { needsElementRefDivForEditing } from './components/enable-editor.helpers.js';
  import {
    getCss,
    getDefaultStyles,
    getFontCss,
    getWrapperClassName,
  } from './components/styles.helpers.js';
  import {
    getComponentInfos,
    getContentInitialValue,
    getLiveRootState,
    getRegisteredComponents,
    getRootStateInitialValue,
  } from './content.helpers.js';
  import type { ContentProps } from './content.types.js';
  import type { Bridge } from './editor-bridge.js';

  let props: Partial<ContentProps> & { isNestedRender?: boolean } = $props();

  // ---- the reactive context ------------------------------------------------------------------
  // svelte-ignore state_referenced_locally
  const registrations = [...getDefaultRegisteredComponents(), ...(props.customComponents || [])];
  const registeredComponents = getRegisteredComponents(registrations, (component) => component);

  // svelte-ignore state_referenced_locally
  const ctx = createBuilderContext({
    content: getContentInitialValue({ content: props.content, data: props.data }),
    rootState: getRootStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    context: props.context || {},
    canTrack: props.canTrack,
    apiKey: props.apiKey ?? null,
    apiVersion: props.apiVersion,
    // Only the editor reads these: serialize them on first read.
    get componentInfos() {
      return getComponentInfos(registrations);
    },
    inheritedStyles: {},
    BlocksWrapper: props.blocksWrapper || 'div',
    BlocksWrapperProps: props.blocksWrapperProps || {},
    nonce: props.nonce || '',
    model: props.model || '',
  });

  setContext(BuilderContext.key, ctx);
  setContext(ComponentsContext.key, { registeredComponents });

  function mergeNewRootState(newData: Dictionary<any>) {
    ctx.rootSetState?.({ ...ctx.rootState, ...newData });
  }

  function mergeNewContent(newContent: Partial<BuilderContent>) {
    ctx.content = {
      ...ctx.content,
      ...newContent,
      data: { ...ctx.content?.data, ...newContent?.data },
      meta: {
        ...ctx.content?.meta,
        ...newContent?.meta,
        breakpoints: newContent?.meta?.breakpoints || ctx.content?.meta?.breakpoints,
      },
    };
  }

  // ---- content jsCode ------------------------------------------------------------------------
  // svelte-ignore state_referenced_locally
  if (!props.apiKey) {
    logger.error(
      'No API key provided to `Content` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
    );
  }

  const jsCode = ctx.content?.data?.jsCode;
  if (jsCode) {
    // Functions jsCode defines outlive the root state object they were defined against (the
    // editor replaces it): read and write whatever the current one is.
    const liveRootState = getLiveRootState(() => ctx.rootState);
    evaluate({
      code: jsCode,
      context: ctx.context,
      localState: undefined,
      rootState: liveRootState,
      rootSetState: (next) => {
        // Writes already landed in the live state; only a replacement needs setting.
        if (next !== liveRootState) ctx.rootSetState?.(next);
      },
      isExpression: false,
    });
  }

  // ---- prop changes after mount (`content`, `data`, `locale`) --------------------------------
  // svelte-ignore state_referenced_locally
  let prev = { content: props.content, data: props.data, locale: props.locale };
  $effect.pre(() => {
    const { content, data, locale } = props;
    untrack(() => {
      if (content && content !== prev.content) mergeNewContent(content);
      if (data && data !== prev.data) mergeNewRootState(data);
      if (locale && locale !== prev.locale) mergeNewRootState({ locale });
      prev = { content, data, locale };
    });
  });

  // ---- content HTTP requests -----------------------------------------------------------------
  const httpReqsData: Record<string, boolean> = {};
  const httpReqsPending: Record<string, boolean> = {};

  function runHttpRequests() {
    const requests: Record<string, any> = ctx.content?.data?.httpRequests ?? {};
    for (const [key, httpRequest] of Object.entries(requests)) {
      if (!httpRequest || httpReqsPending[key]) continue;
      if (httpReqsData[key] && !isEditing()) continue;

      const isCoreRequest =
        typeof httpRequest === 'object' && httpRequest['@type'] === '@builder.io/core:Request';
      const url: string = isCoreRequest ? httpRequest.request.url : httpRequest;
      httpReqsPending[key] = true;

      const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group: string) =>
        String(
          evaluate({
            code: group,
            context: ctx.context,
            localState: undefined,
            rootState: ctx.rootState,
            rootSetState: ctx.rootSetState,
          })
        )
      );
      const request = isCoreRequest
        ? {
            url: evaluatedUrl,
            method: httpRequest.request.method,
            headers: httpRequest.request.headers,
            body: httpRequest.request.body,
          }
        : { url: evaluatedUrl, method: 'GET' };
      logFetch(JSON.stringify(request));

      fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' ? undefined : request.body,
      })
        .then((response) => response.json())
        .then((json) => {
          mergeNewRootState({ [key]: json });
          httpReqsData[key] = true;
        })
        .catch((err) => console.error('error fetching dynamic data', JSON.stringify(httpRequest), err))
        .finally(() => {
          httpReqsPending[key] = false;
        });
    }
  }

  // ---- tracking --------------------------------------------------------------------------------
  let clicked = false;
  function onclick(event: MouseEvent) {
    if (ctx.content) {
      const variationId = ctx.content.testVariationId;
      const contentId = ctx.content.id;
      _track({
        apiHost: props.apiHost,
        type: 'click',
        canTrack: getDefaultCanTrack(props.canTrack),
        contentId,
        apiKey: props.apiKey!,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !clicked,
      });
    }
    clicked = true;
  }

  onMount(() => {
    runHttpRequests();

    const winningVariantId = getCookieSync({
      name: `builder.tests.${ctx.content?.id}`,
      canTrack: true,
    });
    const variationId = ctx.content?.testVariationId;
    if (ctx.content && getDefaultCanTrack(props.canTrack) && variationId === winningVariantId) {
      const contentId = ctx.content.id;
      _track({
        apiHost: props.apiHost,
        type: 'impression',
        canTrack: true,
        contentId,
        apiKey: props.apiKey!,
        variationId: winningVariantId !== contentId ? winningVariantId : undefined,
      });
    }

    // ---- inside Builder: the editor bridge, loaded only here --------------------------------
    const editing = isEditing() && !props.isNestedRender;
    const previewing = isPreviewing() && !isEditing();
    if (!editing && !previewing) return;

    let stop: (() => void) | undefined;
    let destroyed = false;
    import('./editor-bridge.js').then((editor) => {
      if (destroyed) return;
      const bridge: Bridge = {
        getProps: () => props,
        context: ctx,
        mergeNewContent,
        mergeNewRootState,
      };
      if (editing) {
        stop = editor.startEditing(bridge);
        editor.emitStateUpdate(ctx, props.model);
        // The editor's state panel follows root state (deeply).
        stop = (
          (stopEditing, stopEffect) => () => (stopEditing(), stopEffect())
        )(
          stop,
          $effect.root(() => {
            $effect(() => {
              $state.snapshot(ctx.rootState);
              untrack(() => editor.emitStateUpdate(ctx, props.model));
            });
          })
        );
      } else {
        editor.startPreviewing(bridge);
      }
    });
    return () => {
      destroyed = true;
      stop?.();
    };
  });

  // ---- markup --------------------------------------------------------------------------------
  // svelte-ignore state_referenced_locally
  const ContentWrapper = props.contentWrapper || 'div';
  const showContentProps = $derived(
    props.showContent ? {} : { hidden: true, 'aria-hidden': true }
  );
  const variantScript = $derived(
    props.isSsrAbTest
      ? scriptTag(
          'builderio-variant-visibility',
          getUpdateVariantVisibilityScript({
            variationId: props.content?.testVariationId || '',
            contentId: props.content?.id || '',
          }),
          props.nonce
        )
      : ''
  );
  const contentStyles = $derived(
    styleTag(
      'builderio-content',
      `
${getCss({ cssCode: ctx.content?.data?.cssCode, contentId: ctx.content?.id })}
${getFontCss({ customFonts: ctx.content?.data?.customFonts })}
${getDefaultStyles(props.isNestedRender)}
`.trim(),
      props.nonce
    )
  );
  // The A/B script hides the losing variations' wrappers before hydration, outside Svelte's view.
  // Once the winner is rendered here (after mount, `isSsrAbTest` turns false), show this wrapper.
  function syncVisibility(node: Element) {
    if (props.isSsrAbTest || !props.showContent) return;
    node.removeAttribute('hidden');
    node.removeAttribute('aria-hidden');
  }

  const wrapperAttrs = $derived({
    'builder-content-id': ctx.content?.id,
    'builder-model': props.model,
    class: getWrapperClassName(props.content?.testVariationId || props.content?.id),
    style: !ctx.content && needsElementRefDivForEditing() ? 'display: none;' : undefined,
    ...showContentProps,
    ...props.contentWrapperProps,
  });
</script>

{#snippet body()}
  {@html variantScript}
  {@html contentStyles}
  <Blocks
    blocks={ctx.content?.data?.blocks}
    context={ctx}
    {registeredComponents}
    linkComponent={props.linkComponent}
  />
{/snippet}

{#if ctx.content || needsElementRefDivForEditing()}
  {#if typeof ContentWrapper === 'string'}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <svelte:element this={ContentWrapper} {onclick} {...wrapperAttrs} {@attach syncVisibility}>{@render body()}</svelte:element>
  {:else}
    <ContentWrapper {onclick} {...wrapperAttrs}>{@render body()}</ContentWrapper>
  {/if}
{/if}
