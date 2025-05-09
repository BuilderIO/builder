<!-- Hero.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
  } from '@builder.io/sdk-svelte';
  let productHero: BuilderContent | null = null;

  const MODEL = 'collection-hero';
  const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

  onMount(() => {
    fetchOneEntry({
      model: MODEL,
      apiKey: API_KEY,
      userAttributes: { urlPath: window.location.pathname },
    }).then((data) => {
      productHero = data;
    });
  });
</script>

<!-- Your nav goes here -->
<!-- Hero Section -->
{#if productHero}
  <Content model={MODEL} content={productHero} apiKey={API_KEY} />
{/if}
<!-- The rest of your page goes here -->
