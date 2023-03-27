<script lang="ts">
  import { RenderContent } from '@builder.io/sdk-svelte';
  import { getAllProps } from './helper';

  $: props = getAllProps();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if props}
    <RenderContent {...props} />
  {:else}
    Content Not Found
  {/if}
</main>
