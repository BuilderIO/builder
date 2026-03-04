<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  import { customHeroInfo } from './CustomHeroInfo';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

{#if !data.data && !isPreviewing(data.searchParams)}
  <div>404 - Not Found</div>
{:else}
  <Content
    content={data.data}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
    model="custom-child"
    customComponents={[customHeroInfo]}
  />
{/if}
