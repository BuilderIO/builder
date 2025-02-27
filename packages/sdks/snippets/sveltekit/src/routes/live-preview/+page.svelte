<script lang="ts">
  import type { BuilderContent } from '@builder.io/sdk-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { subscribeToEditor } from '@builder.io/sdk-svelte';

  export let data: {
    content: BuilderContent | null;
  };

  let content: BuilderContent | null = data.content;
  let isLoading = !content;

  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    unsubscribe = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback(updatedContent) {
        content = updatedContent;
        isLoading = false;
      },
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

{#if isLoading && !content}
  <div>Loading...</div>
{/if}

{#if content}
  <div class="blog-data-preview">
    <div>Blog Title: {content.data?.title}</div>
    <div>Authored by: {content.data?.author}</div>
    <div>Handle: {content.data?.handle}</div>
  </div>
{/if}
