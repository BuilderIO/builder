<script context="module" lang="ts">
  export type InteractiveElementProps = {
    Wrapper: any;
    block: BuilderBlock;
    context: Writable<BuilderContextInterface>;
    wrapperProps: object;
  };
</script>

<script lang="ts">
  import type { BuilderContextInterface } from "../../../context/types.js";
  import { getBlockActions } from "../../../functions/get-block-actions.js";
  import { getBlockProperties } from "../../../functions/get-block-properties.js";
  import type { BuilderBlock } from "../../../types/builder-block.js";
  import type { PropsWithChildren } from "../../../types/typescript.js";
  import type { Writable } from "svelte/store";

  export let Wrapper: PropsWithChildren<InteractiveElementProps>["Wrapper"];
  export let wrapperProps: PropsWithChildren<InteractiveElementProps>["wrapperProps"];
  export let block: PropsWithChildren<InteractiveElementProps>["block"];
  export let context: PropsWithChildren<InteractiveElementProps>["context"];
</script>

<svelte:component
  this={Wrapper}
  {...wrapperProps}
  attributes={{
    ...getBlockProperties({
      block: block,
      context: $context,
    }),
    ...getBlockActions({
      block: block,
      rootState: $context.rootState,
      rootSetState: $context.rootSetState,
      localState: $context.localState,
      context: $context.context,
    }),
  }}
>
  <slot />
</svelte:component>