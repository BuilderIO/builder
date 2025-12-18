<script lang="ts">
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
  import type { PageData } from './$types';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<!-- Your nav goes here -->
<!-- Hero Section -->
{#if data.productHero || isPreviewing()}
  <Content
    model="collection-hero"
    content={data.productHero}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
{:else}
  <div>404</div>
{/if}
<!-- The rest of your page goes here -->
