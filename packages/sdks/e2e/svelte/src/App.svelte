<script lang="ts">
  import { RenderContent } from '@builder.io/sdk-svelte';
  import { getProps } from '@builder.io/sdks-e2e-tests';
  import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/svelte/src/index';

  $: props = { ...getProps(), customComponents: getCustomComponents() };
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
