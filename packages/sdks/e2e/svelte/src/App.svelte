<script lang="ts">
  import { Content, _processContentResult } from '@builder.io/sdk-svelte';
  import { getProps } from '@e2e/tests';

  let props = undefined;
  const fetch = async () => {
    props = await getProps({ _processContentResult });
  };

  fetch();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if props}
    <Content {...props} />
  {:else}
    Content Not Found
  {/if}
</main>
