<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  import { customHeroInfo } from './CustomHeroInfo';

  export let data: PageData;
</script>

{#if !data.data && !isPreviewing()}
  <div>404 - Not Found</div>
{:else}
  <Content
    content={data.data}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
    model="custom-child"
    customComponents={[customHeroInfo]}
  />
{/if}
