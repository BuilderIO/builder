<!-- Quickstart snippet -->
<!-- snippets/svelte/src/components/CatchAll.svelte -->

<script lang="ts">
  import {
    Content,
    fetchOneEntry,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';

  let apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  let model = 'page';

  let content: BuilderContent | null = $state(null);
  let canShowContent = $state(false);

  async function fetchContent() {
    content = await fetchOneEntry({
      apiKey,
      model,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
    canShowContent = content ? true : isPreviewing();
  }

  fetchContent();
</script>

<svelte:head>
  <title>{content?.data?.title || 'Unpublished'}</title>
</svelte:head>

<main>
  {#if canShowContent}
    <Content {content} {apiKey} {model} />
  {:else}
    Content Not Found
  {/if}
</main>
