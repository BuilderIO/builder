<script lang="ts">
  import BlockStyles from "../block-styles.svelte";
  import Block from "../../block.svelte";
  import InteractiveElement from "../interactive-element.svelte";
  import type { ComponentProps } from "./component-ref.helpers.js";
  import { getWrapperProps } from "./component-ref.helpers.js";

  export let isInteractive: ComponentProps["isInteractive"];
  export let componentRef: ComponentProps["componentRef"];
  export let componentOptions: ComponentProps["componentOptions"];
  export let builderBlock: ComponentProps["builderBlock"];
  export let context: ComponentProps["context"];
  export let includeBlockProps: ComponentProps["includeBlockProps"];
  export let blockChildren: ComponentProps["blockChildren"];
  export let registeredComponents: ComponentProps["registeredComponents"];

  let Wrapper = isInteractive ? InteractiveElement : componentRef;
</script>

{#if componentRef}
  <svelte:component
    this={Wrapper}
    {...getWrapperProps({
      componentOptions: componentOptions,
      builderBlock: builderBlock,
      context: context,
      componentRef: componentRef,
      includeBlockProps: includeBlockProps,
      isInteractive: isInteractive,
      contextValue: $context,
    })}
  >
    {#each blockChildren as child ("block-" + child.id)}
      <Block block={child} {context} {registeredComponents} />
    {/each}

    {#each blockChildren as child ("block-style-" + child.id)}
      <BlockStyles block={child} context={$context} />
    {/each}
  </svelte:component>
{/if}