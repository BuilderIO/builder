<script context="module" lang="ts">
  export type BlockProps = {
    block: BuilderBlock;
    context: Writable<BuilderContextInterface>;
    registeredComponents: RegisteredComponents;
  };
</script>

<script lang="ts">
  import { writable } from "svelte/store";

  import type {
    BuilderContextInterface,
    RegisteredComponents,
  } from "../../context/types.js";
  import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
  import { getBlockProperties } from "../../functions/get-block-properties.js";
  import { getProcessedBlock } from "../../functions/get-processed-block.js";
  import type { BuilderBlock } from "../../types/builder-block.js";
  import BlockStyles from "./components/block-styles.svelte";
  import {
    getComponent,
    getRepeatItemData,
    isEmptyHtmlElement,
  } from "./block.helpers.js";
  import RepeatedBlock from "./components/repeated-block.svelte";
  import { extractTextStyles } from "../../functions/extract-text-styles.js";
  import ComponentRef from "./components/component-ref/component-ref.svelte";
  import type { ComponentProps } from "./components/component-ref/component-ref.helpers.js";
  import BlockWrapper from "./components/block-wrapper.svelte";
  import type { Writable } from "svelte/store";

  export let block: BlockProps["block"];
  export let context: BlockProps["context"];
  export let registeredComponents: BlockProps["registeredComponents"];

  $: blockComponent = () => {
    return getComponent({
      block: block,
      context: $context,
      registeredComponents: registeredComponents,
    });
  };
  $: repeatItem = () => {
    return getRepeatItemData({
      block: block,
      context: $context,
    });
  };
  $: processedBlock = () => {
    return repeatItem()
      ? block
      : getProcessedBlock({
          block: block,
          localState: $context.localState,
          rootState: $context.rootState,
          rootSetState: $context.rootSetState,
          context: $context.context,
          shouldEvaluateBindings: true,
        });
  };
  $: Tag = () => {
    return block.tagName || "div";
  };
  $: canShowBlock = () => {
    if ("hide" in processedBlock()) {
      return !processedBlock().hide;
    }
    if ("show" in processedBlock()) {
      return processedBlock().show;
    }
    return true;
  };
  $: childrenWithoutParentComponent = () => {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !blockComponent?.()?.component && !repeatItem();
    return shouldRenderChildrenOutsideRef
      ? processedBlock().children ?? []
      : [];
  };
  $: componentRefProps = () => {
    return {
      blockChildren: processedBlock().children ?? [],
      componentRef: blockComponent?.()?.component,
      componentOptions: {
        ...getBlockComponentOptions(processedBlock()),
        builderContext: context,
        ...(blockComponent?.()?.name === "Symbol" ||
        blockComponent?.()?.name === "Columns"
          ? {
              builderComponents: registeredComponents,
            }
          : {}),
      },
      context: childrenContext,
      registeredComponents: registeredComponents,
      builderBlock: processedBlock(),
      includeBlockProps: blockComponent?.()?.noWrap === true,
      isInteractive: !blockComponent?.()?.isRSC,
    };
  };

  let childrenContext = writable($context);
</script>

{#if canShowBlock()}
  {#if !blockComponent?.()?.noWrap}
    {#if isEmptyHtmlElement(Tag())}
      <BlockWrapper
        Wrapper={Tag()}
        block={processedBlock()}
        {context}
        hasChildren={false}
      />
    {/if}

    {#if !isEmptyHtmlElement(Tag()) && repeatItem()}
      {#each repeatItem() as data, index (index)}
        <RepeatedBlock
          repeatContext={data.context}
          block={data.block}
          {registeredComponents}
        />
      {/each}
    {/if}

    {#if !isEmptyHtmlElement(Tag()) && !repeatItem()}
      <BlockWrapper
        Wrapper={Tag()}
        block={processedBlock()}
        {context}
        hasChildren={true}
      >
        <ComponentRef {...componentRefProps()} />

        {#each childrenWithoutParentComponent() as child ("block-" + child.id)}
          <svelte:self
            block={child}
            context={childrenContext}
            {registeredComponents}
          />
        {/each}

        {#each childrenWithoutParentComponent() as child ("block-style-" + child.id)}
          <BlockStyles block={child} context={$childrenContext} />
        {/each}
      </BlockWrapper>
    {/if}
  {:else}
    <ComponentRef {...componentRefProps()} />
  {/if}
{/if}