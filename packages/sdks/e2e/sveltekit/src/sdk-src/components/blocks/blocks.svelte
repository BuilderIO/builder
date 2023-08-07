<script context="module" lang="ts">
  export type BlocksProps = Partial<BlocksWrapperProps> & {
    context?: Writable<BuilderContextInterface>;
    registeredComponents?: RegisteredComponents;
  };
</script>

<script lang="ts">
  import { getContext } from "svelte";

  import BlockStyles from "../block/components/block-styles.svelte";
  import Block from "../block/block.svelte";
  import type { BlocksWrapperProps } from "./blocks-wrapper.svelte";
  import BlocksWrapper from "./blocks-wrapper.svelte";
  import type {
    BuilderContextInterface,
    RegisteredComponents,
  } from "../../context/types.js";
  import BuilderContext from "../../context/builder.context";
  import ComponentsContext from "../../context/components.context";
  import type { Writable } from "svelte/store";

  export let blocks: BlocksProps["blocks"];
  export let parent: BlocksProps["parent"];
  export let path: BlocksProps["path"];
  export let styleProp: BlocksProps["styleProp"];
  export let context: BlocksProps["context"];
  export let registeredComponents: BlocksProps["registeredComponents"];

  let builderContext = getContext(BuilderContext.key);
  let componentsContext = getContext(ComponentsContext.key);
</script>

<BlocksWrapper {blocks} {parent} {path} {styleProp}>
  {#if blocks}
    {#each blocks as block ("render-block-" + block.id)}
      <Block
        {block}
        context={context || builderContext}
        registeredComponents={registeredComponents ||
          componentsContext.registeredComponents}
      />
    {/each}
  {/if}

  {#if blocks}
    {#each blocks as block ("block-style-" + block.id)}
      <BlockStyles {block} context={$context || $builderContext} />
    {/each}
  {/if}
</BlocksWrapper>