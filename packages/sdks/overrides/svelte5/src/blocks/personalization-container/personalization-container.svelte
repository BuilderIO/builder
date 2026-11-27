<!--
  Server-renders every variant (hidden) plus inline scripts that show the winner before hydration;
  on mount it resets to just the winning variant (the "reset approach" Svelte shares with Vue/Qwik).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import Blocks from '../../components/blocks/blocks.svelte';
  import { TARGET } from '../../constants/target.js';
  import { getClassPropName } from '../../functions/get-class-prop-name.js';
  import { isEditing } from '../../functions/is-editing.js';
  import { isPreviewing } from '../../functions/is-previewing.js';
  import { getDefaultCanTrack } from '../../helpers/canTrack.js';
  import { scriptTag, styleTag } from '../../helpers/inline-tags.js';
  import { userAttributesService } from '../../helpers/user-attributes.js';
  import {
    checkShouldRenderVariants,
    DEFAULT_INDEX,
    filterWithCustomTargeting,
    getBlocksToRender,
    getPersonalizationScript,
    getUpdateVisibilityStylesScript,
    isVariantForLocale,
    SDKS_REQUIRING_RESET_APPROACH,
  } from './helpers.js';
  import type { PersonalizationContainerProps } from './personalization-container.types.js';

  let {
    attributes,
    previewingIndex,
    variants,
    builderBlock,
    builderContext,
    builderComponents,
  }: PersonalizationContainerProps = $props();

  let rootRef = $state<HTMLDivElement>();
  let userAttributes = $state(userAttributesService.getUserAttributes());
  let shouldResetVariants = $state(false);
  // Initial value only, as in the source.
  // svelte-ignore state_referenced_locally
  const shouldRenderVariants = checkShouldRenderVariants(
    variants,
    getDefaultCanTrack(builderContext?.canTrack)
  );

  const locale = $derived(builderContext?.rootState?.locale as string | undefined);
  const scriptStr = $derived(
    getPersonalizationScript(variants, builderBlock?.id || 'none', locale)
  );
  const updateVisibilityStylesScript = $derived(
    getUpdateVisibilityStylesScript(variants, builderBlock?.id || 'none', locale)
  );
  const nonce = $derived(builderContext?.nonce || '');
  const isResetTarget = SDKS_REQUIRING_RESET_APPROACH.includes(TARGET);

  const attrs = $derived({
    ...attributes,
    [getClassPropName()!]: `builder-personalization-container ${
      attributes?.[getClassPropName()!] || ''
    }`,
  });

  const filteredVariants = $derived(
    (variants || []).filter((variant) =>
      filterWithCustomTargeting(
        {
          ...(builderContext?.rootState?.locale
            ? { locale: builderContext?.rootState?.locale }
            : {}),
          ...(userAttributes as any),
        },
        variant.query,
        variant.startDate,
        variant.endDate
      )
    )
  );

  const localeVariants = $derived(
    (variants || [])
      .map((variant, index) => ({ variant, index }))
      .filter((item) => isVariantForLocale(item.variant.query, locale))
  );

  const blocksToRender = $derived(
    getBlocksToRender({
      variants,
      fallbackBlocks: builderBlock?.children,
      isHydrated: shouldResetVariants,
      // Until mount, render what the server rendered (the default variant): picking the winner in
      // the browser during hydration would mismatch the server HTML. The inline scripts already
      // show the winner, and on mount the tree resets to it.
      filteredVariants: shouldResetVariants ? filteredVariants : [],
      previewingIndex,
    })
  );

  const hideVariantsStyleString = $derived(
    (variants || [])
      .map(
        (_, index) =>
          `div[data-variant-id="${builderBlock?.id}-${index}"] { display: none !important; } `
      )
      .join('')
  );

  onMount(() => {
    shouldResetVariants = true;

    const unsub = userAttributesService.subscribeOnUserAttributesChange(
      (next) => {
        userAttributes = next;
      },
      { fireImmediately: TARGET === 'qwik' }
    );

    if (!(isEditing() || isPreviewing())) {
      const variant = filteredVariants[0];

      if (rootRef) {
        rootRef.dispatchEvent(
          new CustomEvent('builder.variantLoaded', {
            detail: {
              variant: variant || DEFAULT_INDEX,
              content: builderContext?.content,
            },
            bubbles: true,
          })
        );

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && rootRef) {
              rootRef.dispatchEvent(
                new CustomEvent('builder.variantDisplayed', {
                  detail: {
                    variant: variant || DEFAULT_INDEX,
                    content: builderContext?.content,
                  },
                  bubbles: true,
                })
              );
            }
          });
        });

        observer.observe(rootRef);
      }
    }

    return () => unsub();
  });
</script>

<div bind:this={rootRef} {...attrs}>
  {#if shouldResetVariants && isResetTarget}
    <Blocks
      blocks={blocksToRender.blocks}
      parent={builderBlock?.id}
      path={blocksToRender.path}
      context={builderContext}
      registeredComponents={builderComponents}
      BlocksWrapperProps={{
        ...builderContext?.BlocksWrapperProps,
        'data-variant-id': `${builderBlock?.id}-${blocksToRender.index}`,
      }}
    />
  {/if}
  {#if (!shouldResetVariants && isResetTarget) || !isResetTarget}
    {#if shouldRenderVariants}
      {@html styleTag(`variants-styles-${builderBlock?.id}`, hideVariantsStyleString, nonce)}
      {@html scriptTag(
        `variants-visibility-script-${builderBlock?.id}`,
        updateVisibilityStylesScript,
        nonce
      )}
      {#each localeVariants as item (`${builderBlock?.id}-${item.index}`)}
        <Blocks
          BlocksWrapperProps={{
            ...builderContext?.BlocksWrapperProps,
            'aria-hidden': true,
            hidden: true,
            'data-variant-id': `${builderBlock?.id}-${item.index}`,
          }}
          blocks={item.variant.blocks}
          parent={builderBlock?.id}
          path={`component.options.variants.${item.index}.blocks`}
          context={builderContext}
          registeredComponents={builderComponents}
        >
          {@html scriptTag(`variants-script-${builderBlock?.id}-${item.index}`, scriptStr, nonce)}
        </Blocks>
      {/each}
    {/if}
    <Blocks
      blocks={blocksToRender.blocks}
      parent={builderBlock?.id}
      path={blocksToRender.path}
      context={builderContext}
      registeredComponents={builderComponents}
      BlocksWrapperProps={{
        ...builderContext?.BlocksWrapperProps,
        'data-variant-id': `${builderBlock?.id}-${blocksToRender.index}`,
      }}
    >
      {#if shouldRenderVariants}
        {@html scriptTag(`variants-script-${builderBlock?.id}-${DEFAULT_INDEX}`, scriptStr, nonce)}
      {/if}
    </Blocks>
  {/if}
</div>
