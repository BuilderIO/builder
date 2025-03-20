<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  import { CustomTabsInfo } from './CustomTabsInfo';

  export let data: PageData;
</script>

{#if !data.data && !isPreviewing()}
  <div>404 - Not Found</div>
{:else}
  <Content
    content={data.data}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
    model="advanced-child"
    customComponents={[CustomTabsInfo]}
  />
{/if}
