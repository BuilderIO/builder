<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

{#if !data.content && !isPreviewing(data.searchParams)}
  <div>404</div>
{:else}
  <Content
    model="homepage"
    content={data.content}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
{/if}
