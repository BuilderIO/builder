<!-- Hero.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
  } from '@builder.io/sdk-svelte';
  let productHero: BuilderContent | null = null;

  onMount(() => {
    fetchOneEntry({
      model: 'collection-hero',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: { urlPath: window.location.pathname },
    }).then((data) => {
      productHero = data;
    });
  });
</script>

<!-- Your nav goes here -->
<!-- Hero Section -->
{#if productHero}
  <Content
    model="collection-hero"
    content={productHero}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
{/if}
<!-- The rest of your page goes here -->
