<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';

  let content: BuilderContent | null = null;

  onMount(() => {
    fetchOneEntry({
      model: 'homepage',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    }).then((res) => {
      content = res;
    });
  });
</script>

{#if !content && !isPreviewing()}
  <div>404</div>
{:else}
  <Content
    model="homepage"
    {content}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
{/if}
