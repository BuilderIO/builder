<script context="module" lang="ts">
  export type RenderBlockProps = {
    blocks?: BuilderBlock[];
    parent?: string;
    path?: string;
    styleProp?: Record<string, any>;
  };
</script>

<script lang="ts">
  import { getContext } from 'svelte';

  import BuilderContext from '../context/builder.context.js';
  import { isEditing } from '../functions/is-editing.js';
  import type { BuilderBlock } from '../types/builder-block.js';
  import BlockStyles from './render-block/block-styles.svelte';
  import RenderBlock from './render-block/render-block.svelte';

  export let blocks: RenderBlockProps['blocks'];
  export let parent: RenderBlockProps['parent'];
  export let path: RenderBlockProps['path'];
  export let styleProp: RenderBlockProps['styleProp'];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith('--')) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

  let builderContext = getContext(BuilderContext.key);

  function onClick() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.clickEmptyBlocks',
          data: {
            parentElementId: parent,
            dataPath: path,
          },
        },
        '*'
      );
    }
  }
  function onMouseEnter() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.hoverEmptyBlocks',
          data: {
            parentElementId: parent,
            dataPath: path,
          },
        },
        '*'
      );
    }
  }
  $: className = () => {
    return 'builder-blocks' + (!blocks?.length ? ' no-blocks' : '');
  };
</script>

<div
  use:mitosis_styling={styleProp}
  class={className() + ' div'}
  builder-path={path}
  builder-parent-id={parent}
  dataSet={{
    class: className(),
  }}
  on:click={(event) => {
    onClick();
  }}
  on:mouseenter={(event) => {
    onMouseEnter();
  }}
>
  {#if blocks}
    {#each blocks as block ('render-block-' + block.id)}
      <RenderBlock {block} context={builderContext} />
    {/each}
  {/if}

  {#if blocks}
    {#each blocks as block ('block-style-' + block.id)}
      <BlockStyles {block} context={builderContext} />
    {/each}
  {/if}
</div>

<style>
  .div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>
