<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';

  let content: BuilderContent | null = $state(null);

  const model = 'homepage';
  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  onMount(() => {
    fetchOneEntry({
      model: model,
      apiKey: apiKey,
    }).then((res) => {
      content = res;
    });
  });
</script>

{#if content || isPreviewing()}
  <Content {model} {content} {apiKey} />
{:else}
  <div>404</div>
{/if}
