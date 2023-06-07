<script lang="ts">
  import { RenderContent, processContentResult } from '@builder.io/sdk-svelte';
  import { getProps } from '@builder.io/sdks-e2e-tests';

  let props = undefined;
  const fetch = async () => {
    props = await getProps({ processContentResult });
  };

  fetch();
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
