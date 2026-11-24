<!--
  `<Content>`: renders a content entry, and its A/B test variations when it has them (all variations
  server-rendered, the winner shown by an inline script before hydration; the losers are dropped
  after mount).
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import {
    SDKS_SUPPORTING_PERSONALIZATION,
    getInitPersonalizationVariantsFnsScriptString,
    hasPersonalizationContainer,
  } from '../../blocks/personalization-container/helpers.js';
  import { TARGET } from '../../constants/target.js';
  import BuilderScriptsContext from '../../context/builder-scripts.context.js';
  import { handleABTestingSync } from '../../helpers/ab-tests.js';
  import { getDefaultCanTrack } from '../../helpers/canTrack.js';
  import { scriptTag, styleTag } from '../../helpers/inline-tags.js';
  import ContentComponent from '../content/content.svelte';
  import type { BuilderContent } from '../../types/builder-content.js';
  import type { ContentVariantsPrps } from './content-variants.types.js';
  import {
    checkShouldRenderVariants,
    getInitVariantsFnsScriptString,
    getUpdateCookieAndStylesScript,
    getVariants,
  } from './helpers.js';

  let props: ContentVariantsPrps & {
    isNestedRender?: boolean;
    isContentInlinedInParent?: boolean;
  } = $props();

  const scriptsContext = getContext<{ scriptsEmitted: boolean } | undefined>(
    BuilderScriptsContext.key
  );

  // svelte-ignore state_referenced_locally
  let shouldRenderVariants = $state(
    checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );
  // Derived only from props, so server and client agree during hydration.
  // svelte-ignore state_referenced_locally
  const shouldEmitPersonalizationFns =
    !props.isContentInlinedInParent && hasPersonalizationContainer(props.content);

  // The winning variation is already visible; drop the others from the DOM.
  onMount(() => {
    shouldRenderVariants = false;
  });

  const variants = $derived(getVariants(props.content));
  const hideVariantsStyles = $derived(
    variants.map((value) => `.variant-${value.testVariationId} { display: none; } `).join('')
  );
  const defaultContent = $derived(
    shouldRenderVariants
      ? { ...props.content, testVariationId: props.content?.id }
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        })
  );
  const nonce = $derived(props.nonce || '');

  const headTags = $derived.by(() => {
    let html = '';
    if (
      shouldEmitPersonalizationFns &&
      !scriptsContext?.scriptsEmitted &&
      SDKS_SUPPORTING_PERSONALIZATION.includes(TARGET)
    ) {
      html += scriptTag(
        'builderio-init-personalization-variants-fns',
        getInitPersonalizationVariantsFnsScriptString(),
        nonce
      );
    }
    if (shouldRenderVariants) {
      if (!scriptsContext?.scriptsEmitted) {
        html += scriptTag('builderio-init-variants-fns', getInitVariantsFnsScriptString(), nonce);
      }
      html += styleTag('builderio-variants', hideVariantsStyles, nonce);
      html += scriptTag(
        'builderio-variants-visibility',
        getUpdateCookieAndStylesScript(
          variants.map((value) => ({ id: value.testVariationId!, testRatio: value.testRatio })),
          props.content?.id || ''
        ),
        nonce
      );
    }
    return html;
  });

  // Everything but the content itself is the same for every variation.
  const shared = $derived.by(() => {
    const { content: _content, ...rest } = props;
    return rest;
  });
</script>

{@html headTags}
{#if shouldRenderVariants}
  {#each variants as variant (variant.testVariationId)}
    <ContentComponent
      {...shared}
      content={variant as BuilderContent}
      showContent={false}
      isSsrAbTest={shouldRenderVariants}
    />
  {/each}
{/if}
<ContentComponent
  {...shared}
  content={defaultContent as BuilderContent}
  showContent
  isSsrAbTest={shouldRenderVariants}
/>
