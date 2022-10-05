<script>
  import { RenderContent } from '@builder.io/sdk-svelte';
  import { getContentForPathname } from '@builder.io/sdks-e2e-tests';

  // TODO: enter your public API key
  const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

  $: content = getContentForPathname();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if content}
    <RenderContent model="page" {content} apiKey={BUILDER_PUBLIC_API_KEY} />
  {:else}
    Content Not Found
  {/if}
</main>
