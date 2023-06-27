<script context="module" lang="ts">
  type Props = {
    block: BuilderBlock;
    repeatContext: BuilderContextInterface;
  }; // useMetadata({
  //   reactiveValues: {
  //     state: ['store'],
  //   },
  // });

  /**
   * We can't make this a generic `ProvideContext` function because Vue 2 won't support root slots, e.g.
   *
   * ```vue
   * <template>
   *  <slot></slot>
   * </template>
   * ```
   */
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import BuilderContext from '../../context/builder.context.js';
  import type { BuilderContextInterface } from '../../context/types.js';
  import type { BuilderBlock } from '../../types/builder-block';
  import RenderBlock from './render-block.svelte';

  export let repeatContext: Props['repeatContext'];
  export let block: Props['block'];

  let store = writable(repeatContext);

  setContext(BuilderContext.key, store);
</script>

<RenderBlock {block} context={store} />
