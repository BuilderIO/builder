<script lang="ts">
  import { Content, _processContentResult, fetchOneEntry } from '@builder.io/sdk-svelte';

  let props = null;
  let apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';
  let model = 'page';

  const fetch = async () => {
    const content = await fetchOneEntry({
      apiKey,
      model,
      userAttributes: {
        url: location.pathname
      }
    });
    props = {
      content,
      model,
      apiKey
    }
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
