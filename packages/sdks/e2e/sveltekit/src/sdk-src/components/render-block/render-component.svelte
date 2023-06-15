<script context="module" lang="ts">
  type ComponentOptions = {
    [index: string]: any;
    attributes?: {
      [index: string]: any;
    };
  };

  export interface RenderComponentProps {
    componentRef: any;
    componentOptions: ComponentOptions;
    blockChildren: BuilderBlock[];
    context: BuilderContextInterface;
  }
</script>

<script lang="ts">
  import type { BuilderBlock } from '../../types/builder-block.js';
  import BlockStyles from './block-styles.svelte';
  import RenderBlock from './render-block.svelte';
  import type { BuilderContextInterface } from '../../context/types.js';

  export let componentRef: RenderComponentProps['componentRef'];
  export let componentOptions: RenderComponentProps['componentOptions'];
  export let blockChildren: RenderComponentProps['blockChildren'];
  export let context: RenderComponentProps['context'];
</script>

{#if componentRef}
  <svelte:component this={componentRef} {...componentOptions}>
    {#each blockChildren as child ('render-block-' + child.id)}
      <RenderBlock block={child} {context} />
    {/each}

    {#each blockChildren as child ('block-style-' + child.id)}
      <BlockStyles block={child} {context} />
    {/each}
  </svelte:component>
{/if}
