<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';

  let content: BuilderContent | null = null;

  const MODEL = 'homepage';
  const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

  onMount(() => {
    fetchOneEntry({
      model: MODEL,
      apiKey: API_KEY,
    }).then((res) => {
      content = res;
    });
  });
</script>

{#if content || isPreviewing()}
  <Content model={MODEL} {content} apiKey={API_KEY} />
{:else}
  <div>404</div>
{/if}
