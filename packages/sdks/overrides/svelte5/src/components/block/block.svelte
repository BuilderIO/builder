<!--
  One Builder block.

  The Svelte 4 SDK renders each block through ~9 components (Block → StyleWrapper → BlockStyles →
  InlinedStyles, BlockWrapper → DynamicRenderer → ComponentRef → InteractiveElement → the
  component), each with its own reactive statements and store subscription. Here it is one
  component: every per-block value is a `$derived`, and the markup branches are snippets.

  Reactivity is fine-grained: a block without bindings reads no state, so a state change never
  re-renders it; a bound block re-runs only when the state its bindings read changes.
-->
<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import Text from '../../blocks/text/text.svelte';
  import { TARGET } from '../../constants/target.js';
  import BuilderContext from '../../context/builder.context.js';
  import {
    deriveContext,
    type ReactiveBuilderContext,
  } from '../../context/reactive-context.svelte.js';
  import type { RegisteredComponents } from '../../context/types.js';
  import { getBlockActions } from '../../functions/get-block-actions.js';
  import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
  import { getBlockProperties } from '../../functions/get-block-properties.js';
  import { getProcessedBlock } from '../../functions/get-processed-block.js';
  import { isEditing } from '../../functions/is-editing.js';
  import { keyBlocks, styleTag } from '../../helpers/inline-tags.js';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import { isEmptyElement } from '../dynamic-renderer/dynamic-renderer.helpers.js';
  import Awaiter from '../awaiter.svelte';
  import { bindAnimations } from './animator.js';
  import { getBlockCss, isBlockVisible } from './block-css.js';
  import {
    getComponent,
    getRepeatItemData,
    hasTextComponent,
    provideBuilderBlock,
    provideBuilderContext,
    provideLinkComponent,
    provideRegisteredComponents,
  } from './block.helpers.js';
  import Self from './block.svelte';

  type Props = {
    block: BuilderBlock;
    context: ReactiveBuilderContext;
    registeredComponents: RegisteredComponents;
    linkComponent?: any;
    /** A repeat item: provides its own context (with the item's local state) to its subtree. */
    isRepeatItem?: boolean;
  };

  let {
    block,
    context: contextProp,
    registeredComponents,
    linkComponent,
    isRepeatItem = false,
  }: Props = $props();

  // A repeat item's context reads through to the latest one handed down, so components below it
  // (and `<Blocks>` inside them) see the item's local state even as the collection changes.
  // svelte-ignore state_referenced_locally
  const context: ReactiveBuilderContext = isRepeatItem
    ? deriveContext(
        () => contextProp,
        () => ({ localState: contextProp.localState })
      )
    : contextProp;
  // svelte-ignore state_referenced_locally
  if (isRepeatItem) setContext(BuilderContext.key, context);

  const repeatItems = $derived(
    block.repeat?.collection
      ? getRepeatItemData({ block, context })
      : undefined
  );

  const processed = $derived(
    block.repeat?.collection
      ? block
      : getProcessedBlock({
          block,
          localState: context.localState,
          rootState: context.rootState,
          rootSetState: context.rootSetState,
          context: context.context,
        })
  );

  const registered = $derived(
    getComponent({
      block: processed,
      registeredComponents,
      model: context.model,
    })
  );

  // (`show` bound to an expression that yields `undefined` hides the block, as in every SDK)
  const visible = $derived(
    block.repeat?.collection
      ? !!repeatItems?.length
      : ('show' in processed ? !!processed.show : true) &&
          !('hide' in processed ? processed.hide : false)
  );

  const Tag = $derived.by(() => {
    if (block.tagName === 'a' || processed.properties?.href || processed.href) {
      return linkComponent || 'a';
    }
    // Text renders a div, which would make a `<p>` wrapper auto-close before hydration.
    if (
      block.tagName === 'p' &&
      registeredComponents.Text?.component === Text &&
      hasTextComponent(processed)
    ) {
      return 'div';
    }
    return block.tagName || 'div';
  });

  const css = $derived(
    TARGET !== 'reactNative' && visible && isBlockVisible(processed)
      ? getBlockCss(processed, context.content)
      : ''
  );

  // The wrapper's attributes and its actions, with Svelte 5 event attributes (`onclick`).
  const attributes: Record<string, any> = $derived({
    ...getBlockProperties({ block: processed, context }),
    ...getBlockActions({
      block: processed,
      rootState: context.rootState,
      rootSetState: context.rootSetState,
      localState: context.localState,
      context: context.context,
      stripPrefix: true,
      trackingContext: {
        apiKey: context.apiKey,
        canTrack: context.canTrack ?? true,
        contentId: context.content?.id,
        variationId: context.content?.testVariationId,
      },
    }),
  });

  const componentProps = $derived.by(() => {
    if (!registered?.component) return undefined;
    return {
      ...getBlockComponentOptions(processed, context),
      ...provideBuilderBlock(registered, processed),
      ...provideBuilderContext(registered, context),
      ...provideLinkComponent(registered, linkComponent),
      ...provideRegisteredComponents(registered, registeredComponents, context.model),
      // `noWrap` components get the block's attributes (and actions) to put on their own root.
      attributes: registered.noWrap ? attributes : {},
    };
  });

  const children = $derived(keyBlocks(processed.children));

  onMount(() => {
    const animations = processed.animations;
    if (animations && processed.id) {
      bindAnimations(
        animations.map((animation) => ({ ...animation, elementId: processed.id! }))
      );
    }
  });

  function onComponentError(error: unknown) {
    console.error('[Builder.io]: Error rendering component', registered?.name, error);
  }
</script>

{#snippet childBlocks()}
  {#each children as child (child.key)}
    <Self block={child.block} {context} {registeredComponents} {linkComponent} />
  {/each}
{/snippet}

{#snippet renderComponent()}
  {@const Comp = registered!.component as any}
  {#if Comp.load}
    <Awaiter load={Comp.load} fallback={Comp.fallback} props={componentProps}>
      {@render childBlocks()}
    </Awaiter>
  {:else}
    <Comp {...componentProps}>{@render childBlocks()}</Comp>
  {/if}
{/snippet}

{#snippet component()}
  {#if componentProps}
    {#if isEditing()}
      <!-- In the editor, a component that throws empties only its own block. -->
      <svelte:boundary onerror={onComponentError}>
        {@render renderComponent()}
      </svelte:boundary>
    {:else}
      {@render renderComponent()}
    {/if}
  {/if}
{/snippet}

{#snippet inner()}
  {@render component()}
  {#if !componentProps}{@render childBlocks()}{/if}
{/snippet}

{#if visible}
  {@html styleTag('builderio-block', css, context.nonce)}
  {#if repeatItems}
    {#each repeatItems as item, index (index)}
      <Self
        block={item.block}
        context={item.context as ReactiveBuilderContext}
        {registeredComponents}
        {linkComponent}
        isRepeatItem
      />
    {/each}
  {:else if registered?.noWrap}
    {@render component()}
  {:else if typeof Tag !== 'string'}
    <Tag {...attributes}>{@render inner()}</Tag>
  {:else if isEmptyElement(Tag)}
    <svelte:element this={Tag} {...attributes} />
  {:else}
    <svelte:element this={Tag} {...attributes}>{@render inner()}</svelte:element>
  {/if}
{/if}
