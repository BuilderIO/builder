<script context="module" lang="ts">
  export type BlockProps = {
    block: BuilderBlock;
    context: Writable<BuilderContextInterface>;
    registeredComponents: RegisteredComponents;
    linkComponent: any;
  };
</script>

<!--
  Svelte override of `src/components/block/block.lite.tsx`.

  The generated Block renders every block through ~9 components (Block → StyleWrapper → BlockStyles →
  InlinedStyles, BlockWrapper → DynamicRenderer, ComponentRef → InteractiveElement → the component),
  each with its own props, `$context` subscription and reactive getters. This renders the same markup
  from ONE component: each value is a `$:` declaration that Svelte recomputes only when its inputs
  change, and the style tag, wrapper element and component are inlined.

  Keep in sync with: block.lite.tsx, style-wrapper / block-styles / block-wrapper /
  component-ref / interactive-element (.lite.tsx) and dynamic-renderer.lite.tsx.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  import Text from '../../blocks/text/index';
  import { setAttrs } from '../../blocks/helpers';
  import type {
    BuilderContextInterface,
    RegisteredComponents,
  } from '../../context/types';
  import { getBlockActions } from '../../functions/get-block-actions';
  import { getBlockComponentOptions } from '../../functions/get-block-component-options';
  import { getBlockProperties } from '../../functions/get-block-properties';
  import { getProcessedBlock } from '../../functions/get-processed-block';
  import type { BuilderBlock } from '../../types/builder-block';
  import Awaiter from '../awaiter.svelte';
  import { isEmptyElement } from '../dynamic-renderer/dynamic-renderer.helpers';
  import { bindAnimations } from './animator';
  import {
    generateKey,
    getComponent,
    getRepeatItemData,
    hasTextComponent,
    provideBuilderBlock,
    provideBuilderContext,
    provideLinkComponent,
    provideRegisteredComponents,
  } from './block.helpers';
  import {
    canShowBlockStyles,
    getBlockStylesCss,
    isInContentBlockStyles,
  } from './components/block-styles.helpers';
  import RepeatedBlock from './components/repeated-block.svelte';

  export let block: BlockProps['block'];
  export let context: BlockProps['context'];
  export let registeredComponents: BlockProps['registeredComponents'];
  export let linkComponent: BlockProps['linkComponent'];

  $: repeatItem = getRepeatItemData({ block, context: $context });

  $: processedBlock = block.repeat?.collection
    ? block
    : getProcessedBlock({
        block,
        localState: $context.localState,
        rootState: $context.rootState,
        rootSetState: $context.rootSetState,
        context: $context.context,
      });

  $: blockComponent = getComponent({
    block: processedBlock,
    registeredComponents,
    model: $context.model,
  });

  $: Tag =
    block.tagName === 'a' ||
    processedBlock.properties?.href ||
    processedBlock.href
      ? linkComponent || 'a'
      : // Text renders a div, which makes a paragraph wrapper auto-close before hydration.
      block.tagName === 'p' &&
        registeredComponents.Text?.component === Text &&
        hasTextComponent(processedBlock)
      ? 'div'
      : block.tagName || 'div';

  $: canShowBlock = block.repeat?.collection
    ? !!repeatItem?.length
    : ('show' in processedBlock ? processedBlock.show : true) &&
      !('hide' in processedBlock ? processedBlock.hide : false);

  // (BlockStyles + InlinedStyles) Static block styles are in the Content's stylesheet instead.
  $: css =
    canShowBlock &&
    canShowBlockStyles(processedBlock) &&
    !isInContentBlockStyles(
      block,
      $context.content,
      $context.rootState.locale as string | undefined
    )
      ? getBlockStylesCss(processedBlock, $context.content)
      : '';

  $: childrenWithoutParentComponent =
    !blockComponent?.component && !repeatItem
      ? processedBlock.children ?? []
      : [];

  $: trackingContext = {
    apiKey: $context.apiKey,
    canTrack: $context.canTrack ?? true,
    contentId: $context.content?.id,
    variationId: $context.content?.testVariationId,
  };

  // (BlockWrapper + DynamicRenderer)
  $: wrapperAttributes = getBlockProperties({
    block: processedBlock,
    context: $context,
  });
  $: wrapperActions = getBlockActions({
    block: processedBlock,
    rootState: $context.rootState,
    rootSetState: $context.rootSetState,
    localState: $context.localState,
    context: $context.context,
    stripPrefix: true,
    trackingContext,
  });

  // (ComponentRef + InteractiveElement: the component itself)
  $: componentRef = blockComponent?.component;
  $: componentOptions = componentRef
    ? {
        ...getBlockComponentOptions(processedBlock, $context),
        ...provideBuilderBlock(blockComponent, processedBlock),
        ...provideBuilderContext(blockComponent, context),
        ...provideLinkComponent(blockComponent, linkComponent),
        ...provideRegisteredComponents(
          blockComponent,
          registeredComponents,
          $context.model
        ),
      }
    : {};
  // `noWrap` components get the block's attributes and actions themselves.
  $: componentAttributes =
    componentRef && blockComponent?.noWrap === true
      ? {
          ...getBlockProperties({ block: processedBlock, context: $context }),
          ...getBlockActions({
            block: processedBlock,
            rootState: $context.rootState,
            rootSetState: $context.rootSetState,
            localState: $context.localState,
            context: $context.context,
            trackingContext,
          }),
        }
      : {};
  $: componentChildren = componentRef ? processedBlock.children ?? [] : [];

  onMount(() => {
    const blockId = processedBlock.id;
    const animations = processedBlock.animations;
    if (animations && blockId) {
      bindAnimations(
        animations.map((animation) => ({
          ...animation,
          elementId: blockId,
        }))
      );
    }
  });
</script>

{#if canShowBlock}
  {#if css}{@html `<${'style'}  data-id=builderio-block  nonce=${$context.nonce}  >${css}<${'/style'}>`}{/if}

  {#if !blockComponent?.noWrap}
    {#if !repeatItem}
      {#if isEmptyElement(Tag)}
        <svelte:element
          this={Tag}
          {...wrapperAttributes}
          use:setAttrs={wrapperActions}
        />
      {:else if typeof Tag === 'string'}
        <svelte:element
          this={Tag}
          {...wrapperAttributes}
          use:setAttrs={wrapperActions}
          >{#if componentRef}{#if componentRef.load}<Awaiter
                load={componentRef.load}
                fallback={componentRef.fallback}
                props={componentOptions}
                attributes={componentAttributes}
                >{#each componentChildren as child (child.id)}<svelte:self
                    block={child}
                    {context}
                    {registeredComponents}
                    {linkComponent}
                  />{/each}</Awaiter
              >{:else}<svelte:component
                this={componentRef}
                {...componentOptions}
                attributes={componentAttributes}
                >{#each componentChildren as child (child.id)}<svelte:self
                    block={child}
                    {context}
                    {registeredComponents}
                    {linkComponent}
                  />{/each}</svelte:component
              >{/if}{/if}
          {#each childrenWithoutParentComponent as child (child.id)}
            <svelte:self
              block={child}
              {registeredComponents}
              {linkComponent}
              {context}
            />
          {/each}</svelte:element
        >
      {:else}
        <svelte:component
          this={Tag}
          {...wrapperAttributes}
          {...wrapperActions}
          >{#if componentRef}{#if componentRef.load}<Awaiter
                load={componentRef.load}
                fallback={componentRef.fallback}
                props={componentOptions}
                attributes={componentAttributes}
                >{#each componentChildren as child (child.id)}<svelte:self
                    block={child}
                    {context}
                    {registeredComponents}
                    {linkComponent}
                  />{/each}</Awaiter
              >{:else}<svelte:component
                this={componentRef}
                {...componentOptions}
                attributes={componentAttributes}
                >{#each componentChildren as child (child.id)}<svelte:self
                    block={child}
                    {context}
                    {registeredComponents}
                    {linkComponent}
                  />{/each}</svelte:component
              >{/if}{/if}
          {#each childrenWithoutParentComponent as child (child.id)}
            <svelte:self
              block={child}
              {registeredComponents}
              {linkComponent}
              {context}
            />
          {/each}</svelte:component
        >
      {/if}
    {:else}
      {#each repeatItem as data, index (generateKey(index))}
        <RepeatedBlock
          repeatContext={data.context}
          block={data.block}
          {registeredComponents}
          {linkComponent}
        />
      {/each}
    {/if}
  {:else if !repeatItem}
    {#if componentRef}{#if componentRef.load}<Awaiter
          load={componentRef.load}
          fallback={componentRef.fallback}
          props={componentOptions}
          attributes={componentAttributes}
          >{#each componentChildren as child (child.id)}<svelte:self
              block={child}
              {context}
              {registeredComponents}
              {linkComponent}
            />{/each}</Awaiter
        >{:else}<svelte:component
          this={componentRef}
          {...componentOptions}
          attributes={componentAttributes}
          >{#each componentChildren as child (child.id)}<svelte:self
              block={child}
              {context}
              {registeredComponents}
              {linkComponent}
            />{/each}</svelte:component
        >{/if}{/if}
  {:else}
    {#each repeatItem as data, index (generateKey(index))}
      <RepeatedBlock
        repeatContext={data.context}
        block={data.block}
        {registeredComponents}
        {linkComponent}
      />
    {/each}
  {/if}
{/if}
