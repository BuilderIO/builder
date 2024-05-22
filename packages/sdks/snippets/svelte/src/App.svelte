<!-- Quickstart snippet -->
<!-- snippets/svelte/src/App.svelte -->

<script lang="ts">
  import { Content, fetchOneEntry, type BuilderContent } from '@builder.io/sdk-svelte';

  let apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';
  let model = 'page';

  let content: BuilderContent | null = null;

  async function fetchContent() {
    content = await fetchOneEntry({
      apiKey,
      model,
      userAttributes: {
        urlPath: window.location.pathname
      }
    });
  }

  fetchContent();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if content}
    <Content content={content} apiKey={apiKey} model={model}  />
  {:else}
    Content Not Found
  {/if}
</main>
