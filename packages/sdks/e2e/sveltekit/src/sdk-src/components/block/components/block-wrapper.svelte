<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  type BlockWrapperProps = {
    Wrapper: string;
    block: BuilderBlock;
    context: Writable<BuilderContextInterface>;
    hasChildren: boolean;
  };

  /**
   * This component renders a block's wrapper HTML element (from the block's `tagName` property).
   * It reuses the exact same logic as the `InteractiveElement` component, but we need to have 2 separate components for
   * Svelte's sake, as it needs to know at compile-time whether to use:
   *  - `<svelte:element>` (for HTML element) or
   *  - `<svelte:component>` (for custom components)
   */
</script>

<script lang="ts">
  import type { PropsWithChildren } from "../../../types/typescript.js";
  import type { BuilderBlock } from "../../../types/builder-block.js";
  import type { BuilderContextInterface } from "../../../context/types.js";
  import { getBlockActions } from "../../../functions/get-block-actions.js";
  import { getBlockProperties } from "../../../functions/get-block-properties.js";
  import { setAttrs } from "../../../blocks/helpers.js";
  import type { Writable } from "svelte/store";

  export let Wrapper: PropsWithChildren<BlockWrapperProps>["Wrapper"];
  export let block: PropsWithChildren<BlockWrapperProps>["block"];
  export let context: PropsWithChildren<BlockWrapperProps>["context"];
  export let hasChildren: PropsWithChildren<BlockWrapperProps>["hasChildren"];
</script>

{#if hasChildren}
  <svelte:element
    this={Wrapper}
    {...getBlockProperties({
      block: block,
      context: $context,
    })}
    use:setAttrs={getBlockActions({
      block: block,
      rootState: $context.rootState,
      rootSetState: $context.rootSetState,
      localState: $context.localState,
      context: $context.context,
      stripPrefix: true,
    })}
  >
    <slot />
  </svelte:element>
{:else}
  <svelte:element
    this={Wrapper}
    {...getBlockProperties({
      block: block,
      context: $context,
    })}
    use:setAttrs={getBlockActions({
      block: block,
      rootState: $context.rootState,
      rootSetState: $context.rootSetState,
      localState: $context.localState,
      context: $context.context,
      stripPrefix: true,
    })}
  />
{/if}