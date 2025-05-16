<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  export let data: PageData;
</script>

{#if !data.content && !isPreviewing()}
  <div>404</div>
{:else}
  <Content
    model="homepage"
    content={data.content}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
{/if}
