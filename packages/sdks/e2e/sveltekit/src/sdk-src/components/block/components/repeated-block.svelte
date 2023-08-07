<script context="module" lang="ts">
  type Props = {
    block: BuilderBlock;
    repeatContext: BuilderContextInterface;
    registeredComponents: RegisteredComponents;
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import BuilderContext from "../../../context/builder.context";
  import type {
    BuilderContextInterface,
    RegisteredComponents,
  } from "../../../context/types.js";
  import type { BuilderBlock } from "../../../types/builder-block.js";
  import Block from "../block.svelte";

  export let repeatContext: Props["repeatContext"];
  export let block: Props["block"];
  export let registeredComponents: Props["registeredComponents"];

  let store = writable(repeatContext);

  setContext(BuilderContext.key, store);
</script>

<Block {block} context={store} {registeredComponents} />