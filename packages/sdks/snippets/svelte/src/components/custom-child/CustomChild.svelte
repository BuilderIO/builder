<script lang="ts">
  import { onMount } from 'svelte';
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-svelte';
  import type { BuilderContent } from '@builder.io/sdk-svelte';
  import { customHeroInfo } from './CustomHeroInfo';

  let loading = true;
  let content: BuilderContent | null;

  let model = 'custom-child';
  let apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  onMount(() => {
    fetchOneEntry({
      model,
      apiKey,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((data) => {
      content = data;
      loading = false;
    });
  });
</script>

{#if loading}
  <div>Loading...</div>
{:else if !content && !isPreviewing()}
  <div>404 - Not Found</div>
{:else}
  <Content {content} {apiKey} {model} customComponents={[customHeroInfo]} />
{/if}
