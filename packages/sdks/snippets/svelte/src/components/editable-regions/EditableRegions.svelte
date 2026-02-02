<script lang="ts">
  import { onMount } from 'svelte';
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-svelte';
  import type { BuilderContent } from '@builder.io/sdk-svelte';
  import { CustomColumnsInfo } from './CustomColumnsInfo';

  let loading = $state(true);
  let content: BuilderContent | null = $state();

  let model = 'editable-regions';
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
  <Content {content} {apiKey} {model} customComponents={[CustomColumnsInfo]} />
{/if}
