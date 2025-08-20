<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    subscribeToEditor,
    isPreviewing,
  } from '@builder.io/sdk-svelte';
  import type { BuilderContent } from '@builder.io/sdk-svelte';

  let content: BuilderContent | null = null;
  let isLoading = true;

  let urlPath = window.location.pathname;
  let canShowContent = false;

  async function fetchContent() {
    content = await fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: {
        urlPath,
      },
    });
    canShowContent = content ? true : isPreviewing();
  }

  onMount(() => {
    fetchContent()
      .catch((err) => {
        console.error('Error fetching Builder content:', err);
      })
      .finally(() => {
        isLoading = false;
      });

    let unsubscribe = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback(updatedContent) {
        content = updatedContent;
      },
    });

    return () => unsubscribe();
  });
</script>

{#if isLoading && !content}
  <div>Loading...</div>
{/if}

<main>
  {#if canShowContent}
    <div class="blog-data-preview">
      <div>Blog Title: {content?.data?.title}</div>
      <div>Authored by: {content?.data?.author}</div>
      <div>Handle: {content?.data?.handle}</div>
    </div>
  {/if}
</main>
