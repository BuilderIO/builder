<script>
  import { RenderContent } from '@builder.io/sdk-svelte';
  import { getProps } from '@builder.io/sdks-e2e-tests';

  $: props = getProps();
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
